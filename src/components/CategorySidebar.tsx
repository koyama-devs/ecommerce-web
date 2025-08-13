import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import {
  Paper,
  Typography,
  Stack,
  Button,
  Box,
} from "@mui/material";

interface CategorySidebarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategorySidebar: FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        maxWidth: 220,
        p: 2.5,
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        mb={2}
        color="text.primary"
      >
        {t("productList.filterByCategory")}
      </Typography>

      <Stack spacing={1.5}>
        <CategoryItem
          label={t("productList.allCategories")}
          isActive={selectedCategory === ""}
          onClick={() => onCategoryChange("")}
        />
        {categories.map((category) => (
          <CategoryItem
            key={category}
            label={t(`category.${category}`, category)}
            isActive={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
          />
        ))}
      </Stack>
    </Paper>
  );
};

const CategoryItem: FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <Button
    fullWidth
    onClick={onClick}
    disableElevation
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.95rem",
      borderRadius: 2,
      px: 2,
      py: 1.2,
      backgroundImage: isActive
        ? "linear-gradient(to right, #fb923c, #ea580c)"
        : "none",
      backgroundColor: isActive ? "transparent" : "transparent",
      color: isActive ? "common.white" : "text.primary",
      boxShadow: isActive ? 2 : "none",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundImage: isActive
          ? "linear-gradient(to right, #f97316, #c2410c)"
          : "none",
        backgroundColor: isActive ? "transparent" : "action.hover",
        color: isActive ? "common.white" : "warning.dark",
        boxShadow: isActive ? 3 : "none",
      },
    }}
  >
    <Box component="span" sx={{ flexGrow: 1, textAlign: "left" }}>
      {label}
    </Box>
    {isActive && <CheckCircle size={18} color="white" />}
  </Button>
);

export default CategorySidebar;
