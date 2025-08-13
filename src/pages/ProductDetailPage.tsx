import { useParams } from "react-router-dom";
import { getProductById } from "../data/products";
import { useCart } from "../context/CartContext";
import {
    Box,
    Button,
    Container,
    Grid,
    Typography,
    Paper,
} from "@mui/material";
import { useRef } from "react";
import { flyToCart } from "../utils/flyToCart";
import { useTranslation } from "react-i18next";

export default function ProductDetailPage() {
    const { id } = useParams();
    const productId = id ? parseInt(id) : undefined;
    const product = productId ? getProductById(productId) : undefined;

    const { addToCart } = useCart();
    const { t } = useTranslation();
    const imageRef = useRef<HTMLImageElement>(null);

    if (!product) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h5" color="error">
                    {t("productDetail.notFound")}
                </Typography>
            </Container>
        );
    }

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
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                            component="img"
                            src={product.imageUrl}
                            alt={product.name}
                            ref={imageRef}
                            sx={{
                                width: "100%",
                                height: 360,
                                objectFit: "cover",
                                borderRadius: 2,
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h4" gutterBottom>
                            {product.name}
                        </Typography>

                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {formattedPrice}
                        </Typography>

                        <Typography variant="body1" paragraph>
                            {product.description}
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddToCart}
                            sx={{
                                mt: 2,
                                borderRadius: 1,
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            {t("productDetail.addToCart")}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
