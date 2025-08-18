// CheckoutButton.tsx
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PaymentForm from "./PaymentForm";

// import font đã convert
import "../fonts/NotoSans-base64.js";

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

  const logoDataUrl = await loadImageAsDataURL(data.store.logoUrl);
  if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, y, 80, 80);

  doc.setFontSize(20);
  doc.text("HÓA ĐƠN THANH TOÁN", pageWidth - marginX, y + 20, { align: "right" });

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

  const tableStartY = y + Math.max(leftMeta.length, rightMeta.length) * 14 + 20;
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

  // === Tổng kết thanh toán (tách hẳn ra) ===
  const afterTableY = (doc as any).lastAutoTable.finalY + 20; // thêm khoảng cách
  const summaryX = pageWidth - marginX - 220;
  doc.setFontSize(12);
  doc.text("Tổng kết thanh toán", summaryX, afterTableY);
  const summary = [
    ["Tổng giá trị sản phẩm:", formatJPY(data.totals.subtotal)],
    [
      `Thuế${data.totals.vatRate ? ` (${Math.round(data.totals.vatRate * 100)}%)` : ""}:`,
      formatJPY(data.totals.tax),
    ],
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

  // === Điều khoản & chính sách (canh trái) ===
  const blockY = yy + 50;
  doc.setFontSize(11);
  doc.text("Điều khoản & chính sách:", marginX, blockY);
  const terms =
    data.extras?.terms ||
    "Đổi trả trong vòng 7 ngày với sản phẩm còn nguyên tem/mác. Không áp dụng cho sản phẩm giảm giá sâu hoặc đã qua sử dụng.";
  doc.text(terms, marginX, blockY + 14, { maxWidth: pageWidth / 2 - marginX - 20 });

  // Lời cảm ơn
  doc.text("Lời cảm ơn:", marginX, blockY + 60);
  const thanks =
    data.extras?.thanksNote ||
    "Cảm ơn quý khách đã mua hàng! Nếu cần hỗ trợ, vui lòng liên hệ hotline hoặc email của cửa hàng.";
  doc.text(thanks, marginX, blockY + 74, { maxWidth: pageWidth / 2 - marginX - 20 });

  // === Chữ ký bên bán (canh phải, không bị dính text trái) ===
  const signer = data.extras?.signer || data.store.name;
  const signX = pageWidth - marginX - 220;
  const signY = blockY; // đặt cùng mức với tiêu đề Điều khoản nhưng ở cột phải
  doc.text("Đại diện bên bán (chữ ký):", signX, signY);
  doc.text("__________________________", signX, signY + 24);
  doc.text(signer, signX, signY + 40);

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
