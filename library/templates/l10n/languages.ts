// Supported languages configuration
export type SupportedLanguage = "en" | "zh-TW" | "fr";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "zh-TW", "fr"];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  "en": "English",
  "zh-TW": "繁體中文",
  "fr": "Français"
};

export const LANGUAGE_PREFIXES: Record<SupportedLanguage, string> = {
  "en": "",
  "zh-TW": "使用的語言非常非常重要，以下問題請用繁體中文回答。",
  "fr": "Il est très important d'utiliser la bonne langue. Veuillez répondre en français."
};

export function getLanguageName(lang: SupportedLanguage): string {
  return LANGUAGE_NAMES[lang] || "";
}

export function getLanguagePrefix(lang: SupportedLanguage): string {
  return LANGUAGE_PREFIXES[lang] || "";
}

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}
