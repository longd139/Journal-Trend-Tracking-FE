import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// EN
import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';
import dashboardEn from './locales/en/dashboard.json';
import reportsEn from './locales/en/reports.json';
import analyticsEn from './locales/en/analytics.json';
import searchEn from './locales/en/search.json';
import settingsEn from './locales/en/settings.json';
import graphEn from './locales/en/graph.json';
import landingEn from './locales/en/landing.json';
import followEn from './locales/en/follow.json';
import supportEn from './locales/en/support.json';
import adminEn from './locales/en/admin.json';

// VI
import commonVi from './locales/vi/common.json';
import authVi from './locales/vi/auth.json';
import dashboardVi from './locales/vi/dashboard.json';
import reportsVi from './locales/vi/reports.json';
import analyticsVi from './locales/vi/analytics.json';
import searchVi from './locales/vi/search.json';
import settingsVi from './locales/vi/settings.json';
import graphVi from './locales/vi/graph.json';
import landingVi from './locales/vi/landing.json';
import followVi from './locales/vi/follow.json';
import supportVi from './locales/vi/support.json';
import adminVi from './locales/vi/admin.json';

const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    reports: reportsEn,
    analytics: analyticsEn,
    search: searchEn,
    settings: settingsEn,
    graph: graphEn,
    landing: landingEn,
    follow: followEn,
    support: supportEn,
    admin: adminEn,
  },
  vi: {
    common: commonVi,
    auth: authVi,
    dashboard: dashboardVi,
    reports: reportsVi,
    analytics: analyticsVi,
    search: searchVi,
    settings: settingsVi,
    graph: graphVi,
    landing: landingVi,
    follow: followVi,
    support: supportVi,
    admin: adminVi,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,

    fallbackLng: 'en',

    supportedLngs: ['en', 'vi'],

    ns: [
      'common',
      'auth',
      'dashboard',
      'reports',
      'analytics',
      'search',
      'settings',
      'graph',
      'landing',
      'follow',
      'support',
      'admin',
    ],

    defaultNS: 'common',

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'preferredLanguage',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;
