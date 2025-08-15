import { SupportedLanguage } from "./languages";

// Define the structure for content sections
type ContentSection = {
  [key: string]: string;
};

type ContentStructure = {
  [section: string]: {
    [lang in SupportedLanguage]: ContentSection;
  };
};

// Report content and descriptions
export const REPORT_CONTENT: ContentStructure = {
  introduction: {
    "en": {
      text: "This report summarizes the results of public input, encompassing:",
      statements: "statements",
      votes: "votes",
      topics: "topics",
      subtopics: "subtopics",
      anonymous: "All voters were anonymous."
    },
    "zh-TW": {
      text: "本報告總結了公眾意見的結果，包含：",
      statements: "個意見",
      votes: "個投票",
      topics: "個主題",
      subtopics: "個子主題",
      anonymous: "所有投票者都是匿名的。"
    },
    "fr": {
      text: "Ce rapport résume les résultats de la contribution publique, comprenant :",
      statements: "déclarations",
      votes: "votes",
      topics: "sujets",
      subtopics: "sous-sujets",
      anonymous: "Tous les électeurs étaient anonymes."
    }
  },
  overview: {
    "en": {
      preamble: "Below is a high level overview of the topics discussed in the conversation, as well as the percentage of statements categorized under each topic. Note that the percentages may add up to greater than 100% when statements fall under more than one topic.\n\n"
    },
    "zh-TW": {
      preamble: "以下是對話中討論主題的高層次概述，以及每個主題下分類的意見百分比。請注意，當意見屬於多個主題時，百分比總和可能超過 100%。\n\n"
    },
    "fr": {
      preamble: "Voici un aperçu de haut niveau des sujets discutés dans la conversation, ainsi que le pourcentage de déclarations classées sous chaque sujet. Notez que les pourcentages peuvent s'ajouter à plus de 100% lorsque les déclarations relèvent de plusieurs sujets.\n\n"
    }
  },
  topics: {
    "en": {
      overview: "From the statements submitted, {topicCount} high level topics were identified{subtopicsText}. Based on voting patterns{groupsText} both points of common ground as well as differences of opinion {groupsBetweenText}have been identified and are described below.\n\n"
    },
    "zh-TW": {
      overview: "從提交的意見中，識別出 {topicCount} 個高層次主題{subtopicsText}。基於投票模式{groupsText} 已識別出共同點以及意見分歧 {groupsBetweenText}，並在下面描述。\n\n"
    },
    "fr": {
      overview: "À partir des déclarations soumises, {topicCount} sujets de haut niveau ont été identifiés{subtopicsText}. Sur la base des modèles de vote{groupsText} à la fois les points de terrain d'entente ainsi que les différences d'opinion {groupsBetweenText}ont été identifiés et sont décrits ci-dessous.\n\n"
    }
  },
  subtopics: {
    "en": {
      text: "as well as {count} subtopics"
    },
    "zh-TW": {
      text: "，以及 {count} 個子主題"
    },
    "fr": {
      text: ", ainsi que {count} sous-sujets"
    }
  },
  topSubtopics: {
    "en": {
      text: "{totalCount} subtopics of discussion emerged. These {topCount} subtopics had the most statements submitted."
    },
    "zh-TW": {
      text: "討論中出現了 {totalCount} 個子主題。這 {topCount} 個子主題收到的意見最多。"
    },
    "fr": {
      text: "{totalCount} sous-sujets de discussion ont émergé. Ces {topCount} sous-sujets avaient le plus de déclarations soumises."
    }
  },
  opinionGroups: {
    "en": {
      text: "{groupCount} distinct groups (named here as {groupNames}) emerged with differing viewpoints in relation to the submitted statements. The groups are based on people who tend to vote more similarly to each other than to those outside the group. However there are points of common ground where the groups voted similarly.\n\n"
    },
    "zh-TW": {
      text: "{groupCount} 個不同的群組（這裡命名為 {groupNames}）在提交的意見方面出現了不同的觀點。這些群組基於傾向於彼此投票更相似的人，而不是與群組外的人投票相似。然而，在群組投票相似的地方存在共同點。\n\n"
    },
    "fr": {
      text: "{groupCount} groupes distincts (nommés ici {groupNames}) ont émergé avec des points de vue différents par rapport aux déclarations soumises. Les groupes sont basés sur des personnes qui ont tendance à voter plus similairement les uns aux autres qu'à ceux en dehors du groupe. Cependant, il y a des points de terrain d'entente où les groupes ont voté de manière similaire.\n\n"
    }
  }
};

export function getReportContent(
  section: keyof typeof REPORT_CONTENT,
  subsection: string,
  lang: SupportedLanguage,
  replacements?: Record<string, string | number>
): string {
  const content = REPORT_CONTENT[section][lang] || REPORT_CONTENT[section]["en"];
  let text = content[subsection] as string;
  
  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      text = text.replace(new RegExp(`{${key}}`, 'g'), value.toString());
    });
  }
  
  return text;
}
