import { Box } from "@mui/material";
import { useTranslation } from "react-i18next"; // ✅ Thêm hook i18n

interface ProductTagProps {
  tagList: string[];
}

export default function ProductTag({ tagList }: ProductTagProps) {
  const { t } = useTranslation(); // ✅ Sử dụng i18n

  if (!tagList?.length) return null;

  return (
    <>
      {tagList.includes("best-seller") && (
        <Box
          sx={{
            position: "absolute",
            top: 24,
            left: -80,
            width: 230,
            transform: "rotate(-45deg)",
            bgcolor: "success.main",
            color: "white",
            textAlign: "center",
            fontSize: "0.6rem",
            fontWeight: "bold",
            py: 0.5,
            boxShadow: 3,
            zIndex: 10,
            letterSpacing: "1px",
            textShadow: "0 1px 2px rgba(0,0,0,0.4)",
          }}
        >
          🏆{t("productTag.bestSeller")}
        </Box>
      )}

      {tagList.includes("new") && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "linear-gradient(45deg, #e1bee7 0%, #ab47bc 100%)",
            color: "white",
            px: 1.2,
            py: 0.3,
            fontSize: "0.75rem",
            fontWeight: "bold",
            borderRadius: "999px",
            boxShadow: 2,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            animation: "pulse 1.5s infinite",
            zIndex: 10,
          }}
          title={t("productTag.newArrival")}
        >
          ✨ {t("productTag.new")}
        </Box>
      )}

      {tagList.includes("sale") && (
        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            left: 12,
            background: "linear-gradient(45deg, #ff8a80 0%, #e53935 100%)",
            color: "yellow",
            px: 1.2,
            py: 0.3,
            fontSize: "0.75rem",
            fontWeight: "bold",
            borderRadius: 1,
            boxShadow: 3,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            animation: "shake 0.5s infinite",
            zIndex: 10,
            textShadow: "0 1px 2px rgba(0,0,0,0.4)",
          }}
          title={t("productTag.sale")}
        >
          💥{t("productTag.sale")}💥
        </Box>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes shake {
            0% { transform: translate(0, 0); }
            25% { transform: translate(2px, -2px); }
            50% { transform: translate(-2px, 2px); }
            75% { transform: translate(2px, 2px); }
            100% { transform: translate(0, 0); }
          }
        `}
      </style>
    </>
  );
}
