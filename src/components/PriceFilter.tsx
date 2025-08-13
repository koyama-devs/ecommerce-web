import { Box, Slider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface PriceFilterProps {
    value: number[];
    onChange: (newValue: number[]) => void;
    min?: number;
    max?: number;
}

export default function PriceFilter({ value, onChange, min = 0, max = 1000 }: PriceFilterProps) {
    const handleChange = (_event: Event, newValue: number | number[]) => {
        onChange(newValue as number[]);
    };
    const { t } = useTranslation();
    return (
        <Box sx={{ width: 300, mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom> { t("priceFilter.title")}</Typography>
            <Slider
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                min={min}
                max={max}
            />
            <Typography>
                { t("priceFilter.priceRange")}  {t("priceFilter.currencySymbol")}{value[0]} – {t("priceFilter.currencySymbol")}{value[1]}
            </Typography>
        </Box>
    );
}