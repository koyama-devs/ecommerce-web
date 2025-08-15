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
  IconButton,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import jsPDF from "jspdf";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CheckoutButton from "../components/CheckoutButton";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, increaseQty, decreaseQty } =
    useCart();

  const { t } = useTranslation();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("HÓA ĐƠN MUA HÀNG", 14, 20);

    let y = 40;
    invoiceData.items.forEach((item: any, idx: number) => {
      doc.setFontSize(12);
      doc.text(
        `${idx + 1}. ${item.name} - SL: ${item.quantity} - Giá: ${formattedPrice(
          item.price * item.quantity
        )}`,
        14,
        y
      );
      y += 10;
    });

    doc.setFontSize(14);
    doc.text(`Tổng cộng: ${formattedPrice(invoiceData.total)}`, 14, y + 10);

    doc.save("hoa_don.pdf");
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
              fontSize: "1.1rem",
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
                maxWidth: 500,
                mx: "auto",
                textAlign: "left",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                🧾 Hóa đơn mua hàng
              </Typography>

              {invoiceData.items.map((item: any, idx: number) => (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                  key={idx}
                >
                  <Typography>
                    {idx + 1}. {item.name} (x{item.quantity})
                  </Typography>
                  <Typography>{formattedPrice(item.price * item.quantity)}</Typography>
                </Stack>
              ))}

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight="bold">Tổng cộng:</Typography>
                <Typography fontWeight="bold" color="primary">
                  {formattedPrice(invoiceData.total)}
                </Typography>
              </Stack>

              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 3 }}
                onClick={generatePDF}
              >
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
                  width: {
                    xs: "100%",
                    sm: "calc(50% - 16px)",
                    md: "calc(33.33% - 16px)",
                  },
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

          <Typography
            variant="h6"
            align="right"
            sx={{ mt: 4, fontWeight: "bold" }}
          >
            {t("cart.totalCartPrice")} {formattedPrice(totalPrice)}
          </Typography>

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

          <CheckoutButton
            totalPrice={totalPrice}
            onSuccess={() => {
              setInvoiceData({
                items: cartItems.map((c) => ({
                  name: c.product.name,
                  quantity: c.quantity,
                  price: c.product.price,
                })),
                total: totalPrice,
              });
              clearCart();
              setPaymentSuccess(true);
            }}
          />
        </>
      )}
    </Container>
  );
}
