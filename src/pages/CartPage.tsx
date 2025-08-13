import { useCart } from "../context/CartContext";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Stack,
  Box,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useTranslation } from "react-i18next";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    increaseQty,
    decreaseQty,
  } = useCart();

  const { t } = useTranslation();

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

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
                        sx={{
                          width: 25,
                          height: 25,
                          display: "flex",
                          border: "1px solid",
                          borderColor: "primary.main",
                          "&:hover": { bgcolor: "primary.light" },
                          boxShadow: 1,
                          borderRadius: 1,
                          "&:active": {
                            bgcolor: "primary.dark",
                            color: "white",
                          },
                          bgcolor: "primary.main",
                          color: "white",
                        }}
                        disabled={item.quantity <= 1}
                        onClick={() => decreaseQty(item.product.id)}
                      >
                        <RemoveIcon />
                      </IconButton>

                      <Typography>{item.quantity}</Typography>

                      <IconButton
                        size="small"
                        sx={{
                          width: 25,
                          height: 25,
                          display: "flex",
                          border: "1px solid",
                          borderColor: "primary.main",
                          "&:hover": { bgcolor: "primary.light" },
                          boxShadow: 1,
                          borderRadius: 1,
                          "&:active": {
                            bgcolor: "primary.dark",
                            color: "white",
                          },
                          bgcolor: "primary.main",
                          color: "white",
                        }}
                        disabled={item.quantity >= 99}
                        onClick={() => increaseQty(item.product.id)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Stack>

                    <Typography fontWeight="bold" sx={{ mt: 1 }}>
                      {t("cart.totalPerItem")} {formattedPrice(item.product.price * item.quantity)}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      startIcon={<DeleteIcon />}
                      sx={{
                        textTransform: "none",
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "warning.main",
                          color: "white",
                        },
                      }}
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
            {t("cart.totalCartPrice")} { formattedPrice(totalPrice) }
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
        </>
      )}
    </Container>
  );
}
