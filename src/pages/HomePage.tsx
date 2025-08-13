import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  InputAdornment
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getAllProducts, getProductsBySearchTerm } from "../data/products";
import SearchIcon from "@mui/icons-material/Search";
import PriceFilter from "../components/PriceFilter";
import PromoCarousel from "../components/PromoCarousel";
import { useTranslation } from "react-i18next";


export default function HomePage() {

  const [searchTerm, setSearchTerm] = useState("");

  const allFeaturedProducts = getAllProducts().slice(0, 4);
  const searchResults = searchTerm
    ? getProductsBySearchTerm(searchTerm).slice(0, 4)
    : allFeaturedProducts;

  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const priceFilteredProducts = searchResults.filter((product) => {
    const formattedPrice = new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(product.price);
    const priceValue = parseInt(formattedPrice.replace(/[^0-9]/g, ""));
    return priceValue >= priceRange[0] && priceValue <= priceRange[1];
  });

  const { t } = useTranslation();

  return (
    <>
      <PromoCarousel />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t("homePage.hero.title")}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          {t("homePage.featuredProducts.title")}
        </Typography>

        <Box mb={3}>
          <TextField
            label={t("homePage.search.label")}
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }} />
        </Box>
        <PriceFilter
          value={priceRange}
          onChange={setPriceRange}
          min={0}
          max={1000} />

        <Grid container spacing={2}>
          {priceFilteredProducts.length > 0 ? (
            priceFilteredProducts.map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
              {t("homePage.search.noResults")}
            </Typography>
          )}
        </Grid>

        <Box textAlign="center" mt={5}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/products"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 4,
              py: 1,
              transition: "background-color 0.3s",
              "&:hover": {
                bgcolor: "primary.main",
                color: "white",
              },
            }}
          >
            {t("homePage.viewAllProducts")}
          </Button>
        </Box>
      </Container></>
  );
}
