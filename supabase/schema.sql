-- =====================================================================
-- CopyLaju — skema pangkalan data Supabase
-- Cara guna: Supabase Dashboard → SQL Editor → New query → tampal SEMUA
-- kandungan fail ini → Run. Selamat dijalankan semula (idempotent).
-- =====================================================================

-- ---------- Jadual profil pengguna ----------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  full_name       text,
  phone           text,
  plan            text,                         -- '1bulan' | '3bulan' | '1tahun' | null
  plan_expires_at timestamptz,                  -- tarikh tamat pakej
  monthly_quota   int  not null default 0,      -- had jana sebulan ikut pakej
  used            int  not null default 0,      -- jumlah dah guna dalam tempoh semasa
  period_start    timestamptz,                  -- mula tempoh kuota bulanan
  free_credits    int  not null default 1,      -- kredit percuma semasa daftar
  created_at      timestamptz not null default now()
);

-- ---------- Jadual pesanan / bayaran ----------
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  ref         text unique not null,             -- rujukan dihantar ke ToyyibPay (order_id)
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan        text not null,
  amount_sen  int  not null,                    -- jumlah dalam sen (3990 = RM39.90)
  bill_code   text unique,
  status      text not null default 'pending',  -- pending | paid | failed
  toyyib_refno text,
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);

-- ---------- Jadual sejarah copy yang dijana ----------
create table if not exists public.generations (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  input      jsonb not null,
  output     jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists generations_user_idx on public.generations(user_id, created_at desc);

-- ---------- Row Level Security: pengguna hanya nampak data sendiri ----------
alter table public.profiles    enable row level security;
alter table public.orders      enable row level security;
alter table public.generations enable row level security;

drop policy if exists "profil sendiri" on public.profiles;
create policy "profil sendiri" on public.profiles for select using ((select auth.uid()) = id);

drop policy if exists "pesanan sendiri" on public.orders;
create policy "pesanan sendiri" on public.orders for select using ((select auth.uid()) = user_id);

drop policy if exists "sejarah sendiri" on public.generations;
create policy "sejarah sendiri" on public.generations for select using ((select auth.uid()) = user_id);
-- Tiada polisi insert/update: semua penulisan dibuat oleh server (service role) sahaja.

-- ---------- Cipta profil automatik bila pengguna daftar ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Guna 1 kredit (atomik) ----------
-- Pulangkan 'plan' jika guna kuota pakej, 'free' jika guna kredit percuma,
-- 'none' jika tiada baki.
create or replace function public.consume_credit(p_user uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  p public.profiles%rowtype;
begin
  select * into p from public.profiles where id = p_user for update;
  if not found then return 'none'; end if;

  if p.plan_expires_at is not null and p.plan_expires_at > now() then
    -- Set semula kuota setiap 30 hari selagi pakej aktif
    if p.period_start is null or now() >= p.period_start + interval '30 days' then
      update public.profiles set period_start = now(), used = 0 where id = p_user;
      p.used := 0;
    end if;
    if p.used < p.monthly_quota then
      update public.profiles set used = used + 1 where id = p_user;
      return 'plan';
    end if;
  end if;

  if p.free_credits > 0 then
    update public.profiles set free_credits = free_credits - 1 where id = p_user;
    return 'free';
  end if;

  return 'none';
end $$;

-- ---------- Pulangkan kredit jika AI gagal ----------
create or replace function public.refund_credit(p_user uuid, p_source text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_source = 'plan' then
    update public.profiles set used = greatest(used - 1, 0) where id = p_user;
  elsif p_source = 'free' then
    update public.profiles set free_credits = free_credits + 1 where id = p_user;
  end if;
end $$;

-- ---------- Aktifkan pakej selepas bayaran berjaya (idempotent) ----------
create or replace function public.activate_order(p_ref text, p_refno text, p_days int, p_quota int)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
  p public.profiles%rowtype;
  was_active boolean;
begin
  select * into o from public.orders where ref = p_ref for update;
  if not found then return false; end if;
  if o.status = 'paid' then return true; end if;   -- sudah diproses

  update public.orders
     set status = 'paid', paid_at = now(), toyyib_refno = p_refno
   where id = o.id;

  select * into p from public.profiles where id = o.user_id for update;
  was_active := p.plan_expires_at is not null and p.plan_expires_at > now();

  update public.profiles
     set plan            = o.plan,
         plan_expires_at = greatest(coalesce(p.plan_expires_at, now()), now()) + make_interval(days => p_days),
         monthly_quota   = greatest(p_quota, case when was_active then p.monthly_quota else 0 end),
         period_start    = case when was_active then p.period_start else now() end,
         used            = case when was_active then p.used else 0 end
   where id = o.user_id;

  return true;
end $$;

-- Hanya server (service role) boleh panggil fungsi kredit/bayaran
revoke execute on function public.consume_credit(uuid)              from public, anon, authenticated;
revoke execute on function public.refund_credit(uuid, text)         from public, anon, authenticated;
revoke execute on function public.activate_order(text, text, int, int) from public, anon, authenticated;
grant  execute on function public.consume_credit(uuid)              to service_role;
grant  execute on function public.refund_credit(uuid, text)         to service_role;
grant  execute on function public.activate_order(text, text, int, int) to service_role;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
