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

const formatJPY = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Math.round(n));

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

  // === Thông tin hóa đơn + khách hàng (dùng autoTable 2 cột) ===
  const invoiceInfo = [
    ["Số hóa đơn:", data.invoice.invoiceNumber],
    ["Ngày lập:", data.invoice.date],
    ["Mã đơn hàng:", data.invoice.orderId],
    ["Hình thức thanh toán:", data.invoice.paymentMethod],
    ["Trạng thái:", data.invoice.paymentStatus],
  ];
  const customerInfo = [
    ["Họ tên:", data.customer.name],
    data.customer.phone ? ["Điện thoại:", data.customer.phone] : null,
    data.customer.email ? ["Email:", data.customer.email] : null,
    data.customer.shippingAddress ? ["Đ/c giao hàng:", data.customer.shippingAddress] : null,
    data.customer.customerId ? ["Mã KH:", data.customer.customerId] : null,
  ].filter(Boolean) as [string, string][];

  autoTable(doc, {
    startY: y,
    head: [["Thông tin hóa đơn", "Thông tin khách hàng"]],
    body: invoiceInfo.map((row, i) => [
      `${row[0]} ${row[1]}`,
      customerInfo[i] ? `${customerInfo[i][0]} ${customerInfo[i][1]}` : "",
    ]),
    theme: "grid",
    styles: { 
      font: "NotoSans", 
      fontStyle: "normal", 
      fontSize: 10, 
      cellPadding: 4, 
      valign: "top" 
    },
    headStyles: { 
      font: "NotoSans",      // 👈 ép dùng font embed
      fontStyle: "normal", 
      fontSize: 11, 
      fillColor: [230, 230, 230], 
      textColor: [0, 0, 0] 
    },
    columnStyles: {
      0: { cellWidth: pageWidth / 2 - marginX, halign: "left" },
      1: { cellWidth: pageWidth / 2 - marginX, halign: "left" },
    },
  });


  // === Bảng sản phẩm ===
  const tableStartY = (doc as any).lastAutoTable.finalY + 20;
  autoTable(doc, {
    startY: tableStartY,
    head: [["STT", "Tên sản phẩm", "SL", "Đơn giá", "Thành tiền"]],
    body: data.items.map((it, idx) => [
      String(idx + 1),
      it.name,
      String(it.quantity),
      formatJPY(it.price),
      formatJPY(it.price * it.quantity),
    ]),
    theme: "striped",
    styles: { font: "NotoSans", fontStyle: "normal", fontSize: 10, cellPadding: 6 },
    headStyles: { font: "NotoSans", fontStyle: "normal", fillColor: [33, 150, 243] },
    columnStyles: {
      0: { halign: "center", cellWidth: 40 },
      2: { halign: "center", cellWidth: 60 },
      3: { halign: "right", cellWidth: 90 },
      4: { halign: "right", cellWidth: 110 },
    },
  });

  // === Tổng kết thanh toán ===
  const afterTableY = (doc as any).lastAutoTable.finalY + 30;
  const summaryX = pageWidth - marginX - 250;
  const summaryWidth = 250;

  doc.setDrawColor(200);
  doc.rect(summaryX, afterTableY, summaryWidth, 120);

  doc.setFontSize(12);
  doc.text("Tổng kết thanh toán", summaryX + 10, afterTableY + 20);
  const summary = [
    ["Tạm tính:", formatJPY(data.totals.subtotal)],
    [
      `Thuế${data.totals.vatRate ? ` (${Math.round(data.totals.vatRate * 100)}%)` : ""}:`,
      formatJPY(data.totals.tax),
    ],
    ["Phí vận chuyển:", formatJPY(data.totals.shippingFee)],
    ["Giảm giá:", `- ${formatJPY(data.totals.discount)}`],
  ];
  let yy = afterTableY + 40;
  summary.forEach(([label, value]) => {
    doc.text(label, summaryX + 10, yy);
    doc.text(value, summaryX + summaryWidth - 10, yy, { align: "right" });
    yy += 16;
  });
  doc.setFontSize(13);
  doc.text("TỔNG CỘNG:", summaryX + 10, yy + 8);
  doc.text(formatJPY(data.totals.grandTotal), summaryX + summaryWidth - 10, yy + 8, {
    align: "right",
  });

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
  doc.setTextColor(255, 0, 0); // đỏ
  doc.setFontSize(10);
  doc.setFont("NotoSans", "normal");
  doc.text(terms, marginX, blockY + 80, { maxWidth: pageWidth - 2 * marginX });
  doc.setTextColor(0, 0, 0); // reset về màu đen cho các phần sau

  // === Lời cảm ơn (in nghiêng) ===
  const thanks =
    data.extras?.thanksNote ||
    "Cảm ơn quý khách đã mua hàng! Nếu cần hỗ trợ, vui lòng liên hệ hotline hoặc email của cửa hàng.";
  doc.setFontSize(11);
  doc.setFont("NotoSans-Italic", "italic");
  doc.text(thanks, marginX, blockY + 110, { maxWidth: pageWidth - 2 * marginX });

  doc.save(`Invoice_${data.invoice.invoiceNumber}.pdf`);
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
