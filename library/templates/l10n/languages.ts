// Supported languages configuration
export type SupportedLanguage = "en" | "zh-TW" | "zh-CN" | "fr" | "es" | "ja" | "de";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "zh-TW", "zh-CN", "fr", "es", "ja", "de"];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  "en": "English",
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文",
  "fr": "Français",
  "es": "Español",
  "ja": "日本語",
  "de": "Deutsch"
};

export const LANGUAGE_PREFIXES: Record<SupportedLanguage, string> = {
  "en": "",
  "zh-TW": "你是一個只會寫繁體中文的AI，請一定要全文使用繁體中文回答。禁止傳思路給我，只傳結果。",
  "zh-CN": "你是一个只会写简体中文的AI，请一定要全文使用简体中文回答。禁止传思路给我，只传结果。",
  "fr": "Tu es une IA qui ne sait écrire qu'en français. Veuillez répondre en français. Ne transmettez pas vos idées, transmettez uniquement les résultats.",
  "es": "Eres una IA que solo sabe escribir en español. Por favor responde en español. No transmitas tus ideas, transmite solo los resultados.",
  "ja": "あなたは日本語しか書けないAIです。必ず日本語で回答してください。ヒントを伝えないでください。",
  "de": "Du bist eine KI, die nur auf Deutsch schreiben kann. Bitte antworte ausschließlich auf Deutsch. Transmitte keine Ideen, transmitte nur die Ergebnisse."
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
