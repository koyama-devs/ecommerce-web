import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import type { InvoiceData } from "../components/CheckoutButton";
import { generateInvoicePDF } from "../components/CheckoutButton";

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceData = location.state as InvoiceData | null;

  if (!invoiceData) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography align="center" color="error">
          Không tìm thấy dữ liệu hóa đơn.
        </Typography>
      </Container>
    );
  }

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(Math.round(price));

  const handleDownloadPDF = async () => {
    const blob = await generateInvoicePDF(invoiceData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${invoiceData.invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box textAlign="center">
        <Alert
          severity="success"
          sx={{
            fontSize: "1.05rem",
            p: 2,
            mb: 3,
            backgroundColor: "#e6f4ea",
            color: "#2e7d32",
            fontWeight: "bold",
          }}
        >
          Thanh toán thành công! Cảm ơn bạn đã mua hàng.
        </Alert>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            maxWidth: 900,
            mx: "auto",
            textAlign: "left",
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {invoiceData.store.name}
              </Typography>
              <Typography>{invoiceData.store.address}</Typography>
              <Typography>
                ĐT: {invoiceData.store.phone} | Email: {invoiceData.store.email}
              </Typography>
              {invoiceData.store.taxId && (
                <Typography>MST: {invoiceData.store.taxId}</Typography>
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ textAlign: { xs: "left", sm: "right" } }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                HÓA ĐƠN
              </Typography>
              <Typography>Số HĐ: {invoiceData.invoice.invoiceNumber}</Typography>
              <Typography>Ngày: {invoiceData.invoice.date}</Typography>
              <Typography>Mã đơn: {invoiceData.invoice.orderId}</Typography>
              <Typography>
                Thanh toán: {invoiceData.invoice.paymentMethod}
              </Typography>
              <Typography>
                Trạng thái: {invoiceData.invoice.paymentStatus}
              </Typography>
            </Grid>
          </Grid>

          {/* Customer */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Thông tin khách hàng
              </Typography>
              <Typography>Họ tên: {invoiceData.customer.name}</Typography>
              {invoiceData.customer.phone && (
                <Typography>Điện thoại: {invoiceData.customer.phone}</Typography>
              )}
              {invoiceData.customer.email && (
                <Typography>Email: {invoiceData.customer.email}</Typography>
              )}
              {invoiceData.customer.shippingAddress && (
                <Typography>
                  Đ/c giao hàng: {invoiceData.customer.shippingAddress}
                </Typography>
              )}
              {invoiceData.customer.customerId && (
                <Typography>Mã KH: {invoiceData.customer.customerId}</Typography>
              )}
            </Grid>
          </Grid>

          {/* Items */}
          <Divider sx={{ my: 2 }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", mb: 1 }}
          >
            Chi tiết sản phẩm
          </Typography>
          {invoiceData.items.map((item, idx) => (
            <Stack
              key={idx}
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography>
                {idx + 1}. {item.name} (x{item.quantity})
              </Typography>
              <Typography>
                {formattedPrice(item.price * item.quantity)}
              </Typography>
            </Stack>
          ))}

          {/* Summary */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ maxWidth: 360, ml: "auto" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography>Tổng giá trị sản phẩm:</Typography>
              <Typography>
                {formattedPrice(invoiceData.totals.subtotal)}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography>
                Thuế
                {invoiceData.totals.vatRate
                  ? ` (${Math.round(invoiceData.totals.vatRate * 100)}%)`
                  : ""}
                :
              </Typography>
              <Typography>{formattedPrice(invoiceData.totals.tax)}</Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography>Phí vận chuyển:</Typography>
              <Typography>
                {formattedPrice(invoiceData.totals.shippingFee)}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography>Giảm giá:</Typography>
              <Typography>
                -{formattedPrice(invoiceData.totals.discount)}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">TỔNG CỘNG:</Typography>
              <Typography fontWeight="bold" color="primary">
                {formattedPrice(invoiceData.totals.grandTotal)}
              </Typography>
            </Stack>
          </Box>

          {/* Extras */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Điều khoản & chính sách đổi trả
          </Typography>
          <Typography sx={{ mb: 1 }}>
            {invoiceData.extras?.terms ||
              "※ Đổi trả trong 7 ngày với sản phẩm còn nguyên tem/mác theo chính sách của cửa hàng."}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Lời cảm ơn
          </Typography>
          <Typography sx={{ mb: 2 }}>
            {invoiceData.extras?.thanksNote ||
              "Cảm ơn quý khách đã mua hàng! Hẹn gặp lại quý khách trong những đơn hàng tiếp theo."}
          </Typography>

          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleDownloadPDF}
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: "primary.main",
                  color: "white",
                  borderColor: "primary.main",
                },
              }}
            >
              📄 Tải hóa đơn (PDF)
            </Button>

            {/* Nút mới quay về trang chủ */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => navigate("/")}
              sx={{ fontWeight: "bold" }}
            >
              ⬅️ Quay về trang chủ
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
