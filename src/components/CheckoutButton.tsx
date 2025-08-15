// CheckoutButton.tsx
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PaymentForm from "./PaymentForm";

// import font đã convert
import "../fonts/NotoSans-base64.js"; // đường dẫn tới file đã convert bằng fontconverter

const stripePromise = loadStripe(
  "pk_test_51RvvuRJhVUeatzaxarReCCkpJ9HCqqnUjnOXlweugIBgyPqC9cOPiY0qZDQyiLq4ZEar8tl0prRZXOljOPSXYOFL00OVyMDP7l"
);

/** ====== Types ====== */
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
    currency?: "JPY" | "VND" | "USD" | string;
    vatRate?: number;
  };
  extras?: { terms?: string; thanksNote?: string; signer?: string };
};

/** ====== Helper: format tiền ====== */
const formatJPY = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Math.round(n));

/** ====== Helper: load ảnh từ URL -> dataURL ====== */
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

/** ====== Hàm tạo PDF hóa đơn ====== */
export async function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 50;

  // ====== Set font NotoSans đã convert ======
  doc.setFont("NotoSans", "normal");

  // Logo
  const logoDataUrl = await loadImageAsDataURL(data.store.logoUrl);
  if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, y, 80, 80);

  // Tiêu đề
  doc.setFontSize(20);
  doc.text("HÓA ĐƠN THANH TOÁN", pageWidth - marginX, y + 20, { align: "right" });

  // Thông tin cửa hàng
  doc.setFontSize(10);
  const storeLines = [
    data.store.name,
    data.store.address,
    `ĐT: ${data.store.phone} | Email: ${data.store.email}`,
    data.store.taxId ? `MST: ${data.store.taxId}` : "",
  ].filter(Boolean);
  storeLines.forEach((line, idx) => doc.text(line, marginX, y + 100 + idx * 14));
  y += 130;

  // Thông tin hóa đơn & khách hàng
  doc.setFontSize(12);
  doc.text("Thông tin hóa đơn", marginX, y);
  doc.text("Thông tin khách hàng", pageWidth / 2, y);

  const leftMeta = [
    `Số hóa đơn: ${data.invoice.invoiceNumber}`,
    `Ngày lập: ${data.invoice.date}`,
    `Mã đơn hàng: ${data.invoice.orderId}`,
    `Hình thức thanh toán: ${data.invoice.paymentMethod}`,
    `Trạng thái: ${data.invoice.paymentStatus}`,
  ];
  const rightMeta = [
    `Họ tên: ${data.customer.name}`,
    data.customer.phone ? `Điện thoại: ${data.customer.phone}` : "",
    data.customer.email ? `Email: ${data.customer.email}` : "",
    data.customer.shippingAddress ? `Đ/c giao hàng: ${data.customer.shippingAddress}` : "",
    data.customer.customerId ? `Mã KH: ${data.customer.customerId}` : "",
  ].filter(Boolean);

  y += 16;
  leftMeta.forEach((line, i) => doc.text(line, marginX, y + i * 14));
  rightMeta.forEach((line, i) => doc.text(line, pageWidth / 2, y + i * 14));

  // Bảng sản phẩm
  const tableStartY = y + Math.max(leftMeta.length, rightMeta.length) * 14 + 16;
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
    columnStyles: { 0: { halign: "center", cellWidth: 40 }, 2: { halign: "center", cellWidth: 60 }, 3: { halign: "right", cellWidth: 90 }, 4: { halign: "right", cellWidth: 110 } },
  });

  // Tổng kết thanh toán
  const afterTableY = (doc as any).lastAutoTable.finalY + 10;
  const summaryX = pageWidth - marginX - 220;
  doc.text("Tổng kết thanh toán", summaryX, afterTableY);
  const summary = [
    ["Tổng giá trị sản phẩm:", formatJPY(data.totals.subtotal)],
    [`Thuế${data.totals.vatRate ? ` (${Math.round(data.totals.vatRate * 100)}%)` : ""}:`, formatJPY(data.totals.tax)],
    ["Phí vận chuyển:", formatJPY(data.totals.shippingFee)],
    ["Giảm giá:", `- ${formatJPY(data.totals.discount)}`],
  ];
  let yy = afterTableY + 16;
  summary.forEach(([label, value]) => {
    doc.text(label, summaryX, yy);
    doc.text(value, summaryX + 180, yy, { align: "right" });
    yy += 16;
  });

  doc.setFontSize(13);
  doc.text("TỔNG CỘNG:", summaryX, yy + 8);
  doc.text(formatJPY(data.totals.grandTotal), summaryX + 180, yy + 8, { align: "right" });

  // Điều khoản / cảm ơn / chữ ký
  const blockY = yy + 40;
  const terms = data.extras?.terms || "Đổi trả trong vòng 7 ngày với sản phẩm còn nguyên tem/mác theo chính sách của cửa hàng.";
  const thanks = data.extras?.thanksNote || "Cảm ơn quý khách đã mua sắm! Hẹn gặp lại quý khách trong những đơn hàng tiếp theo.";
  const signer = data.extras?.signer || data.store.name;
  doc.text("Điều khoản & chính sách:", marginX, blockY);
  doc.text(terms, marginX, blockY + 14, { maxWidth: pageWidth - marginX * 2 });
  doc.text("Lời cảm ơn:", marginX, blockY + 48);
  doc.text(thanks, marginX, blockY + 62, { maxWidth: pageWidth - marginX * 2 });
  doc.text("Đại diện bên bán (chữ ký):", pageWidth - marginX - 220, blockY);
  doc.text("__________________________", pageWidth - marginX - 220, blockY + 24);
  doc.text(signer, pageWidth - marginX - 220, blockY + 40);

  doc.save(`Invoice_${data.invoice.invoiceNumber}.pdf`);
}

/** ====== Component CheckoutButton ====== */
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
