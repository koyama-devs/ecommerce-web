import Slider from "react-slick";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function PromoCarousel() {
    const { t } = useTranslation();

    const promoBanners = [
        {
            id: 1,
            imageUrl: "/banners/summer-sale.png",
            title: t("promoCarousel.summerSale.title"),
            subtitle: t("promoCarousel.summerSale.subtitle"),
            bgColor: "#fce4ec",
        },
        {
            id: 2,
            imageUrl: "/banners/new-arrival.png",
            title: t("promoCarousel.newArrival.title"),
            subtitle: t("promoCarousel.newArrival.subtitle"),
            bgColor: "#e3f2fd",
        },
        {
            id: 3,
            imageUrl: "/banners/best-deal.png",
            title: t("promoCarousel.bestDeal.title"),
            subtitle: t("promoCarousel.bestDeal.subtitle"),
            bgColor: "#fff3e0",
        },
    ];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 4000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
    };

    return (
        <Box sx={{ width: "100%", maxWidth: "100%", overflow: "hidden", mb: 4 }}>
            <Slider {...settings}>
                {promoBanners.map((banner) => (
                    <Box
                        key={banner.id}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 4,
                            bgcolor: banner.bgColor,
                            borderRadius: 2,
                            minHeight: 100,
                        }}
                    >
                        <Box>
                            <Typography variant="h5" fontWeight={700}>
                                {banner.title}
                            </Typography>
                            <Typography variant="subtitle1">{banner.subtitle}</Typography>
                        </Box>
                        <Box
                            component="img"
                            src={banner.imageUrl}
                            alt={banner.title}
                            sx={{ width: "100%", height: "auto", objectFit: "contain", borderRadius: 2 }}
                        />
                    </Box>
                ))}
            </Slider>
        </Box>
    );
}
