import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { CartItem, StoreInfo } from "../components/CheckoutButton";
import CheckoutButton from "../components/CheckoutButton";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, increaseQty, decreaseQty } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const subtotal = itemsForInvoice.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const TAX_RATE = 0.1;
  const SHIPPING_FEE = 500;
  const DISCOUNT = 0;

  const tax = Math.round(subtotal * TAX_RATE);
  const totalPrice = subtotal + tax + SHIPPING_FEE - DISCOUNT;

  const storeInfo: StoreInfo = {
    name: "AOITEX STORE",
    address: "123 Sakura St, Chiyoda, Tokyo",
    phone: "03-1234-5678",
    email: "support@aoitex.com",
    taxId: "13-1234567",
    logoUrl: "https://dummyimage.com/512x512/1e88e5/ffffff.png&text=LOGO",
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

      {cartItems.length === 0 ? (
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

          <CheckoutButton
            totalPrice={Math.round(totalPrice)}
            cartItems={itemsForInvoice}
            storeInfo={storeInfo}
            taxRate={TAX_RATE}
            shippingFee={SHIPPING_FEE}
            discount={DISCOUNT}
            onSuccess={(invoiceData) => {
              clearCart();
              navigate(`/order-success/${invoiceData.invoice.invoiceNumber}`, {
                state: invoiceData,
              });
            }}
          />
        </>
      )}
    </Container>
  );
}
