import { SupportedLanguage } from "./languages";

// Report section titles and headers
export const REPORT_SECTIONS = {
  introduction: {
    "en": "## Introduction",
    "zh-TW": "## 簡介",
    "fr": "## Introduction"
  },
  overview: {
    "en": "## Overview",
    "zh-TW": "## 概述",
    "fr": "## Aperçu"
  },
  topics: {
    "en": "## Topics",
    "zh-TW": "## 主題",
    "fr": "## Sujets"
  },
  topSubtopics: {
    "en": "## Top {count} Most Discussed Subtopics",
    "zh-TW": "## 前 {count} 個最常討論的子主題",
    "fr": "## Top {count} des sous-sujets les plus discutés"
  },
  opinionGroups: {
    "en": "## Opinion Groups",
    "zh-TW": "## 意見群組",
    "fr": "## Groupes d'opinion"
  }
};

export function getReportSectionTitle(section: keyof typeof REPORT_SECTIONS, lang: SupportedLanguage, count?: number): string {
  let title = REPORT_SECTIONS[section][lang] || REPORT_SECTIONS[section]["en"];
  
  if (count !== undefined) {
    title = title.replace("{count}", count.toString());
  }
  
  return title;
}
