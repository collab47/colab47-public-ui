import { atom, computed } from 'nanostores';
import {
  FORM_TRANSLATIONS,
  type FormLabelsSchema,
} from '$lib/i18n/forms.translations';
import {
  SECTION_TRANSLATIONS,
  type FormUiCopySchema,
} from '$lib/i18n/sections.translations';
import {
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  type Locale,
  type TranslationSchema,
} from '$lib/i18n/translations';

export {
  SUPPORTED_LANGUAGES,
  type Locale,
  type TranslationSchema,
  type FormLabelsSchema,
  type FormUiCopySchema,
};

export interface LocalizedBundle extends TranslationSchema {
  forms: FormLabelsSchema;
  ui: FormUiCopySchema;
}

const LOCALE_KEY = 'c47_locale';
const VALID_LOCALES = new Set<string>(SUPPORTED_LANGUAGES.map((l) => l.code));

export const locale = atom<Locale>('en');

export const t = computed(locale, (lang): LocalizedBundle => {
  const base = TRANSLATIONS[lang] ?? TRANSLATIONS.en;
  const section = SECTION_TRANSLATIONS[lang] ?? SECTION_TRANSLATIONS.en;
  return {
    ...base,
    onboarding: section.onboarding,
    profile: section.profile,
    portfolio: section.portfolio,
    dashboard: {
      ...base.dashboard,
      ...section.dashboardExtra,
      roles: section.dashboardRoles,
    },
    forms: FORM_TRANSLATIONS[lang] ?? FORM_TRANSLATIONS.en,
    ui: section.ui,
  };
});

export function hydrateLocale(): void {
  if (typeof window === 'undefined') return;
  const saved = window.localStorage.getItem(LOCALE_KEY);
  const next: Locale = saved && VALID_LOCALES.has(saved) ? (saved as Locale) : 'en';
  locale.set(next);
  document.documentElement.lang = next;
}

export function setLocale(next: Locale): void {
  if (!VALID_LOCALES.has(next)) return;
  locale.set(next);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCALE_KEY, next);
    document.documentElement.lang = next;
  }
}

export function toggleLocale(): void {
  const currentIdx = SUPPORTED_LANGUAGES.findIndex((l) => l.code === locale.get());
  const nextLang = SUPPORTED_LANGUAGES[(currentIdx + 1) % SUPPORTED_LANGUAGES.length];
  setLocale(nextLang?.code ?? 'en');
}
