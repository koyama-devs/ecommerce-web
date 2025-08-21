import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PaymentForm from "./PaymentForm";

// import font đã convert
import "../fonts/NotoSans-base64.js";
import "../fonts/NotoSans-Italic-base64.js";

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
    paymentStatus: "Đã thanh toán" | "Chưa thanh toán";
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
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 50;

  doc.setFont("NotoSans", "normal");

  // === Logo + Tiêu đề ===
  const logoDataUrl = await loadImageAsDataURL(data.store.logoUrl);
  if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, y, 80, 80);

  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text("HÓA ĐƠN THANH TOÁN", pageWidth / 2, y + 30, { align: "center" });

  doc.setFontSize(10);
  const storeLines = [
    data.store.name,
    data.store.address,
    `ĐT: ${data.store.phone} | Email: ${data.store.email}`,
    data.store.taxId ? `MST: ${data.store.taxId}` : "",
  ].filter(Boolean);

  let storeY = y + 100;
  storeLines.forEach((line, idx) => doc.text(line, marginX, storeY + idx * 14));
  y = storeY + storeLines.length * 14 + 20;

  // === Thông tin hóa đơn + khách hàng ===
  const invoiceInfo = [
    ["Số hóa đơn", data.invoice.invoiceNumber],
    ["Ngày lập", data.invoice.date],
    ["Mã đơn hàng", data.invoice.orderId],
    ["Hình thức thanh toán", data.invoice.paymentMethod],
    ["Trạng thái", data.invoice.paymentStatus],
  ];
  const customerInfo = [
    ["Họ tên", data.customer.name],
    data.customer.phone ? ["Điện thoại", data.customer.phone] : null,
    data.customer.email ? ["Email", data.customer.email] : null,
    data.customer.shippingAddress ? ["Đ/c giao hàng", data.customer.shippingAddress] : null,
    data.customer.customerId ? ["Mã KH", data.customer.customerId] : null,
  ].filter(Boolean) as [string, string][];

  const formattedInvoiceInfo = invoiceInfo.map(([label, value]) => [
    { content: label, styles: { font: "NotoSans", fontStyle: "normal" as const } },
    { content: value, styles: { font: "NotoSans", fontStyle: "normal" as const } },
  ]);

  const formattedCustomerInfo = customerInfo.map(([label, value]) => [
    { content: label, styles: { font: "NotoSans", fontStyle: "normal" as const } },
    { content: value, styles: { font: "NotoSans", fontStyle: "normal" as const } },
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
      { content: "Thông tin hóa đơn", colSpan: 2 },
      { content: "Thông tin khách hàng", colSpan: 2 },
    ]],
    body,
    theme: "grid",
    styles: {
      font: "NotoSans",
      fontStyle: "normal",
      fontSize: 10,
      cellPadding: 4,
      valign: "top",
    },
    headStyles: {
      halign: "left",
      font: "NotoSans",
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
      { content: "STT", styles: { halign: "center" } },
      { content: "Tên sản phẩm", styles: { halign: "center" } },
      { content: "SL", styles: { halign: "center" } },
      { content: "Đơn giá", styles: { halign: "right" } },
      { content: "Thành tiền", styles: { halign: "right" } },
    ]],
    body: data.items.map((it, idx) => [
      String(idx + 1),
      it.name,
      String(it.quantity),
      formatCurrency(it.price, data.totals.currency || "JPY"),
      formatCurrency(it.price * it.quantity, data.totals.currency || "JPY"),
    ]),
    theme: "striped",
    styles: { font: "NotoSans", fontStyle: "normal", fontSize: 10, cellPadding: 6 },
    headStyles: {
      font: "NotoSans",
      fontStyle: "normal",
      fontSize: 11,
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 40 },   // STT
      1: { halign: "center" },                    // Tên sản phẩm
      2: { halign: "center", cellWidth: 50 },   // SL
      3: { halign: "right", cellWidth: 80 },    // Đơn giá
      4: { halign: "right", cellWidth: 100 },   // Thành tiền
    },
    tableWidth: "auto",
  });

  // === Tổng kết thanh toán ===
  const afterTableY = (doc as any).lastAutoTable.finalY + 30;
  const summaryX = pageWidth - marginX - 250;
  const summaryWidth = 250;
  const currency = data.totals.currency || "JPY";

  doc.setDrawColor(200);
  doc.rect(summaryX, afterTableY, summaryWidth, 140); // tăng chiều cao box thêm 10px

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Tổng kết thanh toán", summaryX + 10, afterTableY + 20);

  const summary = [
    ["Tạm tính:", formatCurrency(data.totals.subtotal, currency)],
    [
      `Thuế${data.totals.vatRate ? ` (${Math.round(data.totals.vatRate * 100)}%)` : ""}:`,
      formatCurrency(data.totals.tax, currency),
    ],
    ["Phí vận chuyển:", formatCurrency(data.totals.shippingFee, currency)],
    ["Giảm giá:", `- ${formatCurrency(data.totals.discount, currency)}`],
  ];

  let yy = afterTableY + 40;
  summary.forEach(([label, value]) => {
    doc.text(label, summaryX + 10, yy);
    doc.text(value, summaryX + summaryWidth - 10, yy, { align: "right" });
    yy += 16;
  });

  // Đường phân cách trước TỔNG CỘNG
  doc.setLineWidth(0.5);
  doc.line(summaryX + 10, yy, summaryX + summaryWidth - 10, yy);
  yy += 25; // chừa thêm khoảng cách

  // In TỔNG CỘNG
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("TỔNG CỘNG:", summaryX + 10, yy);

  doc.setTextColor(255, 87, 34); // màu cam cho số tiền
  doc.text(formatCurrency(data.totals.grandTotal, currency), summaryX + summaryWidth - 10, yy, {
    align: "right",
  });
  doc.setTextColor(0, 0, 0); // reset màu về mặc định
  doc.setFont("NotoSans", "normal");

  // === Chữ ký ===
  const blockY = yy + 60;
  const colRight = pageWidth / 2 + 20;
  const signer = data.extras?.signer || data.store.name;

  doc.setFontSize(11);
  doc.text("Đại diện bên bán (chữ ký):", colRight, blockY);
  doc.text("__________________________", colRight, blockY + 24);
  doc.text(signer, colRight, blockY + 40);

  // === Điều khoản ===
  const terms =
    data.extras?.terms ||
    "※ Đổi trả trong vòng 7 ngày với sản phẩm còn nguyên tem/mác (không áp dụng cho hàng giảm giá sâu hoặc đã qua sử dụng).";
  doc.setTextColor(255, 0, 0);
  doc.setFontSize(10);
  doc.setFont("NotoSans", "normal");
  doc.text(terms, marginX, blockY + 80, { maxWidth: pageWidth - 2 * marginX });
  doc.setTextColor(0, 0, 0);

  // === Lời cảm ơn ===
  const thanks =
    data.extras?.thanksNote ||
    "Cảm ơn quý khách đã mua hàng! Nếu cần hỗ trợ, vui lòng liên hệ hotline hoặc email của cửa hàng. Xin chào và hẹn gặp lại quý khách trong những đơn hàng tiếp theo.";
  doc.setFontSize(11);
  doc.setFont("NotoSans-Italic", "italic");
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
