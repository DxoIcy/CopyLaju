// Integrasi ToyyibPay (SERVER SAHAJA)
// Dokumentasi: https://toyyibpay.com/apireference/

export function toyyibBase() {
  return process.env.TOYYIBPAY_SANDBOX === "true"
    ? "https://dev.toyyibpay.com"
    : "https://toyyibpay.com";
}

// ToyyibPay hanya terima huruf, nombor, ruang dan _ untuk nama/penerangan bil
function safe(s, max) {
  return String(s).replace(/[^A-Za-z0-9 _]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function createBill({ ref, plan, user, name, phone, returnUrl, callbackUrl }) {
  const form = new URLSearchParams({
    userSecretKey: process.env.TOYYIBPAY_SECRET_KEY,
    categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE,
    billName: safe(`${process.env.NEXT_PUBLIC_APP_NAME || "CopyLaju"} ${plan.name}`, 30),
    billDescription: safe(`Langganan ${plan.name} ${plan.days} hari`, 100),
    billPriceSetting: "1",
    billPayorInfo: "1",
    billAmount: String(plan.price_sen),
    billReturnUrl: returnUrl,
    billCallbackUrl: callbackUrl,
    billExternalReferenceNo: ref,
    billTo: name || user.email,
    billEmail: user.email,
    billPhone: phone,
    billPaymentChannel: "2", // FPX + kad kredit
    billExpiryDays: "3",
  });

  const res = await fetch(`${toyyibBase()}/index.php/api/createBill`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  // ToyyibPay pulangkan HTTP 200 walaupun gagal — semak kandungan
  let data;
  try { data = JSON.parse(text); } catch (_) {
    throw new Error("ToyyibPay: " + text.slice(0, 200));
  }
  const billCode = Array.isArray(data) ? data[0]?.BillCode : null;
  if (!billCode) throw new Error("ToyyibPay: " + text.slice(0, 200));
  return { billCode, paymentUrl: `${toyyibBase()}/${billCode}` };
}

// Semak status sebenar bil terus dari ToyyibPay (sumber paling dipercayai)
export async function getPaidTransaction(billCode) {
  const form = new URLSearchParams({
    billCode,
    userSecretKey: process.env.TOYYIBPAY_SECRET_KEY,
  });
  const res = await fetch(`${toyyibBase()}/index.php/api/getBillTransactions`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  let list;
  try { list = JSON.parse(text); } catch (_) { return null; }
  if (!Array.isArray(list)) return null;
  // billpaymentStatus: 1 = berjaya
  return list.find((t) => String(t.billpaymentStatus) === "1") || null;
}

// Tukar "RM39.90" / "39.90" kepada sen
export function amountToSen(v) {
  const n = parseFloat(String(v ?? "").replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
}
