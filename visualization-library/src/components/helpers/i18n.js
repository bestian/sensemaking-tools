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

    // Label tooltips (topic-alignment chart)
    tipAlignment:
      "<b>Alignment</b><br/><br/>These statements showed an especially high or especially low level of alignment amongst participants",
    tipHigh:
      "<b>High Alignment</b><br/><br/>70% or more of participants agreed or disagreed with these statements.",
    tipLow:
      "<b>Low Alignment</b><br/><br/>Opinions were split. 40–60% of voters either agreed or disagreed with these statements.",
    tipUncategorized:
      "<b>Uncategorized</b><br/><br/>These statements do not meet criteria for high alignment, low alignment, or high uncertainty.",
    tipUncertainty:
      "<b>Uncertainty</b><br/><br/>Statements in this category were among the 25% most passed on in the conversation as a whole or were passed on by at least 20% of participants.",

    // Subtopic statement count shown in bar tooltips: "(N statements)"
    subtopicStatementCount: "({count} statements)",

    // topics-distribution scatter axis labels
    scatterAxisAgree100: "100% Agree",
    scatterAxisAgree0: "0% Agree",
    scatterAxisHighAgree: "High Alignment (Agree)",
    scatterAxisLow: "Low Alignment",
    scatterAxisHighDisagree: "High Alignment (Disagree)",

    // topics-distribution scatter axis tooltips
    scatterTipHighAgree:
      "<b>High alignment (Agree)</b><br/><br/>On average, 70% or more of participants agreed with statements in this subtopic.",
    scatterTipLow:
      "<b>Low alignment</b><br/><br/>Opinions were split. On average, 40–60% of voters either agreed or disagreed with statements in this subtopic.",
    scatterTipHighDisagree:
      "<b>High alignment (Disagree)</b><br/><br/>On average, 70% or more of participants disagreed with statements in this subtopic on average.",

    // topics-distribution cluster labels
    clusterSubtopicsOne: "1 subtopic",
    clusterSubtopicsMany: "{count} subtopics",
    clusterStatementsCount: "{count} statements",

    // topics-distribution bubble-size legend (HTML: may contain <br>)
    legendFewerStatements: "Fewer<br>Statements",
    legendMoreStatements: "More<br>Statements",

    // Accessibility alt-text (generateAltText.js)
    altTopicAlignmentSolid:
      "A tree map chart of the {topic} topic, depicting a percent breakdown of 4 categories: statements with High and Low Alignment, Pass/Unsure, and Uncategorized.\n\nThe High Alignment category was {high}%, Low Alignment category {low}%, Pass/unsure category {uncertainty}%, and Uncategorized category {uncategorized}%.",
    altTopicAlignmentWaffle:
      "A chart of the {topic} topic, depicting a percent breakdown of 4 categories: statements with High and Low Alignment, Pass/Unsure, and Uncategorized. Additionally each category is presented as a grid of squares, with each square representing an individual statement within the topic.\n\nThe High Alignment category was {highPercent}% (or {highCount} statements), Low Alignment category {lowPercent}% (or {lowCount} statements), Pass/unsure category {uncertaintyPercent}% (or {uncertaintyCount} statements), and Uncategorized category {uncategorizedPercent}% (or {uncategorizedCount} statements).",
    altTopicsDistributionCluster:
      "A breakdown of the {totalStatements} statements into {topicCount} topics, encoding each subtopic's quantity of statements using circle radius. The top 3 topics were:\n\n{topTopics}",
    altTopicsDistributionScatter:
      "A scatter plot of the average agreement rate for statements in each topic's subtopics. Each subtopic is placed on a scale of 0% to 100% agree, on average.\n\nEach subtopic is depicted as a circle, additionally encoding its quantity of statements using radius size.",
    altTopicsOverview:
      "A breakdown of the {totalStatements} statements into {topicCount} topics, encoding the topic's quantity of statements using rectangle width. The top 3 topics were:\n\n{topTopics}",
    altTopTopic:
      "- {topic}, with {percent}% of statements. Its largest subtopic was {subtopic}.",
    altDefault: "A data visualization showing data generated from the Sensemaker tools",
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

    tipAlignment: "<b>一致性</b><br/><br/>這些留言在參與者之間呈現特別高或特別低的一致性",
    tipHigh: "<b>高一致性</b><br/><br/>70% 以上參與者對這些留言投下相同方向（同意或不同意）。",
    tipLow: "<b>低一致性</b><br/><br/>意見分歧。這些留言中，約 40–60% 投票者分別選擇同意或不同意。",
    tipUncategorized: "<b>未分類</b><br/><br/>這些留言不符合高一致性、低一致性或高不確定性的條件。",
    tipUncertainty: "<b>不確定性</b><br/><br/>此類留言為整體對話中被略過比例前 25%，或至少有 20% 參與者選擇略過。",

    subtopicStatementCount: "（{count} 則留言）",

    scatterAxisAgree100: "100% 同意",
    scatterAxisAgree0: "0% 同意",
    scatterAxisHighAgree: "高一致性（同意）",
    scatterAxisLow: "低一致性",
    scatterAxisHighDisagree: "高一致性（不同意）",

    scatterTipHighAgree: "<b>高一致性（同意）</b><br/><br/>此子主題的留言平均有 70% 以上參與者投下同意。",
    scatterTipLow: "<b>低一致性</b><br/><br/>意見分歧。此子主題的留言平均有約 40–60% 投票者選擇同意或不同意。",
    scatterTipHighDisagree: "<b>高一致性（不同意）</b><br/><br/>此子主題的留言平均有 70% 以上參與者投下不同意。",

    clusterSubtopicsOne: "1 個子主題",
    clusterSubtopicsMany: "{count} 個子主題",
    clusterStatementsCount: "{count} 則留言",

    legendFewerStatements: "較少<br>留言",
    legendMoreStatements: "較多<br>留言",

    altTopicAlignmentSolid:
      "「{topic}」主題的樹狀地圖，顯示 4 個類別（高一致性、低一致性、不確定／略過、未分類）的百分比分佈。\n\n高一致性類別為 {high}%，低一致性類別為 {low}%，不確定／略過類別為 {uncertainty}%，未分類類別為 {uncategorized}%。",
    altTopicAlignmentWaffle:
      "「{topic}」主題的圖表，顯示 4 個類別（高一致性、低一致性、不確定／略過、未分類）的百分比分佈。每個類別以方格網格呈現，每個方格代表該主題內的一則留言。\n\n高一致性類別為 {highPercent}%（共 {highCount} 則留言），低一致性類別為 {lowPercent}%（共 {lowCount} 則留言），不確定／略過類別為 {uncertaintyPercent}%（共 {uncertaintyCount} 則留言），未分類類別為 {uncategorizedPercent}%（共 {uncategorizedCount} 則留言）。",
    altTopicsDistributionCluster:
      "將 {totalStatements} 則留言分為 {topicCount} 個主題的分佈圖，以圓形半徑表示各子主題的留言數量。前 3 大主題為：\n\n{topTopics}",
    altTopicsDistributionScatter:
      "各主題的子主題平均同意率散佈圖。每個子主題位於 0% 至 100% 平均同意的刻度上。\n\n每個子主題以圓形呈現，並以半徑大小表示其留言數量。",
    altTopicsOverview:
      "將 {totalStatements} 則留言分為 {topicCount} 個主題的概覽，以矩形寬度表示各主題的留言數量。前 3 大主題為：\n\n{topTopics}",
    altTopTopic: "- {topic}，占 {percent}% 留言。最大子主題為 {subtopic}。",
    altDefault: "以 Sensemaker 工具產生的資料視覺化圖表",
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

    tipAlignment: "<b>一致性</b><br/><br/>这些留言在参与者之间呈现特别高或特别低的一致性",
    tipHigh: "<b>高一致性</b><br/><br/>70% 以上参与者对这些留言投下相同方向（同意或不同意）。",
    tipLow: "<b>低一致性</b><br/><br/>意见分歧。这些留言中，约 40–60% 的投票者分别选择同意或不同意。",
    tipUncategorized: "<b>未分类</b><br/><br/>这些留言不符合高一致性、低一致性或高不确定性的条件。",
    tipUncertainty: "<b>不确定性</b><br/><br/>此类留言为整体对话中被略过比例前 25%，或至少有 20% 的参与者选择略过。",

    subtopicStatementCount: "（{count} 条留言）",

    scatterAxisAgree100: "100% 同意",
    scatterAxisAgree0: "0% 同意",
    scatterAxisHighAgree: "高一致性（同意）",
    scatterAxisLow: "低一致性",
    scatterAxisHighDisagree: "高一致性（不同意）",

    scatterTipHighAgree: "<b>高一致性（同意）</b><br/><br/>此子主题的留言平均有 70% 以上参与者投下同意。",
    scatterTipLow: "<b>低一致性</b><br/><br/>意见分歧。此子主题的留言平均约有 40–60% 的投票者选择同意或不同意。",
    scatterTipHighDisagree: "<b>高一致性（不同意）</b><br/><br/>此子主题的留言平均有 70% 以上参与者投下不同意。",

    clusterSubtopicsOne: "1 个子主题",
    clusterSubtopicsMany: "{count} 个子主题",
    clusterStatementsCount: "{count} 条留言",

    legendFewerStatements: "较少<br>留言",
    legendMoreStatements: "较多<br>留言",

    altTopicAlignmentSolid:
      "“{topic}”主题的树状地图，显示 4 个类别（高一致性、低一致性、不确定／略过、未分类）的百分比分布。\n\n高一致性类别为 {high}%，低一致性类别为 {low}%，不确定／略过类别为 {uncertainty}%，未分类类别为 {uncategorized}%。",
    altTopicAlignmentWaffle:
      "“{topic}”主题的图表，显示 4 个类别（高一致性、低一致性、不确定／略过、未分类）的百分比分布。每个类别以方格网格呈现，每个方格代表该主题内的一条留言。\n\n高一致性类别为 {highPercent}%（共 {highCount} 条留言），低一致性类别为 {lowPercent}%（共 {lowCount} 条留言），不确定／略过类别为 {uncertaintyPercent}%（共 {uncertaintyCount} 条留言），未分类类别为 {uncategorizedPercent}%（共 {uncategorizedCount} 条留言）。",
    altTopicsDistributionCluster:
      "将 {totalStatements} 条留言分为 {topicCount} 个主题的分布图，以圆形半径表示各子主题的留言数量。前 3 大主题为：\n\n{topTopics}",
    altTopicsDistributionScatter:
      "各主题的子主题平均同意率散点图。每个子主题位于 0% 至 100% 平均同意的刻度上。\n\n每个子主题以圆形呈现，并以半径大小表示其留言数量。",
    altTopicsOverview:
      "将 {totalStatements} 条留言分为 {topicCount} 个主题的概览，以矩形宽度表示各主题的留言数量。前 3 大主题为：\n\n{topTopics}",
    altTopTopic: "- {topic}，占 {percent}% 留言。最大子主题为 {subtopic}。",
    altDefault: "以 Sensemaker 工具生成的数据可视化图表",
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

    tipAlignment:
      "<b>Alignement</b><br/><br/>Ces déclarations présentaient un niveau d’alignement particulièrement élevé ou particulièrement faible parmi les participants",
    tipHigh:
      "<b>Alignement élevé</b><br/><br/>70 % ou plus des participants étaient d’accord ou en désaccord avec ces déclarations.",
    tipLow:
      "<b>Faible alignement</b><br/><br/>Les opinions étaient partagées. 40–60 % des votants étaient d’accord ou en désaccord avec ces déclarations.",
    tipUncategorized:
      "<b>Non catégorisé</b><br/><br/>Ces déclarations ne répondent pas aux critères d’alignement élevé, de faible alignement ou de forte incertitude.",
    tipUncertainty:
      "<b>Incertitude</b><br/><br/>Les déclarations de cette catégorie figurent parmi les 25 % les plus passées de la conversation, ou ont été passées par au moins 20 % des participants.",

    subtopicStatementCount: "({count} déclarations)",

    scatterAxisAgree100: "100 % d’accord",
    scatterAxisAgree0: "0 % d’accord",
    scatterAxisHighAgree: "Alignement élevé (d’accord)",
    scatterAxisLow: "Faible alignement",
    scatterAxisHighDisagree: "Alignement élevé (en désaccord)",

    scatterTipHighAgree:
      "<b>Alignement élevé (d’accord)</b><br/><br/>En moyenne, 70 % ou plus des participants étaient d’accord avec les déclarations de ce sous-sujet.",
    scatterTipLow:
      "<b>Faible alignement</b><br/><br/>Les opinions étaient partagées. En moyenne, 40–60 % des votants étaient d’accord ou en désaccord avec les déclarations de ce sous-sujet.",
    scatterTipHighDisagree:
      "<b>Alignement élevé (en désaccord)</b><br/><br/>En moyenne, 70 % ou plus des participants étaient en désaccord avec les déclarations de ce sous-sujet.",

    clusterSubtopicsOne: "1 sous-sujet",
    clusterSubtopicsMany: "{count} sous-sujets",
    clusterStatementsCount: "{count} déclarations",

    legendFewerStatements: "Moins de<br>déclarations",
    legendMoreStatements: "Plus de<br>déclarations",

    altTopicAlignmentSolid:
      "Une carte arborescente du sujet {topic}, présentant la répartition en pourcentage de 4 catégories : déclarations à alignement élevé, à faible alignement, à passer/incertain et non catégorisées.\n\nLa catégorie Alignement élevé représentait {high} %, la catégorie Faible alignement {low} %, la catégorie Passer/incertain {uncertainty} %, et la catégorie Non catégorisé {uncategorized} %.",
    altTopicAlignmentWaffle:
      "Un graphique du sujet {topic}, présentant la répartition en pourcentage de 4 catégories : déclarations à alignement élevé, à faible alignement, à passer/incertain et non catégorisées. Chaque catégorie est également présentée sous forme de grille de carrés, chaque carré représentant une déclaration individuelle du sujet.\n\nLa catégorie Alignement élevé représentait {highPercent} % (soit {highCount} déclarations), la catégorie Faible alignement {lowPercent} % (soit {lowCount} déclarations), la catégorie Passer/incertain {uncertaintyPercent} % (soit {uncertaintyCount} déclarations), et la catégorie Non catégorisé {uncategorizedPercent} % (soit {uncategorizedCount} déclarations).",
    altTopicsDistributionCluster:
      "Une répartition des {totalStatements} déclarations en {topicCount} sujets, encodant la quantité de déclarations de chaque sous-sujet par le rayon du cercle. Les 3 sujets principaux étaient :\n\n{topTopics}",
    altTopicsDistributionScatter:
      "Un nuage de points du taux d’accord moyen pour les déclarations des sous-sujets de chaque sujet. Chaque sous-sujet est placé sur une échelle de 0 % à 100 % d’accord en moyenne.\n\nChaque sous-sujet est représenté par un cercle, dont la taille du rayon encode la quantité de déclarations.",
    altTopicsOverview:
      "Une répartition des {totalStatements} déclarations en {topicCount} sujets, encodant la quantité de déclarations du sujet par la largeur du rectangle. Les 3 sujets principaux étaient :\n\n{topTopics}",
    altTopTopic:
      "- {topic}, avec {percent} % des déclarations. Son plus grand sous-sujet était {subtopic}.",
    altDefault: "Une visualisation de données générée à partir des outils Sensemaker",
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

    tipAlignment:
      "<b>Alineación</b><br/><br/>Estas declaraciones mostraron un nivel de alineación especialmente alto o especialmente bajo entre los participantes",
    tipHigh:
      "<b>Alta alineación</b><br/><br/>El 70 % o más de los participantes estuvo de acuerdo o en desacuerdo con estas declaraciones.",
    tipLow:
      "<b>Baja alineación</b><br/><br/>Las opiniones estuvieron divididas. Entre el 40 % y el 60 % de los votantes estuvo de acuerdo o en desacuerdo con estas declaraciones.",
    tipUncategorized:
      "<b>Sin categorizar</b><br/><br/>Estas declaraciones no cumplen los criterios de alta alineación, baja alineación o alta incertidumbre.",
    tipUncertainty:
      "<b>Incertidumbre</b><br/><br/>Las declaraciones de esta categoría se encontraban entre el 25 % más pasadas en la conversación o fueron pasadas por al menos el 20 % de los participantes.",

    subtopicStatementCount: "({count} declaraciones)",

    scatterAxisAgree100: "100 % de acuerdo",
    scatterAxisAgree0: "0 % de acuerdo",
    scatterAxisHighAgree: "Alta alineación (de acuerdo)",
    scatterAxisLow: "Baja alineación",
    scatterAxisHighDisagree: "Alta alineación (en desacuerdo)",

    scatterTipHighAgree:
      "<b>Alta alineación (de acuerdo)</b><br/><br/>En promedio, el 70 % o más de los participantes estuvo de acuerdo con las declaraciones de este subtema.",
    scatterTipLow:
      "<b>Baja alineación</b><br/><br/>Las opiniones estuvieron divididas. En promedio, entre el 40 % y el 60 % de los votantes estuvo de acuerdo o en desacuerdo con las declaraciones de este subtema.",
    scatterTipHighDisagree:
      "<b>Alta alineación (en desacuerdo)</b><br/><br/>En promedio, el 70 % o más de los participantes estuvo en desacuerdo con las declaraciones de este subtema.",

    clusterSubtopicsOne: "1 subtema",
    clusterSubtopicsMany: "{count} subtemas",
    clusterStatementsCount: "{count} declaraciones",

    legendFewerStatements: "Menos<br>declaraciones",
    legendMoreStatements: "Más<br>declaraciones",

    altTopicAlignmentSolid:
      "Un mapa de árbol del tema {topic}, con el desglose porcentual de 4 categorías: declaraciones de alta y baja alineación, pasar/inseguro y sin categorizar.\n\nLa categoría Alta alineación fue del {high} %, la categoría Baja alineación del {low} %, la categoría Pasar/inseguro del {uncertainty} % y la categoría Sin categorizar del {uncategorized} %.",
    altTopicAlignmentWaffle:
      "Un gráfico del tema {topic}, con el desglose porcentual de 4 categorías: declaraciones de alta y baja alineación, pasar/inseguro y sin categorizar. Además, cada categoría se presenta como una cuadrícula de cuadros, donde cada cuadro representa una declaración individual del tema.\n\nLa categoría Alta alineación fue del {highPercent} % (es decir, {highCount} declaraciones), la categoría Baja alineación del {lowPercent} % (es decir, {lowCount} declaraciones), la categoría Pasar/inseguro del {uncertaintyPercent} % (es decir, {uncertaintyCount} declaraciones) y la categoría Sin categorizar del {uncategorizedPercent} % (es decir, {uncategorizedCount} declaraciones).",
    altTopicsDistributionCluster:
      "Un desglose de las {totalStatements} declaraciones en {topicCount} temas, codificando la cantidad de declaraciones de cada subtema mediante el radio del círculo. Los 3 temas principales fueron:\n\n{topTopics}",
    altTopicsDistributionScatter:
      "Un gráfico de dispersión de la tasa media de acuerdo para las declaraciones de los subtemas de cada tema. Cada subtema se coloca en una escala del 0 % al 100 % de acuerdo, en promedio.\n\nCada subtema se representa como un círculo, cuyo tamaño de radio codifica su cantidad de declaraciones.",
    altTopicsOverview:
      "Un desglose de las {totalStatements} declaraciones en {topicCount} temas, codificando la cantidad de declaraciones del tema mediante el ancho del rectángulo. Los 3 temas principales fueron:\n\n{topTopics}",
    altTopTopic:
      "- {topic}, con el {percent} % de las declaraciones. Su mayor subtema fue {subtopic}.",
    altDefault: "Una visualización de datos generada con las herramientas Sensemaker",
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

    tipAlignment:
      "<b>合意度</b><br/><br/>これらのステートメントは、参加者の間で特に高いまたは特に低い合意度を示しました",
    tipHigh:
      "<b>高い合意度</b><br/><br/>70% 以上の参加者がこれらのステートメントに対して同じ方向（賛成または反対）に投票しました。",
    tipLow:
      "<b>低い合意度</b><br/><br/>意見は分かれました。投票者の 40〜60% がそれぞれ賛成または反対しました。",
    tipUncategorized:
      "<b>未分類</b><br/><br/>これらのステートメントは、高い合意度・低い合意度・高い不確実性のいずれの基準も満たしていません。",
    tipUncertainty:
      "<b>不確実性</b><br/><br/>このカテゴリのステートメントは、対話全体でパスされた割合の上位 25% に入るか、20% 以上の参加者にパスされたものです。",

    subtopicStatementCount: "（{count} 件のステートメント）",

    scatterAxisAgree100: "100% 賛成",
    scatterAxisAgree0: "0% 賛成",
    scatterAxisHighAgree: "高い合意度（賛成）",
    scatterAxisLow: "低い合意度",
    scatterAxisHighDisagree: "高い合意度（反対）",

    scatterTipHighAgree:
      "<b>高い合意度（賛成）</b><br/><br/>このサブトピックのステートメントでは、平均して 70% 以上の参加者が賛成しました。",
    scatterTipLow:
      "<b>低い合意度</b><br/><br/>意見は分かれました。このサブトピックのステートメントでは、平均して 40〜60% の投票者が賛成または反対しました。",
    scatterTipHighDisagree:
      "<b>高い合意度（反対）</b><br/><br/>このサブトピックのステートメントでは、平均して 70% 以上の参加者が反対しました。",

    clusterSubtopicsOne: "1 件のサブトピック",
    clusterSubtopicsMany: "{count} 件のサブトピック",
    clusterStatementsCount: "{count} 件のステートメント",

    legendFewerStatements: "少ない<br>ステートメント",
    legendMoreStatements: "多い<br>ステートメント",

    altTopicAlignmentSolid:
      "「{topic}」トピックのツリーマップチャートで、4 つのカテゴリ（高い合意度・低い合意度のステートメント、パス／不明、未分類）のパーセント内訳を示します。\n\n高い合意度カテゴリは {high}%、低い合意度カテゴリは {low}%、パス／不明カテゴリは {uncertainty}%、未分類カテゴリは {uncategorized}% でした。",
    altTopicAlignmentWaffle:
      "「{topic}」トピックのチャートで、4 つのカテゴリ（高い合意度・低い合意度のステートメント、パス／不明、未分類）のパーセント内訳を示します。さらに各カテゴリは正方形のグリッドとして表示され、各正方形はそのトピック内の個別のステートメントを表します。\n\n高い合意度カテゴリは {highPercent}%（{highCount} 件のステートメント）、低い合意度カテゴリは {lowPercent}%（{lowCount} 件のステートメント）、パス／不明カテゴリは {uncertaintyPercent}%（{uncertaintyCount} 件のステートメント）、未分類カテゴリは {uncategorizedPercent}%（{uncategorizedCount} 件のステートメント）でした。",
    altTopicsDistributionCluster:
      "{totalStatements} 件のステートメントを {topicCount} 件のトピックに分類した内訳で、各サブトピックのステートメント数を円の半径で表現しています。上位 3 件のトピック：\n\n{topTopics}",
    altTopicsDistributionScatter:
      "各トピックのサブトピックのステートメントの平均賛成率の散布図です。各サブトピックは平均 0% から 100% 賛成のスケール上に配置されています。\n\n各サブトピックは円として描かれ、半径の大きさでそのステートメント数も表しています。",
    altTopicsOverview:
      "{totalStatements} 件のステートメントを {topicCount} 件のトピックに分類した概要で、各トピックのステートメント数を長方形の幅で表現しています。上位 3 件のトピック：\n\n{topTopics}",
    altTopTopic:
      "- {topic}：ステートメントの {percent}% を占め、最大のサブトピックは {subtopic} でした。",
    altDefault: "Sensemaker ツールで生成されたデータの可視化",
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

    tipAlignment:
      "<b>Übereinstimmung</b><br/><br/>Diese Aussagen zeigten ein besonders hohes oder besonders niedriges Maß an Übereinstimmung unter den Teilnehmenden",
    tipHigh:
      "<b>Hohe Übereinstimmung</b><br/><br/>70 % oder mehr der Teilnehmenden stimmten diesen Aussagen zu oder lehnten sie ab.",
    tipLow:
      "<b>Geringe Übereinstimmung</b><br/><br/>Die Meinungen waren geteilt. 40–60 % der Abstimmenden stimmten diesen Aussagen zu oder lehnten sie ab.",
    tipUncategorized:
      "<b>Nicht kategorisiert</b><br/><br/>Diese Aussagen erfüllen weder die Kriterien für hohe Übereinstimmung, geringe Übereinstimmung noch für hohe Unsicherheit.",
    tipUncertainty:
      "<b>Unsicherheit</b><br/><br/>Aussagen in dieser Kategorie gehörten zu den 25 % am häufigsten übersprungenen Aussagen der gesamten Konversation oder wurden von mindestens 20 % der Teilnehmenden übersprungen.",

    subtopicStatementCount: "({count} Aussagen)",

    scatterAxisAgree100: "100 % Zustimmung",
    scatterAxisAgree0: "0 % Zustimmung",
    scatterAxisHighAgree: "Hohe Übereinstimmung (Zustimmung)",
    scatterAxisLow: "Geringe Übereinstimmung",
    scatterAxisHighDisagree: "Hohe Übereinstimmung (Ablehnung)",

    scatterTipHighAgree:
      "<b>Hohe Übereinstimmung (Zustimmung)</b><br/><br/>Im Durchschnitt stimmten 70 % oder mehr der Teilnehmenden den Aussagen dieses Unterthemas zu.",
    scatterTipLow:
      "<b>Geringe Übereinstimmung</b><br/><br/>Die Meinungen waren geteilt. Im Durchschnitt stimmten 40–60 % der Abstimmenden den Aussagen dieses Unterthemas zu oder lehnten sie ab.",
    scatterTipHighDisagree:
      "<b>Hohe Übereinstimmung (Ablehnung)</b><br/><br/>Im Durchschnitt lehnten 70 % oder mehr der Teilnehmenden die Aussagen dieses Unterthemas ab.",

    clusterSubtopicsOne: "1 Unterthema",
    clusterSubtopicsMany: "{count} Unterthemen",
    clusterStatementsCount: "{count} Aussagen",

    legendFewerStatements: "Weniger<br>Aussagen",
    legendMoreStatements: "Mehr<br>Aussagen",

    altTopicAlignmentSolid:
      "Eine Baumkarte des Themas {topic}, die die prozentuale Aufschlüsselung von 4 Kategorien zeigt: Aussagen mit hoher und geringer Übereinstimmung, Überspringen/Unsicher sowie Nicht kategorisiert.\n\nDie Kategorie Hohe Übereinstimmung lag bei {high} %, die Kategorie Geringe Übereinstimmung bei {low} %, die Kategorie Überspringen/Unsicher bei {uncertainty} % und die Kategorie Nicht kategorisiert bei {uncategorized} %.",
    altTopicAlignmentWaffle:
      "Ein Diagramm des Themas {topic}, das die prozentuale Aufschlüsselung von 4 Kategorien zeigt: Aussagen mit hoher und geringer Übereinstimmung, Überspringen/Unsicher sowie Nicht kategorisiert. Zusätzlich wird jede Kategorie als Raster aus Quadraten dargestellt, wobei jedes Quadrat eine einzelne Aussage innerhalb des Themas repräsentiert.\n\nDie Kategorie Hohe Übereinstimmung lag bei {highPercent} % (d. h. {highCount} Aussagen), die Kategorie Geringe Übereinstimmung bei {lowPercent} % (d. h. {lowCount} Aussagen), die Kategorie Überspringen/Unsicher bei {uncertaintyPercent} % (d. h. {uncertaintyCount} Aussagen) und die Kategorie Nicht kategorisiert bei {uncategorizedPercent} % (d. h. {uncategorizedCount} Aussagen).",
    altTopicsDistributionCluster:
      "Eine Aufschlüsselung der {totalStatements} Aussagen in {topicCount} Themen, wobei die Anzahl der Aussagen jedes Unterthemas über den Kreisradius kodiert ist. Die 3 wichtigsten Themen waren:\n\n{topTopics}",
    altTopicsDistributionScatter:
      "Ein Streudiagramm der durchschnittlichen Zustimmungsrate für Aussagen in den Unterthemen jedes Themas. Jedes Unterthema ist auf einer Skala von 0 % bis 100 % durchschnittlicher Zustimmung platziert.\n\nJedes Unterthema wird als Kreis dargestellt, dessen Radiusgröße zusätzlich die Anzahl der Aussagen kodiert.",
    altTopicsOverview:
      "Eine Aufschlüsselung der {totalStatements} Aussagen in {topicCount} Themen, wobei die Anzahl der Aussagen des Themas über die Rechteckbreite kodiert ist. Die 3 wichtigsten Themen waren:\n\n{topTopics}",
    altTopTopic:
      "- {topic}, mit {percent} % der Aussagen. Das größte Unterthema war {subtopic}.",
    altDefault: "Eine Datenvisualisierung, die aus den Sensemaker-Tools generiert wurde",
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
