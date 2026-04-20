// Centralized i18n dictionary for the web-ui report.
//
// Supported languages:
//   en    – English (default / fallback)
//   zh-TW – Traditional Chinese (Taiwan)
//   zh-CN – Simplified Chinese
//   fr    – French
//   es    – Spanish
//   ja    – Japanese
//
// Translation strings may include named placeholders in the form `{name}`
// which are interpolated at runtime by `translate(lang, key, params)`.

export const SUPPORTED_LANGS = ["en", "zh-TW", "zh-CN", "fr", "es", "ja"] as const;
export type UiLanguage = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: UiLanguage = "en";

// Maps a UI language to a BCP-47 locale used for number formatting.
export const NUMBER_LOCALE: Record<UiLanguage, string> = {
  en: "en-US",
  "zh-TW": "zh-TW",
  "zh-CN": "zh-CN",
  fr: "fr-FR",
  es: "es-ES",
  ja: "ja-JP",
};

// Normalize an arbitrary language tag to one of the supported UI languages.
export function normalizeLang(lang?: string | null): UiLanguage {
  if (!lang) return DEFAULT_LANG;
  const lower = lang.toLowerCase();
  if (lower === "zh-tw" || lower === "zh_tw" || lower === "zh-hant") return "zh-TW";
  if (lower === "zh-cn" || lower === "zh_cn" || lower === "zh-hans" || lower === "zh") return "zh-CN";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("en")) return "en";
  // Fallback if the value already matches a supported lang (any casing variant
  // we did not handle above is unlikely – default to English).
  return DEFAULT_LANG;
}

type Dict = Record<string, string>;

// English source strings. Keys ending in `_*` are usually segments combined in
// the template to form a sentence (used when the sentence contains inline
// elements such as Material tooltips).
const EN: Dict = {
  // Report-level fallbacks / metadata
  reportFallbackTitle: "Report",
  reportFallbackSubtitle: "Structured public-input analysis generated with a local model.",
  metaLocalModel: "Local model",
  metaGenerated: "Generated",
  metaStatements: "statements",
  sourceExport: "Source export",

  // Header buttons
  shareReport: "Share Report",
  reportOverview: "Report Overview",
  reportTopics: "Report Topics",

  // Share dialog defaults
  dialogShareReportTitle: "Share report",
  dialogShareReportText: "Copy link to share report",
  shareSection: "Share",
  shareConversationOverviewTitle: "Share 'Conversation overview'",
  shareConversationOverviewText: "Copy link to share the report overview",
  shareParticipantAlignmentTitle: "Share 'Participant alignment'",
  shareParticipantAlignmentText: "Copy link to share the report alignment",
  shareTopicTitlePrefix: "Share '{topic}'",
  shareTopicText: "Copy link to share this topic",

  // About-this-report card
  aboutReportTitle: "About this report",
  questionAsked: "Question asked:",
  // Sentence: "This report summarizes the results of public input, encompassing
  //   {statements} statements and {votes} votes. From the statements submitted,
  //   {topics} high level topics were identified, as well as {subtopics}
  //   subtopics. All voters were anonymous."
  aboutReportSummary:
    "This report summarizes the results of public input, encompassing {statements} statements and {votes} votes. From the statements submitted, {topics} high level topics were identified, as well as {subtopics} subtopics. All voters were anonymous.",
  // Sentence with inline tooltips:
  //   "The report below summarizes points of <high alignment>, <low alignment>,
  //    and <uncertainty> among participants."
  alignmentSummaryPrefix: "The report below summarizes points of ",
  alignmentSummarySep1: ", ",
  alignmentSummarySep2: ", and ",
  alignmentSummarySuffix: " among participants.",
  highAlignmentLabel: "high alignment",
  lowAlignmentLabel: "low alignment",
  uncertaintyLabel: "uncertainty",
  highAlignmentTooltip: "70% or more of participants voted the same way (e.g. 70% agree, or 70% disagree)",
  lowAlignmentTooltip: "Votes were about split between participants (e.g. 40% agree, 60% disagree, or vice versa)",
  uncertaintyTooltip: "More than 30% of participants voted “Unsure/pass”",

  // Breakdown widgets
  totalStatements: "Total statements",
  totalVotes: "Total votes",
  topicsCaptured: "Topics captured",

  // Conversation overview card
  conversationOverview: "Conversation overview",
  conversationOverviewDescription:
    "Below is a high level overview of the topics discussed in the conversation, as well as the percentage of statements categorized under each topic. Note that the percentages may add up to greater than 100% when statements fall under more than one topic.",

  // Participant alignment card
  participantAlignment: "Participant alignment",
  alignmentToggleHigh: "High alignment",
  alignmentToggleLow: "Low alignment",
  alignmentToggleUncertainty: "Uncertainty",
  // Sentence: "Across <all topics and subtopics>, participants found the
  //   <alignmentString> on the following statements."
  alignSentencePrefix: "Across ",
  alignSentenceScope: "all topics and subtopics",
  alignSentenceMiddle: ", participants found the ",
  alignSentenceSuffix: " on the following statements.",
  alignmentHighest: "highest alignment",
  alignmentLowest: "lowest alignment",
  alignmentUncertainty: "highest uncertainty",

  // Topics section
  topicsIdentified: "topics identified",
  subtopicsLabel: "Subtopics",
  toggleGroupings: "Groupings",
  toggleStatements: "Statements",

  // Subtopic comparison sentence:
  //   "This subtopic had <alignment> and <engagement> compared to the other subtopics."
  subComparePrefix: "This subtopic had ",
  subCompareMiddle: " and ",
  subCompareSuffix: " compared to the other subtopics.",

  prominentThemes: "Prominent themes emerged from all statements submitted:",

  highestAlignmentSubtopic: "Participants found the highest alignment on the following statements:",
  highAlignmentDescription: "70% or more of participants agreed or disagreed with these statements.",
  noHighAlignment: "There were no statements in this subtopic that fit within the threshold of “high alignment.”",

  lowestAlignmentSubtopic: "Participants found the lowest alignment on the following statements:",
  lowAlignmentDescription: "Opinions were split. 40–60% of voters either agreed or disagreed with these statements.",
  noLowAlignment: "There were no statements in this subtopic that fit within the threshold of “low alignment.”",

  highUncertaintySubtopic: "There were high levels of uncertainty on the following statements:",
  highUncertaintyDescription:
    "Statements in this category were among the 25% most passed on in the conversation as a whole or were passed on by at least 20% of participants.",
  noHighUncertainty: "There were no statements in this subtopic that fit within the threshold of “uncertainty.”",

  // "View all statements in {subtopic}"
  viewAllStatementsPrefix: "View all statements in ",
  viewAllStatementsSuffix: "",

  // Drawer
  closeDrawer: "Close drawer",
  highAlignmentStatements: "High alignment statements",
  lowAlignmentStatements: "Low alignment statements",
  highUncertaintyStatements: "High uncertainty statements",
  uncategorizedStatements: "Uncategorized statements",
  uncategorizedDescription: "These statements do not meet criteria for high alignment, low alignment, or high uncertainty.",

  // Section title fragments used to look up matching content in the
  // model-generated summary JSON.  The English words are kept as-is to allow
  // matching English-only summaries even when the UI is rendered in another
  // language.
  sectionTopicsTitleContains: "Topics",
  sectionThemesTitleContains: "themes",

  // Dialog
  dialogClose: "Close",
  dialogCopyLink: "Copy link to clipboard",

  // Statement card
  votedAgree: "voted agree",
  votedDisagree: "voted disagree",
  votedUnsurePass: "voted “unsure/pass”",
  topicsLabel: "Topic(s):",
  totalVotesLabel: "total votes",
  agree: "Agree",
  disagree: "Disagree",
  unsurePass: "“Unsure/Pass”",

  // Document title
  documentTitle: "Sensemaking report",
};

const ZH_TW: Dict = {
  reportFallbackTitle: "報告",
  reportFallbackSubtitle: "由本機模型產生的結構化公眾意見分析。",
  metaLocalModel: "本機模型",
  metaGenerated: "產生時間",
  metaStatements: "則留言",
  sourceExport: "來源匯出",

  shareReport: "分享報告",
  reportOverview: "報告總覽",
  reportTopics: "報告主題",

  dialogShareReportTitle: "分享報告",
  dialogShareReportText: "複製連結以分享此報告",
  shareSection: "分享",
  shareConversationOverviewTitle: "分享「對話總覽」",
  shareConversationOverviewText: "複製連結以分享報告總覽",
  shareParticipantAlignmentTitle: "分享「參與者一致性」",
  shareParticipantAlignmentText: "複製連結以分享一致性分析",
  shareTopicTitlePrefix: "分享「{topic}」",
  shareTopicText: "複製連結以分享此主題",

  aboutReportTitle: "關於此報告",
  questionAsked: "提問：",
  aboutReportSummary:
    "此報告總結公眾意見輸入結果，共涵蓋 {statements} 則留言與 {votes} 票。從提交的留言中，系統識別出 {topics} 個高層主題與 {subtopics} 個子主題。所有投票者皆為匿名。",
  alignmentSummaryPrefix: "以下報告整理參與者之間的",
  alignmentSummarySep1: "、",
  alignmentSummarySep2: "與",
  alignmentSummarySuffix: "重點。",
  highAlignmentLabel: "高一致性",
  lowAlignmentLabel: "低一致性",
  uncertaintyLabel: "不確定性",
  highAlignmentTooltip: "70% 以上參與者投票方向一致（例如 70% 同意，或 70% 不同意）",
  lowAlignmentTooltip: "參與者票數接近對半（例如 40% 同意、60% 不同意，反之亦然）",
  uncertaintyTooltip: "30% 以上參與者選擇「不確定／略過」",

  totalStatements: "留言總數",
  totalVotes: "投票總數",
  topicsCaptured: "識別主題數",

  conversationOverview: "對話總覽",
  conversationOverviewDescription:
    "以下為本次對話中的主題高層總覽，以及各主題所涵蓋留言的比例。若單一留言同時歸屬於多個主題，百分比總和可能超過 100%。",

  participantAlignment: "參與者一致性",
  alignmentToggleHigh: "高一致性",
  alignmentToggleLow: "低一致性",
  alignmentToggleUncertainty: "不確定性",
  alignSentencePrefix: "在",
  alignSentenceScope: "所有主題與子主題",
  alignSentenceMiddle: "中，參與者在以下留言呈現",
  alignSentenceSuffix: "。",
  alignmentHighest: "最高一致性",
  alignmentLowest: "最低一致性",
  alignmentUncertainty: "最高不確定性",

  topicsIdentified: "個已識別主題",
  subtopicsLabel: "子主題",
  toggleGroupings: "分群",
  toggleStatements: "留言",

  subComparePrefix: "相較於其他子主題，此子主題呈現",
  subCompareMiddle: "的一致性與",
  subCompareSuffix: "的參與度。",

  prominentThemes: "從所有提交留言中浮現的主要主題群：",

  highestAlignmentSubtopic: "參與者在以下留言呈現最高一致性：",
  highAlignmentDescription: "70% 以上參與者對這些留言投下相同方向（同意或不同意）。",
  noHighAlignment: "此子主題中沒有符合「高一致性」門檻的留言。",

  lowestAlignmentSubtopic: "參與者在以下留言呈現最低一致性：",
  lowAlignmentDescription: "意見分歧。這些留言中，約 40–60% 投票者分別選擇同意或不同意。",
  noLowAlignment: "此子主題中沒有符合「低一致性」門檻的留言。",

  highUncertaintySubtopic: "以下留言呈現較高不確定性：",
  highUncertaintyDescription:
    "此類留言為整體對話中被略過比例前 25%，或至少有 20% 參與者選擇略過。",
  noHighUncertainty: "此子主題中沒有符合「不確定性」門檻的留言。",

  viewAllStatementsPrefix: "查看",
  viewAllStatementsSuffix: "的全部留言",

  closeDrawer: "關閉側欄",
  highAlignmentStatements: "高一致性留言",
  lowAlignmentStatements: "低一致性留言",
  highUncertaintyStatements: "高不確定性留言",
  uncategorizedStatements: "未分類留言",
  uncategorizedDescription: "這些留言不符合高一致性、低一致性或高不確定性的條件。",

  sectionTopicsTitleContains: "主題",
  sectionThemesTitleContains: "主題群",

  dialogClose: "關閉",
  dialogCopyLink: "複製連結到剪貼簿",

  votedAgree: "投票同意",
  votedDisagree: "投票不同意",
  votedUnsurePass: "投票「不確定／略過」",
  topicsLabel: "主題：",
  totalVotesLabel: "總票數",
  agree: "同意",
  disagree: "不同意",
  unsurePass: "「不確定／略過」",

  documentTitle: "意見分析報告",
};

const ZH_CN: Dict = {
  reportFallbackTitle: "报告",
  reportFallbackSubtitle: "由本地模型生成的结构化公众意见分析。",
  metaLocalModel: "本地模型",
  metaGenerated: "生成时间",
  metaStatements: "条留言",
  sourceExport: "来源导出",

  shareReport: "分享报告",
  reportOverview: "报告总览",
  reportTopics: "报告主题",

  dialogShareReportTitle: "分享报告",
  dialogShareReportText: "复制链接以分享此报告",
  shareSection: "分享",
  shareConversationOverviewTitle: "分享“对话总览”",
  shareConversationOverviewText: "复制链接以分享报告总览",
  shareParticipantAlignmentTitle: "分享“参与者一致性”",
  shareParticipantAlignmentText: "复制链接以分享一致性分析",
  shareTopicTitlePrefix: "分享“{topic}”",
  shareTopicText: "复制链接以分享此主题",

  aboutReportTitle: "关于此报告",
  questionAsked: "提问：",
  aboutReportSummary:
    "此报告总结了公众意见的输入结果，共涵盖 {statements} 条留言和 {votes} 票。从提交的留言中，系统识别出 {topics} 个高层主题以及 {subtopics} 个子主题。所有投票者均为匿名。",
  alignmentSummaryPrefix: "以下报告整理了参与者之间的",
  alignmentSummarySep1: "、",
  alignmentSummarySep2: "与",
  alignmentSummarySuffix: "重点。",
  highAlignmentLabel: "高一致性",
  lowAlignmentLabel: "低一致性",
  uncertaintyLabel: "不确定性",
  highAlignmentTooltip: "70% 以上参与者的投票方向一致（例如 70% 同意，或 70% 不同意）",
  lowAlignmentTooltip: "参与者票数接近对半（例如 40% 同意、60% 不同意，反之亦然）",
  uncertaintyTooltip: "超过 30% 的参与者选择“不确定／略过”",

  totalStatements: "留言总数",
  totalVotes: "投票总数",
  topicsCaptured: "识别主题数",

  conversationOverview: "对话总览",
  conversationOverviewDescription:
    "以下是本次对话中所讨论主题的高层总览，以及每个主题所涵盖的留言比例。若单条留言同时归属于多个主题，百分比之和可能超过 100%。",

  participantAlignment: "参与者一致性",
  alignmentToggleHigh: "高一致性",
  alignmentToggleLow: "低一致性",
  alignmentToggleUncertainty: "不确定性",
  alignSentencePrefix: "在",
  alignSentenceScope: "所有主题与子主题",
  alignSentenceMiddle: "中，参与者在以下留言中呈现",
  alignSentenceSuffix: "。",
  alignmentHighest: "最高一致性",
  alignmentLowest: "最低一致性",
  alignmentUncertainty: "最高不确定性",

  topicsIdentified: "个已识别主题",
  subtopicsLabel: "子主题",
  toggleGroupings: "分组",
  toggleStatements: "留言",

  subComparePrefix: "相较于其他子主题，此子主题呈现",
  subCompareMiddle: "的一致性与",
  subCompareSuffix: "的参与度。",

  prominentThemes: "从所有提交的留言中浮现的主要主题群：",

  highestAlignmentSubtopic: "参与者在以下留言中呈现最高一致性：",
  highAlignmentDescription: "70% 以上参与者对这些留言投下相同方向（同意或不同意）。",
  noHighAlignment: "此子主题中没有符合“高一致性”门槛的留言。",

  lowestAlignmentSubtopic: "参与者在以下留言中呈现最低一致性：",
  lowAlignmentDescription: "意见分歧。这些留言中，约 40–60% 的投票者分别选择同意或不同意。",
  noLowAlignment: "此子主题中没有符合“低一致性”门槛的留言。",

  highUncertaintySubtopic: "以下留言呈现较高的不确定性：",
  highUncertaintyDescription:
    "此类留言为整体对话中被略过比例前 25%，或至少有 20% 的参与者选择略过。",
  noHighUncertainty: "此子主题中没有符合“不确定性”门槛的留言。",

  viewAllStatementsPrefix: "查看",
  viewAllStatementsSuffix: "的全部留言",

  closeDrawer: "关闭侧栏",
  highAlignmentStatements: "高一致性留言",
  lowAlignmentStatements: "低一致性留言",
  highUncertaintyStatements: "高不确定性留言",
  uncategorizedStatements: "未分类留言",
  uncategorizedDescription: "这些留言不符合高一致性、低一致性或高不确定性的条件。",

  sectionTopicsTitleContains: "主题",
  sectionThemesTitleContains: "主题群",

  dialogClose: "关闭",
  dialogCopyLink: "复制链接到剪贴板",

  votedAgree: "投票同意",
  votedDisagree: "投票不同意",
  votedUnsurePass: "投票“不确定／略过”",
  topicsLabel: "主题：",
  totalVotesLabel: "总票数",
  agree: "同意",
  disagree: "不同意",
  unsurePass: "“不确定／略过”",

  documentTitle: "意见分析报告",
};

const FR: Dict = {
  reportFallbackTitle: "Rapport",
  reportFallbackSubtitle: "Analyse structurée des contributions publiques générée avec un modèle local.",
  metaLocalModel: "Modèle local",
  metaGenerated: "Généré le",
  metaStatements: "déclarations",
  sourceExport: "Export source",

  shareReport: "Partager le rapport",
  reportOverview: "Aperçu du rapport",
  reportTopics: "Sujets du rapport",

  dialogShareReportTitle: "Partager le rapport",
  dialogShareReportText: "Copier le lien pour partager le rapport",
  shareSection: "Partager",
  shareConversationOverviewTitle: "Partager « Aperçu de la conversation »",
  shareConversationOverviewText: "Copier le lien pour partager l’aperçu du rapport",
  shareParticipantAlignmentTitle: "Partager « Alignement des participants »",
  shareParticipantAlignmentText: "Copier le lien pour partager l’alignement du rapport",
  shareTopicTitlePrefix: "Partager « {topic} »",
  shareTopicText: "Copier le lien pour partager ce sujet",

  aboutReportTitle: "À propos de ce rapport",
  questionAsked: "Question posée :",
  aboutReportSummary:
    "Ce rapport résume les résultats des contributions publiques, couvrant {statements} déclarations et {votes} votes. À partir des déclarations soumises, {topics} grands sujets ont été identifiés, ainsi que {subtopics} sous-sujets. Tous les votants étaient anonymes.",
  alignmentSummaryPrefix: "Le rapport ci-dessous résume les points d’",
  alignmentSummarySep1: ", de ",
  alignmentSummarySep2: " et d’",
  alignmentSummarySuffix: " parmi les participants.",
  highAlignmentLabel: "alignement élevé",
  lowAlignmentLabel: "faible alignement",
  uncertaintyLabel: "incertitude",
  highAlignmentTooltip:
    "70 % ou plus des participants ont voté dans le même sens (par ex. 70 % d’accord ou 70 % en désaccord)",
  lowAlignmentTooltip:
    "Les votes étaient à peu près partagés entre les participants (par ex. 40 % d’accord, 60 % en désaccord, ou inversement)",
  uncertaintyTooltip: "Plus de 30 % des participants ont voté « Incertain/passer »",

  totalStatements: "Total des déclarations",
  totalVotes: "Total des votes",
  topicsCaptured: "Sujets capturés",

  conversationOverview: "Aperçu de la conversation",
  conversationOverviewDescription:
    "Vous trouverez ci-dessous un aperçu général des sujets abordés dans la conversation, ainsi que le pourcentage de déclarations classées dans chaque sujet. Notez que les pourcentages peuvent dépasser 100 % lorsque des déclarations relèvent de plusieurs sujets.",

  participantAlignment: "Alignement des participants",
  alignmentToggleHigh: "Alignement élevé",
  alignmentToggleLow: "Faible alignement",
  alignmentToggleUncertainty: "Incertitude",
  alignSentencePrefix: "Sur ",
  alignSentenceScope: "l’ensemble des sujets et sous-sujets",
  alignSentenceMiddle: ", les participants ont trouvé l’",
  alignSentenceSuffix: " sur les déclarations suivantes.",
  alignmentHighest: "alignement le plus élevé",
  alignmentLowest: "alignement le plus faible",
  alignmentUncertainty: "incertitude la plus élevée",

  topicsIdentified: "sujets identifiés",
  subtopicsLabel: "Sous-sujets",
  toggleGroupings: "Regroupements",
  toggleStatements: "Déclarations",

  subComparePrefix: "Ce sous-sujet présentait ",
  subCompareMiddle: " et ",
  subCompareSuffix: " par rapport aux autres sous-sujets.",

  prominentThemes: "Thèmes saillants ressortis de toutes les déclarations soumises :",

  highestAlignmentSubtopic: "Les participants ont trouvé l’alignement le plus élevé sur les déclarations suivantes :",
  highAlignmentDescription: "70 % ou plus des participants étaient d’accord ou en désaccord avec ces déclarations.",
  noHighAlignment: "Aucune déclaration de ce sous-sujet ne franchit le seuil d’« alignement élevé ».",

  lowestAlignmentSubtopic: "Les participants ont trouvé l’alignement le plus faible sur les déclarations suivantes :",
  lowAlignmentDescription:
    "Les opinions étaient partagées. 40–60 % des votants étaient d’accord ou en désaccord avec ces déclarations.",
  noLowAlignment: "Aucune déclaration de ce sous-sujet ne franchit le seuil de « faible alignement ».",

  highUncertaintySubtopic: "Les déclarations suivantes présentaient un fort niveau d’incertitude :",
  highUncertaintyDescription:
    "Les déclarations de cette catégorie figurent parmi les 25 % les plus passées de la conversation dans son ensemble, ou ont été passées par au moins 20 % des participants.",
  noHighUncertainty: "Aucune déclaration de ce sous-sujet ne franchit le seuil d’« incertitude ».",

  viewAllStatementsPrefix: "Voir toutes les déclarations dans ",
  viewAllStatementsSuffix: "",

  closeDrawer: "Fermer le panneau",
  highAlignmentStatements: "Déclarations à alignement élevé",
  lowAlignmentStatements: "Déclarations à faible alignement",
  highUncertaintyStatements: "Déclarations à forte incertitude",
  uncategorizedStatements: "Déclarations non catégorisées",
  uncategorizedDescription:
    "Ces déclarations ne répondent pas aux critères d’alignement élevé, de faible alignement ou de forte incertitude.",

  sectionTopicsTitleContains: "Sujets",
  sectionThemesTitleContains: "thèmes",

  dialogClose: "Fermer",
  dialogCopyLink: "Copier le lien dans le presse-papiers",

  votedAgree: "ont voté d’accord",
  votedDisagree: "ont voté contre",
  votedUnsurePass: "ont voté « incertain/passer »",
  topicsLabel: "Sujet(s) :",
  totalVotesLabel: "votes au total",
  agree: "D’accord",
  disagree: "Pas d’accord",
  unsurePass: "« Incertain/Passer »",

  documentTitle: "Rapport d’analyse",
};

const ES: Dict = {
  reportFallbackTitle: "Informe",
  reportFallbackSubtitle: "Análisis estructurado de aportes públicos generado con un modelo local.",
  metaLocalModel: "Modelo local",
  metaGenerated: "Generado",
  metaStatements: "declaraciones",
  sourceExport: "Exportación origen",

  shareReport: "Compartir informe",
  reportOverview: "Resumen del informe",
  reportTopics: "Temas del informe",

  dialogShareReportTitle: "Compartir informe",
  dialogShareReportText: "Copiar enlace para compartir el informe",
  shareSection: "Compartir",
  shareConversationOverviewTitle: "Compartir «Resumen de la conversación»",
  shareConversationOverviewText: "Copiar enlace para compartir el resumen del informe",
  shareParticipantAlignmentTitle: "Compartir «Alineación de los participantes»",
  shareParticipantAlignmentText: "Copiar enlace para compartir la alineación del informe",
  shareTopicTitlePrefix: "Compartir «{topic}»",
  shareTopicText: "Copiar enlace para compartir este tema",

  aboutReportTitle: "Acerca de este informe",
  questionAsked: "Pregunta planteada:",
  aboutReportSummary:
    "Este informe resume los resultados de los aportes públicos, abarcando {statements} declaraciones y {votes} votos. A partir de las declaraciones enviadas, se identificaron {topics} temas de alto nivel, así como {subtopics} subtemas. Todos los votantes fueron anónimos.",
  alignmentSummaryPrefix: "El informe a continuación resume los puntos de ",
  alignmentSummarySep1: ", de ",
  alignmentSummarySep2: " y de ",
  alignmentSummarySuffix: " entre los participantes.",
  highAlignmentLabel: "alta alineación",
  lowAlignmentLabel: "baja alineación",
  uncertaintyLabel: "incertidumbre",
  highAlignmentTooltip:
    "El 70 % o más de los participantes votó del mismo modo (p. ej., 70 % a favor o 70 % en contra)",
  lowAlignmentTooltip:
    "Los votos se repartieron de forma equilibrada entre los participantes (p. ej., 40 % a favor, 60 % en contra, o viceversa)",
  uncertaintyTooltip: "Más del 30 % de los participantes votó «Inseguro/pasar»",

  totalStatements: "Total de declaraciones",
  totalVotes: "Total de votos",
  topicsCaptured: "Temas detectados",

  conversationOverview: "Resumen de la conversación",
  conversationOverviewDescription:
    "A continuación se muestra un resumen de alto nivel de los temas tratados en la conversación, así como el porcentaje de declaraciones clasificadas en cada tema. Tenga en cuenta que los porcentajes pueden sumar más del 100 % cuando una declaración pertenece a más de un tema.",

  participantAlignment: "Alineación de los participantes",
  alignmentToggleHigh: "Alta alineación",
  alignmentToggleLow: "Baja alineación",
  alignmentToggleUncertainty: "Incertidumbre",
  alignSentencePrefix: "En ",
  alignSentenceScope: "todos los temas y subtemas",
  alignSentenceMiddle: ", los participantes mostraron la ",
  alignSentenceSuffix: " en las siguientes declaraciones.",
  alignmentHighest: "mayor alineación",
  alignmentLowest: "menor alineación",
  alignmentUncertainty: "mayor incertidumbre",

  topicsIdentified: "temas identificados",
  subtopicsLabel: "Subtemas",
  toggleGroupings: "Agrupaciones",
  toggleStatements: "Declaraciones",

  subComparePrefix: "Este subtema presentó ",
  subCompareMiddle: " y ",
  subCompareSuffix: " en comparación con los otros subtemas.",

  prominentThemes: "Temas destacados surgidos de todas las declaraciones enviadas:",

  highestAlignmentSubtopic: "Los participantes mostraron la mayor alineación en las siguientes declaraciones:",
  highAlignmentDescription: "El 70 % o más de los participantes estuvo de acuerdo o en desacuerdo con estas declaraciones.",
  noHighAlignment: "No hubo declaraciones en este subtema que cumplieran el umbral de «alta alineación».",

  lowestAlignmentSubtopic: "Los participantes mostraron la menor alineación en las siguientes declaraciones:",
  lowAlignmentDescription:
    "Las opiniones estuvieron divididas. Entre el 40 % y el 60 % de los votantes estuvo de acuerdo o en desacuerdo con estas declaraciones.",
  noLowAlignment: "No hubo declaraciones en este subtema que cumplieran el umbral de «baja alineación».",

  highUncertaintySubtopic: "Hubo niveles altos de incertidumbre en las siguientes declaraciones:",
  highUncertaintyDescription:
    "Las declaraciones de esta categoría se encontraban entre el 25 % más pasadas en la conversación o fueron pasadas por al menos el 20 % de los participantes.",
  noHighUncertainty: "No hubo declaraciones en este subtema que cumplieran el umbral de «incertidumbre».",

  viewAllStatementsPrefix: "Ver todas las declaraciones en ",
  viewAllStatementsSuffix: "",

  closeDrawer: "Cerrar panel",
  highAlignmentStatements: "Declaraciones de alta alineación",
  lowAlignmentStatements: "Declaraciones de baja alineación",
  highUncertaintyStatements: "Declaraciones de alta incertidumbre",
  uncategorizedStatements: "Declaraciones sin categorizar",
  uncategorizedDescription:
    "Estas declaraciones no cumplen los criterios de alta alineación, baja alineación o alta incertidumbre.",

  sectionTopicsTitleContains: "Temas",
  sectionThemesTitleContains: "temas",

  dialogClose: "Cerrar",
  dialogCopyLink: "Copiar enlace al portapapeles",

  votedAgree: "votaron a favor",
  votedDisagree: "votaron en contra",
  votedUnsurePass: "votaron «inseguro/pasar»",
  topicsLabel: "Tema(s):",
  totalVotesLabel: "votos en total",
  agree: "De acuerdo",
  disagree: "En desacuerdo",
  unsurePass: "«Inseguro/Pasar»",

  documentTitle: "Informe de análisis",
};

const JA: Dict = {
  reportFallbackTitle: "レポート",
  reportFallbackSubtitle: "ローカルモデルで生成された、構造化された市民意見の分析。",
  metaLocalModel: "ローカルモデル",
  metaGenerated: "生成日時",
  metaStatements: "件のステートメント",
  sourceExport: "ソースのエクスポート",

  shareReport: "レポートを共有",
  reportOverview: "レポートの概要",
  reportTopics: "レポートのトピック",

  dialogShareReportTitle: "レポートを共有",
  dialogShareReportText: "リンクをコピーしてレポートを共有",
  shareSection: "共有",
  shareConversationOverviewTitle: "「対話の概要」を共有",
  shareConversationOverviewText: "リンクをコピーしてレポートの概要を共有",
  shareParticipantAlignmentTitle: "「参加者の合意度」を共有",
  shareParticipantAlignmentText: "リンクをコピーして合意度の分析を共有",
  shareTopicTitlePrefix: "「{topic}」を共有",
  shareTopicText: "リンクをコピーしてこのトピックを共有",

  aboutReportTitle: "このレポートについて",
  questionAsked: "問いかけ：",
  aboutReportSummary:
    "このレポートは公的な意見入力の結果をまとめたもので、{statements} 件のステートメントと {votes} 票を対象としています。提出されたステートメントから、{topics} 件の高レベルなトピックと {subtopics} 件のサブトピックが特定されました。すべての投票者は匿名です。",
  alignmentSummaryPrefix: "以下のレポートでは、参加者の中での",
  alignmentSummarySep1: "、",
  alignmentSummarySep2: "、および",
  alignmentSummarySuffix: "に関するポイントをまとめます。",
  highAlignmentLabel: "高い合意度",
  lowAlignmentLabel: "低い合意度",
  uncertaintyLabel: "不確実性",
  highAlignmentTooltip: "70% 以上の参加者が同じ方向に投票（例：70% が賛成、または 70% が反対）",
  lowAlignmentTooltip: "参加者の票がほぼ二分（例：40% が賛成、60% が反対、またはその逆）",
  uncertaintyTooltip: "30% を超える参加者が「不明／パス」に投票",

  totalStatements: "総ステートメント数",
  totalVotes: "総投票数",
  topicsCaptured: "特定されたトピック",

  conversationOverview: "対話の概要",
  conversationOverviewDescription:
    "以下は、対話で議論されたトピックの概要と、各トピックに分類されたステートメントの割合です。1 件のステートメントが複数のトピックに分類される場合、合計が 100% を超えることがあります。",

  participantAlignment: "参加者の合意度",
  alignmentToggleHigh: "高い合意度",
  alignmentToggleLow: "低い合意度",
  alignmentToggleUncertainty: "不確実性",
  alignSentencePrefix: "",
  alignSentenceScope: "すべてのトピックとサブトピック",
  alignSentenceMiddle: "において、参加者は以下のステートメントで",
  alignSentenceSuffix: "を示しました。",
  alignmentHighest: "最も高い合意度",
  alignmentLowest: "最も低い合意度",
  alignmentUncertainty: "最も高い不確実性",

  topicsIdentified: "件のトピックを特定",
  subtopicsLabel: "サブトピック",
  toggleGroupings: "グループ表示",
  toggleStatements: "ステートメント表示",

  subComparePrefix: "他のサブトピックと比較して、このサブトピックの合意度は ",
  subCompareMiddle: "、参加度は ",
  subCompareSuffix: " でした。",

  prominentThemes: "提出されたすべてのステートメントから浮かび上がった主要テーマ：",

  highestAlignmentSubtopic: "参加者は以下のステートメントで最も高い合意度を示しました：",
  highAlignmentDescription: "70% 以上の参加者がこれらのステートメントに対して同じ方向（賛成または反対）に投票しました。",
  noHighAlignment: "このサブトピックには「高い合意度」の閾値を満たすステートメントはありませんでした。",

  lowestAlignmentSubtopic: "参加者は以下のステートメントで最も低い合意度を示しました：",
  lowAlignmentDescription: "意見は分かれました。投票者の 40〜60% がそれぞれ賛成または反対しました。",
  noLowAlignment: "このサブトピックには「低い合意度」の閾値を満たすステートメントはありませんでした。",

  highUncertaintySubtopic: "以下のステートメントには高い不確実性が見られました：",
  highUncertaintyDescription:
    "このカテゴリのステートメントは、対話全体でパスされた割合の上位 25% に入るか、20% 以上の参加者にパスされたものです。",
  noHighUncertainty: "このサブトピックには「不確実性」の閾値を満たすステートメントはありませんでした。",

  viewAllStatementsPrefix: "",
  viewAllStatementsSuffix: " のすべてのステートメントを表示",

  closeDrawer: "ドロワーを閉じる",
  highAlignmentStatements: "高い合意度のステートメント",
  lowAlignmentStatements: "低い合意度のステートメント",
  highUncertaintyStatements: "高い不確実性のステートメント",
  uncategorizedStatements: "未分類のステートメント",
  uncategorizedDescription:
    "これらのステートメントは、高い合意度・低い合意度・高い不確実性のいずれの基準も満たしていません。",

  sectionTopicsTitleContains: "トピック",
  sectionThemesTitleContains: "テーマ",

  dialogClose: "閉じる",
  dialogCopyLink: "リンクをクリップボードにコピー",

  votedAgree: "が賛成",
  votedDisagree: "が反対",
  votedUnsurePass: "が「不明／パス」",
  topicsLabel: "トピック：",
  totalVotesLabel: "総投票数",
  agree: "賛成",
  disagree: "反対",
  unsurePass: "「不明／パス」",

  documentTitle: "意見分析レポート",
};

export const TRANSLATIONS: Record<UiLanguage, Dict> = {
  en: EN,
  "zh-TW": ZH_TW,
  "zh-CN": ZH_CN,
  fr: FR,
  es: ES,
  ja: JA,
};

// Translate a key for the given language. If the key is missing in the target
// language we fall back to English; if it is also missing there, we return the
// key itself so that missing translations stay visible.
//
// Optional `params` are interpolated into `{name}` placeholders.
export function translate(
  lang: UiLanguage,
  key: string,
  params?: Record<string, string | number>,
): string {
  let str = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}
