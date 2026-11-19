// Logik pengaktifan pakej selepas bayaran (SERVER SAHAJA)
import { supabaseAdmin } from "./supabase-admin";
import { getPaidTransaction, amountToSen } from "./toyyibpay";
import { getPlan } from "./plans";

// Semak dengan ToyyibPay, dan jika sudah dibayar → aktifkan pakej.
// Selamat dipanggil berkali-kali (callback + halaman selesai).
export async function verifyAndActivate(order) {
  if (!order || !order.bill_code) return "pending";
  if (order.status === "paid") return "paid";

  const plan = getPlan(order.plan);
  if (!plan) return "pending";

  const tx = await getPaidTransaction(order.bill_code);
  if (!tx) return "pending";

  // Pastikan jumlah dibayar sama dengan harga pesanan
  if (amountToSen(tx.billpaymentAmount) < order.amount_sen) {
    console.error("Jumlah bayaran tidak sepadan", order.ref, tx.billpaymentAmount);
    return "pending";
  }

  const { error } = await supabaseAdmin().rpc("activate_order", {
    p_ref: order.ref,
    p_refno: String(tx.billpaymentInvoiceNo || tx.billpaymentRefNo || ""),
    p_days: plan.days,
    p_quota: plan.quota,
  });
  if (error) {
    console.error("activate_order gagal", error);
    return "pending";
  }
  return "paid";
}
