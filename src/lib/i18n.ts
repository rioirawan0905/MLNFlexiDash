import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "dashboard_title": "Operational Dashboard",
      "edit_mode": "Edit Mode",
      "save": "Save",
      "cancel": "Cancel",
      "dark_mode": "Dark Mode",
      "light_mode": "Light Mode",
      "copy": "Copy",
      "copied": "Copied!",
      "total_wo": "Total WO",
      "est_pob": "Est. POB",
      "financials": "Financials",
      "highlights": "Highlights",
      "add_widget": "Add Widget",
    }
  },
  id: {
    translation: {
      "dashboard_title": "Dasboard Operasional",
      "edit_mode": "Mode Edit",
      "save": "Simpan",
      "cancel": "Batal",
      "dark_mode": "Mode Gelap",
      "light_mode": "Mode Terang",
      "copy": "Salin",
      "copied": "Tersalin!",
      "total_wo": "Total WO",
      "est_pob": "Est. POB",
      "financials": "Keuangan",
      "highlights": "Sorotan",
      "add_widget": "Tambah Widget",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
