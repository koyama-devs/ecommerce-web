import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  CartItem,
  InvoiceData,
  StoreInfo
} from "../components/CheckoutButton";
import CheckoutButton, {
  generateInvoicePDF,
} from "../components/CheckoutButton";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, increaseQty, decreaseQty } =
    useCart();

  const { t } = useTranslation();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(Math.round(price));

  const itemsForInvoice: CartItem[] = useMemo(
    () =>
      cartItems.map((c) => ({
        name: c.product.name,
        quantity: c.quantity,
        price: c.product.price,
      })),
    [cartItems]
  );

  const subtotal = itemsForInvoice.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );

  // Bạn có thể chỉnh 3 con số này dễ dàng
  const TAX_RATE = 0.1; // 10%
  const SHIPPING_FEE = 500; // ¥
  const DISCOUNT = 0;

  const totals = useMemo(() => {
    const tax = Math.round(subtotal * TAX_RATE);
    const grandTotal = Math.max(
      0,
      Math.round(subtotal + tax + SHIPPING_FEE - DISCOUNT)
    );
    return { tax, grandTotal };
  }, [subtotal]);

  const totalPrice = subtotal + totals.tax + SHIPPING_FEE - DISCOUNT;

  const storeInfo: StoreInfo = {
    name: "AOITEX STORE",
    address: "123 Sakura St, Chiyoda, Tokyo",
    phone: "03-1234-5678",
    email: "support@aoitex.com",
    taxId: "13-1234567",
    // Dùng link logo tạm; bạn thay sau bằng logo thật của bạn (URL hoặc để base64 nếu muốn offline)
    logoUrl:
      "https://dummyimage.com/512x512/1e88e5/ffffff.png&text=LOGO",
  };

  const handleDownloadPDF = async () => {
    if (!invoiceData) return;
    await generateInvoicePDF(invoiceData);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: "bold",
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <ShoppingCartIcon color="inherit" fontSize="large" />
        {t("cart.title")}
      </Typography>

      {paymentSuccess ? (
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

          {invoiceData && (
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
                  <Typography>Thanh toán: {invoiceData.invoice.paymentMethod}</Typography>
                  <Typography>Trạng thái: {invoiceData.invoice.paymentStatus}</Typography>
                </Grid>
              </Grid>

              {/* Customer */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
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
                    <Typography>Đ/c giao hàng: {invoiceData.customer.shippingAddress}</Typography>
                  )}
                  {invoiceData.customer.customerId && (
                    <Typography>Mã KH: {invoiceData.customer.customerId}</Typography>
                  )}
                </Grid>
              </Grid>

              {/* Items */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
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
                  <Typography>{formattedPrice(item.price * item.quantity)}</Typography>
                </Stack>
              ))}

              {/* Summary */}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ maxWidth: 360, ml: "auto" }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography>Tổng giá trị sản phẩm:</Typography>
                  <Typography>{formattedPrice(invoiceData.totals.subtotal)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography>
                    Thuế{invoiceData.totals.vatRate ? ` (${Math.round(invoiceData.totals.vatRate * 100)}%)` : ""}:
                  </Typography>
                  <Typography>{formattedPrice(invoiceData.totals.tax)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography>Phí vận chuyển:</Typography>
                  <Typography>{formattedPrice(invoiceData.totals.shippingFee)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography>Giảm giá:</Typography>
                  <Typography>-{formattedPrice(invoiceData.totals.discount)}</Typography>
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

              <Button fullWidth variant="outlined" onClick={handleDownloadPDF}>
                📄 Tải hóa đơn (PDF)
              </Button>
            </Paper>
          )}
        </Box>
      ) : cartItems.length === 0 ? (
        <Typography align="center">{t("cart.empty")}</Typography>
      ) : (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            flexWrap="wrap"
            spacing={3}
            useFlexGap
            justifyContent="center"
            alignItems="center"
          >
            {cartItems.map((item) => (
              <Box
                key={item.product.id}
                sx={{
                  width: { xs: "100%", sm: "calc(50% - 16px)", md: "calc(33.33% - 16px)" },
                  minWidth: 280,
                }}
              >
                <Card>
                  <CardMedia
                    component="img"
                    height="150"
                    sx={{ objectFit: "contain" }}
                    image={item.product.imageUrl}
                    alt={item.product.name}
                  />
                  <CardContent>
                    <Typography variant="h6">{item.product.name}</Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      alignItems="center"
                      sx={{ mt: 1 }}
                    >
                      <IconButton
                        size="small"
                        disabled={item.quantity <= 1}
                        onClick={() => decreaseQty(item.product.id)}
                        sx={{
                          width: 25,
                          height: 25,
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": { bgcolor: "primary.light" },
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>

                      <Typography>{item.quantity}</Typography>

                      <IconButton
                        size="small"
                        disabled={item.quantity >= 99}
                        onClick={() => increaseQty(item.product.id)}
                        sx={{
                          width: 25,
                          height: 25,
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": { bgcolor: "primary.light" },
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Stack>

                    <Typography fontWeight="bold" sx={{ mt: 1 }}>
                      {t("cart.totalPerItem")}{" "}
                      {formattedPrice(item.product.price * item.quantity)}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      {t("cart.remove")}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Stack>

          {/* Tổng tiền hiển thị theo cùng logic với PDF */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" align="right" sx={{ fontWeight: "bold" }}>
              {t("cart.totalCartPrice")} {formattedPrice(totalPrice)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={clearCart}
            hidden={!cartItems.length}
            sx={{ mt: 2 }}
            size="large"
            startIcon={<DeleteIcon />}
          >
            {t("cart.clear")}
          </Button>

          {/* Nút thanh toán: truyền đủ dữ liệu để PaymentForm sinh PDF đồng bộ */}
          <CheckoutButton
            totalPrice={Math.round(totalPrice)}
            cartItems={itemsForInvoice}
            storeInfo={storeInfo}
            taxRate={TAX_RATE}
            shippingFee={SHIPPING_FEE}
            discount={DISCOUNT}
            onSuccess={(fullInvoice) => {
              setInvoiceData(fullInvoice);
              clearCart();
              setPaymentSuccess(true);
            }}
          />
        </>
      )}
    </Container>
  );
}
