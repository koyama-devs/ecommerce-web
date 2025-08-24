import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import i18n from "i18next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PaymentForm from "./PaymentForm";

// import font đã convert (base64)
import "../fonts/NotoSans-base64.js";
import "../fonts/NotoSans-Italic-base64.js";
import "../fonts/NotoSansJP-base64.js";

const stripePromise = loadStripe(
  "pk_test_51RvvuRJhVUeatzaxarReCCkpJ9HCqqnUjnOXlweugIBgyPqC9cOPiY0qZDQyiLq4ZEar8tl0prRZXOljOPSXYOFL00OVyMDP7l"
);

export type CartItem = { name: string; quantity: number; price: number };
export type StoreInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId?: string;
  logoUrl?: string;
};
export type InvoiceData = {
  store: StoreInfo;
  invoice: {
    invoiceNumber: string;
    date: string;
    orderId: string;
    paymentMethod: string;
    paymentStatus: string;
  };
  customer: {
    name: string;
    phone?: string;
    email?: string;
    shippingAddress?: string;
    customerId?: string;
  };
  items: CartItem[];
  totals: {
    subtotal: number;
    tax: number;
    shippingFee: number;
    discount: number;
    grandTotal: number;
    currency?: string;
    vatRate?: number;
  };
  extras?: { terms?: string; thanksNote?: string; signer?: string };
};

// --- helper chọn font theo ngôn ngữ ---
function getFontsByLang(lang: string) {
  if (lang === "ja") {
    return {
      base: "NotoSansJP",
      italic: "NotoSansJP", // Nhật không dùng italic riêng
    };
  }
  return {
    base: "NotoSans",
    italic: "NotoSans-Italic",
  };
}

const formatCurrency = (n: number, currency: string = "JPY") =>
  `${new Intl.NumberFormat("ja-JP").format(Math.round(n))} ${currency}`;

async function loadImageAsDataURL(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export async function generateInvoicePDF(data: InvoiceData) {
  const t = i18n.t; // shortcut
  const lang = i18n.language;
  const { base: baseFont, italic: italicFont } = getFontsByLang(lang);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 50;

  doc.setFont(baseFont, "normal");

  // === Logo + Tiêu đề ===
  const logoDataUrl = await loadImageAsDataURL(data.store.logoUrl);
  if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, y, 80, 80);

  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text(t("invoicePdf.title"), pageWidth / 2, y + 30, { align: "center" });

  doc.setFontSize(10);
  const storeLines = [
    data.store.name,
    data.store.address,
    `${t("invoicePdf.phone")}: ${data.store.phone} | ${t("invoicePdf.email")}: ${data.store.email}`,
    data.store.taxId ? `${t("invoicePdf.taxId")}: ${data.store.taxId}` : "",
  ].filter(Boolean);

  let storeY = y + 100;
  storeLines.forEach((line, idx) => doc.text(line, marginX, storeY + idx * 14));
  y = storeY + storeLines.length * 14 + 20;

  // === Thông tin hóa đơn + khách hàng ===
  const invoiceInfo = [
    [t("invoicePdf.no"), data.invoice.invoiceNumber],
    [t("invoicePdf.date"), data.invoice.date],
    [t("invoicePdf.orderId"), data.invoice.orderId],
    [t("invoicePdf.paymentMethod"), data.invoice.paymentMethod],
    [t("invoicePdf.status"), data.invoice.paymentStatus],
  ];
  const customerInfo = [
    [t("invoicePdf.customer.name"), data.customer.name],
    data.customer.phone ? [t("invoicePdf.customer.phone"), data.customer.phone] : null,
    data.customer.email ? [t("invoicePdf.customer.email"), data.customer.email] : null,
    data.customer.shippingAddress ? [t("invoicePdf.customer.address"), data.customer.shippingAddress] : null,
    data.customer.customerId ? [t("invoicePdf.customer.id"), data.customer.customerId] : null,
  ].filter(Boolean) as [string, string][];

  const formattedInvoiceInfo = invoiceInfo.map(([label, value]) => [
    { content: label, styles: { font: baseFont, fontStyle: "normal" as const } },
    { content: value, styles: { font: baseFont, fontStyle: "normal" as const } },
  ]);

  const formattedCustomerInfo = customerInfo.map(([label, value]) => [
    { content: label, styles: { font: baseFont, fontStyle: "normal" as const } },
    { content: value, styles: { font: baseFont, fontStyle: "normal" as const } },
  ]);

  const body = invoiceInfo.map((_, i) => [
    formattedInvoiceInfo[i]?.[0] || "",
    formattedInvoiceInfo[i]?.[1] || "",
    formattedCustomerInfo[i]?.[0] || "",
    formattedCustomerInfo[i]?.[1] || "",
  ]);

  const usablePageWidth = pageWidth - marginX * 2;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [[
      { content: t("invoicePdf.invoiceInfo"), colSpan: 2 },
      { content: t("invoicePdf.customerInfo"), colSpan: 2 },
    ]],
    body,
    theme: "grid",
    styles: {
      font: baseFont,
      fontStyle: "normal",
      fontSize: 10,
      cellPadding: 4,
      valign: "top",
    },
    headStyles: {
      halign: "left",
      font: baseFont,
      fontStyle: "normal",
      fontSize: 11,
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: usablePageWidth * 0.15, halign: "left" },
      1: { cellWidth: usablePageWidth * 0.35, halign: "left" },
      2: { cellWidth: usablePageWidth * 0.15, halign: "left" },
      3: { cellWidth: usablePageWidth * 0.35, halign: "left" },
    },
  });

  // === Bảng sản phẩm ===
  const tableStartY = (doc as any).lastAutoTable.finalY + 20;
  autoTable(doc, {
    startY: tableStartY,
    head: [[
      { content: t("invoicePdf.products.index"), styles: { halign: "center" } },
      { content: t("invoicePdf.products.name"), styles: { halign: "center" } },
      { content: t("invoicePdf.products.qty"), styles: { halign: "center" } },
      { content: t("invoicePdf.products.unitPrice"), styles: { halign: "right" } },
      { content: t("invoicePdf.products.total"), styles: { halign: "right" } },
    ]],
    body: data.items.map((it, idx) => [
      String(idx + 1),
      it.name,
      String(it.quantity),
      formatCurrency(it.price, data.totals.currency || "JPY"),
      formatCurrency(it.price * it.quantity, data.totals.currency || "JPY"),
    ]),
    theme: "striped",
    styles: { font: baseFont, fontStyle: "normal", fontSize: 10, cellPadding: 6 },
    headStyles: {
      font: baseFont,
      fontStyle: "normal",
      fontSize: 11,
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 40 },
      1: { halign: "center" },
      2: { halign: "center", cellWidth: 50 },
      3: { halign: "right", cellWidth: 80 },
      4: { halign: "right", cellWidth: 100 },
    },
    tableWidth: "auto",
  });

  // === Tổng kết thanh toán ===
  const afterTableY = (doc as any).lastAutoTable.finalY + 30;
  const summaryX = pageWidth - marginX - 250;
  const summaryWidth = 250;
  const currency = data.totals.currency || "JPY";

  doc.setDrawColor(200);
  doc.rect(summaryX, afterTableY, summaryWidth, 140);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(t("invoicePdf.summary"), summaryX + 10, afterTableY + 20);

  const summary = [
    [t("invoicePdf.subtotal"), formatCurrency(data.totals.subtotal, currency)],
    [
      `${t("invoicePdf.tax")}${data.totals.vatRate ? ` (${Math.round(data.totals.vatRate * 100)}%)` : ""}:`,
      formatCurrency(data.totals.tax, currency),
    ],
    [t("invoicePdf.shipping"), formatCurrency(data.totals.shippingFee, currency)],
    [t("invoicePdf.discount"), `- ${formatCurrency(data.totals.discount, currency)}`],
  ];

  let yy = afterTableY + 40;
  summary.forEach(([label, value]) => {
    doc.text(label, summaryX + 10, yy);
    doc.text(value, summaryX + summaryWidth - 10, yy, { align: "right" });
    yy += 16;
  });

  doc.setLineWidth(0.5);
  doc.line(summaryX + 10, yy, summaryX + summaryWidth - 10, yy);
  yy += 25;

  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text(t("invoicePdf.grandTotal"), summaryX + 10, yy);

  doc.setTextColor(255, 87, 34);
  doc.text(formatCurrency(data.totals.grandTotal, currency), summaryX + summaryWidth - 10, yy, {
    align: "right",
  });
  doc.setTextColor(0, 0, 0);
  doc.setFont(baseFont, "normal");

  // === Chữ ký ===
  const blockY = yy + 60;
  const colRight = pageWidth / 2 + 20;
  const signer = data.extras?.signer || data.store.name;

  doc.setFontSize(11);
  doc.text(t("invoicePdf.signature"), colRight, blockY);
  doc.text("__________________________", colRight, blockY + 24);
  doc.text(signer, colRight, blockY + 40);

  // === Điều khoản ===
  const terms = data.extras?.terms || t("invoicePdf.termsDefault");
  doc.setTextColor(255, 0, 0);
  doc.setFontSize(10);
  doc.setFont(baseFont, "normal");
  doc.text(terms, marginX, blockY + 80, { maxWidth: pageWidth - 2 * marginX });
  doc.setTextColor(0, 0, 0);

  // === Lời cảm ơn ===
  const thanks = data.extras?.thanksNote || t("invoicePdf.thanksDefault");
  doc.setFontSize(11);
  doc.setFont(italicFont, "italic");
  doc.text(thanks, marginX, blockY + 110, { maxWidth: pageWidth - 2 * marginX });

  //doc.save(`Invoice_${data.invoice.invoiceNumber}.pdf`);
  // ✅ Trả về blob
  return doc.output("blob");
}

export default function CheckoutButton({
  totalPrice,
  cartItems,
  storeInfo,
  taxRate = 0.1,
  shippingFee = 0,
  discount = 0,
  onSuccess,
}: {
  totalPrice: number;
  cartItems: CartItem[];
  storeInfo: StoreInfo;
  taxRate?: number;
  shippingFee?: number;
  discount?: number;
  onSuccess: (invoice: InvoiceData) => void;
}) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        totalPrice={totalPrice}
        cartItems={cartItems}
        storeInfo={storeInfo}
        taxRate={taxRate}
        shippingFee={shippingFee}
        discount={discount}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
