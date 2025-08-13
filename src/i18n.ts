import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import các file dịch
import en from "./locales/en/translation.json";
import ja from "./locales/ja/translation.json";
import vi from "./locales/vi/translation.json";

const savedLang = localStorage.getItem("lang") || "en";

i18n
    .use(LanguageDetector) // Tự động phát hiện ngôn ngữ trình duyệt
    .use(initReactI18next) // Kết nối với React
    .init({
        resources: {
            en: { translation: en },
            ja: { translation: ja },
            vi: { translation: vi },
        },
        lng: savedLang, // ngôn ngữ mặc định
        fallbackLng: 'en', // fallback nếu không có bản dịch
        debug: false,
        interpolation: {
            escapeValue: false, // React đã tự escape rồi
        },
    });

export default i18n;