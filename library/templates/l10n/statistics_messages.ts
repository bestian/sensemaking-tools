import { SupportedLanguage } from "./languages";

// Statistics-related messages that appear in reports
export const STATISTICS_MESSAGES = {
  noCommonGround: {
    "en": `No statements met the thresholds necessary to be considered as a point of common ground (at least {minVoteCount} votes, and at least {minCommonGroundProb} agreement{acrossGroups}).`,
    "zh-TW": `沒有意見達到被視為共同點的必要門檻（至少需要 {minVoteCount} 個投票，且至少需要 {minCommonGroundProb} 的同意率{acrossGroups}）。`,
    "fr": `Aucune déclaration n'a atteint les seuils nécessaires pour être considérée comme un terrain d'entente (au moins {minVoteCount} votes et au moins {minCommonGroundProb} d'accord{acrossGroups}).`
  },
  noDifferencesOfOpinion: {
    "en": `No statements met the thresholds necessary to be considered as a significant difference of opinion (at least {minVoteCount} votes, and more than {minAgreeProbDifference} difference in agreement rate between groups).`,
    "zh-TW": `沒有意見達到被視為顯著意見分歧的必要門檻（至少需要 {minVoteCount} 個投票，且群組間同意率差異超過 {minAgreeProbDifference}）。`,
    "fr": `Aucune déclaration n'a atteint les seuils nécessaires pour être considérée comme une différence d'opinion significative (au moins {minVoteCount} votes et plus de {minAgreeProbDifference} de différence dans le taux d'accord entre les groupes).`
  },
  noCommonGroundDisagree: {
    "en": `No statements met the thresholds necessary to be considered as a point of common ground (at least {minVoteCount} votes, and at least {minCommonGroundProb} agreement across groups).`,
    "zh-TW": `沒有意見達到被視為群組間共同點的必要門檻（至少需要 {minVoteCount} 個投票，且至少需要 {minCommonGroundProb} 的群組間同意率）。`,
    "fr": `Aucune déclaration n'a atteint les seuils nécessaires pour être considérée comme un terrain d'entente entre les groupes (au moins {minVoteCount} votes et au moins {minCommonGroundProb} d'accord entre les groupes).`
  },
  noDifferencesOfOpinionGroups: {
    "en": `No statements met the thresholds necessary to be considered as a significant difference of opinion (at least {minVoteCount} votes, and more than {minAgreeProbDifference} difference in agreement rate between groups).`,
    "zh-TW": `沒有意見達到被視為群組間顯著意見分歧的必要門檻（至少需要 {minVoteCount} 個投票，且群組間同意率差異超過 {minAgreeProbDifference}）。`,
    "fr": `Aucune déclaration n'a atteint les seuils nécessaires pour être considérée comme une différence d'opinion significative entre les groupes (au moins {minVoteCount} votes et plus de {minAgreeProbDifference} de différence dans le taux d'accord entre les groupes).`
  }
};

export function getStatisticsMessage(
  messageType: keyof typeof STATISTICS_MESSAGES,
  lang: SupportedLanguage,
  replacements: Record<string, string | number>
): string {
  const message = STATISTICS_MESSAGES[messageType][lang] || STATISTICS_MESSAGES[messageType]["en"];
  let text = message;
  
  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      text = text.replace(new RegExp(`{${key}}`, 'g'), value.toString());
    });
  }
  
  return text;
}
