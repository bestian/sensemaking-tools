/**
 * Lightweight i18n helper for the visualization library.
 *
 * The active language is read from `document.documentElement.lang` (set by the
 * host application). Supported languages mirror those in the web-ui:
 *   en, zh-TW, zh-CN, fr, es, ja, de
 *
 * Translations may contain `{name}` placeholders that are interpolated via the
 * optional `params` argument of `t(key, params)`.
 */

const DICT = {
  en: {
    groupAlignment: "Alignment",
    groupUncertainty: "Uncertainty",
    groupUncategorized: "Uncategorized",
    sectionHigh: "High",
    sectionLow: "Low",
    ofStatements: "Of statements",
    topicSubtitle: "({subtopicCount} subtopics, {totalStatements} total statements)",
    downloadData: "Download Data",
    downloadDataAria: "Download data for this chart",
    votedAgree: "voted agree",
    votedDisagree: "voted disagree",
    votedUnsurePass: 'voted "unsure/pass"',
    totalVotes: "total votes",
    agree: "Agree",
    disagree: "Disagree",
    unsurePassed: "Unsure/Passed",
  },
  "zh-TW": {
    groupAlignment: "一致性",
    groupUncertainty: "不確定性",
    groupUncategorized: "未分類",
    sectionHigh: "高",
    sectionLow: "低",
    ofStatements: "的留言",
    topicSubtitle: "（{subtopicCount} 個子主題，共 {totalStatements} 則留言）",
    downloadData: "下載資料",
    downloadDataAria: "下載此圖表的資料",
    votedAgree: "投票同意",
    votedDisagree: "投票不同意",
    votedUnsurePass: "投票「不確定／略過」",
    totalVotes: "總票數",
    agree: "同意",
    disagree: "不同意",
    unsurePassed: "不確定／略過",
  },
  "zh-CN": {
    groupAlignment: "一致性",
    groupUncertainty: "不确定性",
    groupUncategorized: "未分类",
    sectionHigh: "高",
    sectionLow: "低",
    ofStatements: "的留言",
    topicSubtitle: "（{subtopicCount} 个子主题，共 {totalStatements} 条留言）",
    downloadData: "下载数据",
    downloadDataAria: "下载此图表的数据",
    votedAgree: "投票同意",
    votedDisagree: "投票不同意",
    votedUnsurePass: "投票“不确定／略过”",
    totalVotes: "总票数",
    agree: "同意",
    disagree: "不同意",
    unsurePassed: "不确定／略过",
  },
  fr: {
    groupAlignment: "Alignement",
    groupUncertainty: "Incertitude",
    groupUncategorized: "Non catégorisé",
    sectionHigh: "Élevé",
    sectionLow: "Faible",
    ofStatements: "des déclarations",
    topicSubtitle: "({subtopicCount} sous-sujets, {totalStatements} déclarations au total)",
    downloadData: "Télécharger les données",
    downloadDataAria: "Télécharger les données de ce graphique",
    votedAgree: "ont voté d’accord",
    votedDisagree: "ont voté contre",
    votedUnsurePass: "ont voté « incertain/passer »",
    totalVotes: "votes au total",
    agree: "D’accord",
    disagree: "Pas d’accord",
    unsurePassed: "Incertain/Passer",
  },
  es: {
    groupAlignment: "Alineación",
    groupUncertainty: "Incertidumbre",
    groupUncategorized: "Sin categorizar",
    sectionHigh: "Alto",
    sectionLow: "Bajo",
    ofStatements: "de las declaraciones",
    topicSubtitle: "({subtopicCount} subtemas, {totalStatements} declaraciones en total)",
    downloadData: "Descargar datos",
    downloadDataAria: "Descargar los datos de este gráfico",
    votedAgree: "votaron a favor",
    votedDisagree: "votaron en contra",
    votedUnsurePass: "votaron «inseguro/pasar»",
    totalVotes: "votos en total",
    agree: "De acuerdo",
    disagree: "En desacuerdo",
    unsurePassed: "Inseguro/Pasar",
  },
  ja: {
    groupAlignment: "合意度",
    groupUncertainty: "不確実性",
    groupUncategorized: "未分類",
    sectionHigh: "高",
    sectionLow: "低",
    ofStatements: "のステートメント",
    topicSubtitle: "（{subtopicCount} 件のサブトピック、合計 {totalStatements} 件のステートメント）",
    downloadData: "データをダウンロード",
    downloadDataAria: "このグラフのデータをダウンロード",
    votedAgree: "が賛成",
    votedDisagree: "が反対",
    votedUnsurePass: "が「不明／パス」",
    totalVotes: "総投票数",
    agree: "賛成",
    disagree: "反対",
    unsurePassed: "不明／パス",
  },
  de: {
    groupAlignment: "Übereinstimmung",
    groupUncertainty: "Unsicherheit",
    groupUncategorized: "Nicht kategorisiert",
    sectionHigh: "Hoch",
    sectionLow: "Gering",
    ofStatements: "der Aussagen",
    topicSubtitle: "({subtopicCount} Unterthemen, {totalStatements} Aussagen insgesamt)",
    downloadData: "Daten herunterladen",
    downloadDataAria: "Daten für dieses Diagramm herunterladen",
    votedAgree: "stimmten zu",
    votedDisagree: "lehnten ab",
    votedUnsurePass: "stimmten mit „unsicher/überspringen“",
    totalVotes: "Abstimmungen insgesamt",
    agree: "Zustimmen",
    disagree: "Ablehnen",
    unsurePassed: "Unsicher/Überspringen",
  },
};

const DEFAULT_LANG = "en";

function normalizeLang(lang) {
  if (!lang) return DEFAULT_LANG;
  const lower = String(lang).toLowerCase();
  if (lower === "zh-tw" || lower === "zh_tw" || lower === "zh-hant") return "zh-TW";
  if (lower === "zh-cn" || lower === "zh_cn" || lower === "zh-hans" || lower === "zh") return "zh-CN";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("en")) return "en";
  return DEFAULT_LANG;
}

function getCurrentLang() {
  if (typeof document !== "undefined" && document.documentElement) {
    return normalizeLang(document.documentElement.lang);
  }
  return DEFAULT_LANG;
}

/**
 * Translate a key for the currently-active language.
 * Falls back to English, and finally to the raw key if missing everywhere.
 *
 * @param {string} key - Translation key.
 * @param {Object} [params] - Optional `{name}` placeholder values.
 * @returns {string} Translated string.
 */
export function t(key, params) {
  const lang = getCurrentLang();
  const dict = DICT[lang] || DICT[DEFAULT_LANG];
  let str = dict[key];
  if (str === undefined) {
    str = DICT[DEFAULT_LANG][key];
  }
  if (str === undefined) {
    str = key;
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}
