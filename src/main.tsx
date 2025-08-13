import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./i18n";
import App from "./App.tsx";
import { CartProvider } from "./context/CartContext.tsx";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme.ts";
import { CssBaseline } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  </StrictMode>
);
