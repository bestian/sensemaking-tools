import { SupportedLanguage } from "./languages";

// Topic summary related text
export const TOPIC_SUMMARIES = {
  topicSummary: {
    "en": "This topic included {subtopicCount} subtopic{subtopicPlural}, comprising a total of {statementCount} statement{statementPlural}.",
    "zh-TW": "此主題包含 {subtopicCount} 個子主題{subtopicPlural}，總共包含 {statementCount} 個意見{statementPlural}。",
    "fr": "Ce sujet comprenait {subtopicCount} sous-sujet{subtopicPlural}, comprenant un total de {statementCount} déclaration{statementPlural}."
  },
  relativeAgreement: {
    "en": "This subtopic had {level} compared to the other subtopics.",
    "zh-TW": "此子主題與其他子主題相比具有 {level}。",
    "fr": "Ce sous-sujet avait {level} par rapport aux autres sous-sujets."
  }
};

export function getTopicSummaryText(
  section: keyof typeof TOPIC_SUMMARIES,
  lang: SupportedLanguage,
  replacements: Record<string, string | number>
): string {
  let text = TOPIC_SUMMARIES[section][lang] || TOPIC_SUMMARIES[section]["en"];
  
  Object.entries(replacements).forEach(([key, value]) => {
    text = text.replace(new RegExp(`{${key}}`, 'g'), value.toString());
  });
  
  return text;
}

// Helper function to get plural forms
export function getPluralForm(count: number, lang: SupportedLanguage): string {
  if (count === 1) return "";
  
  switch (lang) {
    case "zh-TW":
      return "";
    case "fr":
      return "s";
    default: // en
      return "s";
  }
}
