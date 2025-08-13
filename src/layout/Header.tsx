import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Stack,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CartIcon from "../components/CartIcon";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation();

  return (
    <AppBar position="fixed" color="primary" enableColorOnDark elevation={3}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo + Title */}
        <Box display="flex" alignItems="center">
          <StorefrontIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "white",
              fontWeight: "bold",
              "&:hover": {
              bgcolor: "primary", // <- Sẽ dùng đúng tone cam bạn đã định nghĩa
              color: "white",
            },
            }}
          >
            {t("header.title")}
          </Typography>
        </Box>

        <LanguageSelector />

        {/* Navigation + Cart */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            component={RouterLink}
            to="/products"
            sx={{
              textTransform: "none",
              color: "white",
              "&:hover": {
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {t("header.products")}
          </Button>

          {/* Cart icon nằm cùng hàng */}
          <Box>
            <CartIcon/>
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
