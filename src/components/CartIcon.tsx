// components/CartIcon.tsx
import { IconButton, Badge } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartIcon() {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <IconButton id="global-cart-icon"
      onClick={() => navigate("/cart")}
      sx={{
        color: "inherit",
        "&:hover": {
          color: "primary.light",
        },
      }}
    >
      <Badge badgeContent={totalQty} color="error">
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );
}
