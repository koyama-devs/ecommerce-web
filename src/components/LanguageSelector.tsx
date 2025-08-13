import { MenuItem, Select, Avatar, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const languages = [
  {
    code: "en",
    label: "English",
    flagUrl: "https://flagcdn.com/us.svg",
  },
  {
    code: "ja",
    label: "日本語",
    flagUrl: "https://flagcdn.com/jp.svg",
  },
  {
    code: "vi",
    label: "Tiếng Việt",
    flagUrl: "https://flagcdn.com/vn.svg",
  },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  // Lưu vào localStorage khi chọn
  const handleChange = (event: any) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
    setSelectedLang(newLang);
  };

  // Đọc từ localStorage khi component mount
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
      setSelectedLang(savedLang);
    }
  }, [i18n]);

  const currentLang = languages.find((l) => l.code === selectedLang) || languages[0];

  return (
    <Select
      value={selectedLang}
      onChange={handleChange}
      variant="standard"
      disableUnderline
      sx={{
        color: "white",
        minWidth: 40,
        "& .MuiSelect-select": {
          display: "flex",
          alignItems: "center",
          padding: 0,
        },
        "& .MuiSvgIcon-root": {
          color: "white",
        },
      }}
      renderValue={() => (
        <Avatar
          src={currentLang.flagUrl}
          alt={currentLang.code}
          sx={{ width: 24, height: 24 }}
        />
      )}
    >
      {languages.map((lang) => (
        <MenuItem key={lang.code} value={lang.code}>
          <Box display="flex" alignItems="center">
            <Avatar
              src={lang.flagUrl}
              alt={lang.code}
              sx={{ width: 24, height: 24, mr: 1 }}
            />
            <Typography>{lang.label}</Typography>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}
