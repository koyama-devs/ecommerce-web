import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  CardActions,
  Box,
  Snackbar,
  Link as MuiLink,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Product } from "../data/products";
import { useRef, useState } from "react";
import { flyToCart } from "../utils/flyToCart";
import ProductTag from "./ProductTag";
import { useTranslation } from "react-i18next"; // ✅ Thêm dòng này

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { t } = useTranslation(); // ✅ Dùng hook i18n

  const formattedPrice = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(product.price);

  const handleAddToCart = () => {
    const cartEl = document.getElementById("global-cart-icon");
    if (imageRef.current && cartEl) {
      flyToCart(imageRef.current, cartEl);
    }

    addToCart(product);
    setSnackbarOpen(true);
  };

  const tagList = Array.isArray(product.tag)
    ? product.tag
    : product.tag
    ? [product.tag]
    : [];

  return (
    <>
      <Card
        sx={{
          position: "relative",
          width: 240,
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          transition: "all 0.25s ease-in-out",
          boxShadow: 1,
          "&:hover": {
            transform: "translateY(-6px) scale(1.01)",
            boxShadow: 6,
            borderColor: "primary.main",
            borderWidth: 3,
          },
        }}
      >
        <ProductTag tagList={tagList} />

        <CardMedia
          component="img"
          height="140"
          image={product.imageUrl}
          alt={product.name}
          sx={{ objectFit: "cover" }}
          ref={imageRef}
        />

        <CardContent>
          <Typography variant="h6" noWrap>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formattedPrice}
          </Typography>

          <Box mt={1}>
            <MuiLink
              component={RouterLink}
              to={`/products/${product.id}`}
              underline="hover"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "primary.main",
                transition: "color 0.2s",
                "&:hover": {
                  color: "primary.dark",
                },
              }}
            >
              {t("productCard.viewDetails")} {/* ✅ Đã dùng i18n */}
            </MuiLink>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "flex-end", pr: 2, pb: 2 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={handleAddToCart}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
              borderRadius: 1,
            }}
          >
            <AddShoppingCartIcon fontSize="small" sx={{ color: "inherit" }} />
          </IconButton>
        </CardActions>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={t("productCard.addedToCart", { name: product.name })} // ✅ Dùng i18n
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: 70 }}
        ContentProps={{
          sx: {
            bgcolor: "success.main",
            color: "white",
            borderRadius: 1,
            boxShadow: 3,
          },
        }}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
            sx={{
              "&:hover": { bgcolor: "success.dark" },
              borderRadius: 1,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
}
