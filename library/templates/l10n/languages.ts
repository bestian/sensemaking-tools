// Supported languages configuration
export type SupportedLanguage = "en" | "zh-TW" | "zh-CN" | "fr" | "es" | "ja";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "zh-TW", "zh-CN", "fr", "es", "ja"];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  "en": "English",
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文",
  "fr": "Français",
  "es": "Español",
  "ja": "日本語"
};

export const LANGUAGE_PREFIXES: Record<SupportedLanguage, string> = {
  "en": "",
  "zh-TW": "非常重要：以下問題請一定要全文使用繁體中文回答，不要用其他語言回答！",
  "zh-CN": "非常重要：以下问题请一定要全文使用简体中文回答，不要用其他语言回答！",
  "fr": "Très important : veuillez répondre en français. ne répondez pas en anglais.",
  "es": "Muy importante: por favor responde completamente en español. No respondas en inglés.",
  "ja": "非常に重要：以下の質問には必ず日本語で全文回答してください。英語では回答しないでください。"
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
