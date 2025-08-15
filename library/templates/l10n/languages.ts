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
  "zh-TW": "以下問題請一定要全文使用繁體中文回答，不要用其他語言回答！",
  "fr": "Veuillez répondre en français. ne répondez pas en anglais."
};

export function getLanguageName(lang: SupportedLanguage): string {
  return LANGUAGE_NAMES[lang] || "";
}

export function getLanguagePrefix(lang: SupportedLanguage): string {
  console.log(`[DEBUG] getLanguagePrefix() lang: ${lang}`);
  return LANGUAGE_PREFIXES[lang] || "";
}

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}
