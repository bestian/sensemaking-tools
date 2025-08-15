import { SupportedLanguage } from "./languages";

// Subsection titles and labels
export const SUBSECTION_TITLES = {
  prominentThemes: {
    "en": "Prominent themes were:",
    "zh-TW": "主要主題包括：",
    "fr": "Les thèmes principaux étaient :"
  },
  commonGround: {
    "en": "Common ground:",
    "zh-TW": "共同點：",
    "fr": "Terrain d'entente :"
  },
  commonGroundBetweenGroups: {
    "en": "Common ground between groups:",
    "zh-TW": "群組間的共同點：",
    "fr": "Terrain d'entente entre les groupes :"
  },
  differencesOfOpinion: {
    "en": "Differences of opinion:",
    "zh-TW": "意見分歧：",
    "fr": "Différences d'opinion :"
  },
  otherStatements: {
    "en": "**Other statements** ({count} statements",
    "zh-TW": "**其他意見** ({count} 個意見",
    "fr": "**Autres déclarations** ({count} déclarations"
  }
};

export function getSubsectionTitle(
  section: keyof typeof SUBSECTION_TITLES,
  lang: SupportedLanguage,
  count?: number
): string {
  let title = SUBSECTION_TITLES[section][lang] || SUBSECTION_TITLES[section]["en"];
  
  if (count !== undefined) {
    title = title.replace("{count}", count.toString());
  }
  
  return title;
}
