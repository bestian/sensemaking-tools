import { t } from "./i18n.js";

/**
 * Constants for alignment group labels and their test functions.
 * The `label` field is retained for backward compatibility with any external
 * consumer, but the generated alt text below does not embed it directly.
 * @type {Array<{key: string, label: string, test: Function}>}
 */
const alignmentGroupLabels = [
  { key: "high", label: "High Alignment", test: (d) => d.isHighAlignment },
  { key: "low", label: "Low Alignment", test: (d) => d.isLowAlignment },
  { key: "uncertainty", label: "Pass/Unsure", test: (d) => d.isHighUncertainty },
  {
    key: "uncategorized",
    label: "Uncategorized",
    test: (d) => !d.isHighAlignment && !d.isLowAlignment && !d.isHighUncertainty,
  },
];

/**
 * Calculates statistics for alignment groups within a topic.
 *
 * @param {Array} data - Array of statement objects
 * @param {string} topicFilter - Topic to filter statements by
 * @returns {Array<{label: string, percent: number, count: number}>} Array of group statistics
 */
function getAlignmentGroupStats(data, topicFilter) {
  const topicStatements = data.filter((d) => (d.topics || []).includes(topicFilter));
  const total = topicStatements.length;
  return alignmentGroupLabels.map(({ key, label, test }) => {
    const count = topicStatements.filter(test).length;
    return {
      label,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      count,
    };
  });
}

/**
 * Aggregates statistics for topics and subtopics.
 *
 * @param {Array} data - Array of statement objects
 * @returns {{totalStatements: number, topicCounts: Object, topicSubtopicCounts: Object}} Statistics object
 */
function getTopicAndSubtopicStats(data) {
  const totalStatements = data.length;
  const topicCounts = {};
  data.forEach((d) => {
    if (Array.isArray(d.topics)) {
      d.topics.forEach((topic) => {
        if (!topicCounts[topic]) topicCounts[topic] = 0;
        topicCounts[topic]++;
      });
    } else if (d.topics) {
      if (!topicCounts[d.topics]) topicCounts[d.topics] = 0;
      topicCounts[d.topics]++;
    }
  });
  const topicSubtopicCounts = {};
  data.forEach((d) => {
    if (Array.isArray(d.topics) && Array.isArray(d.subtopics)) {
      d.topics.forEach((topic, i) => {
        const subtopic = d.subtopics[i] || "";
        if (!topicSubtopicCounts[topic]) topicSubtopicCounts[topic] = {};
        if (!topicSubtopicCounts[topic][subtopic]) topicSubtopicCounts[topic][subtopic] = 0;
        topicSubtopicCounts[topic][subtopic]++;
      });
    }
  });
  return { totalStatements, topicCounts, topicSubtopicCounts };
}

/**
 * Formats the top N topics with their largest subtopic.
 *
 * @param {Object} topicCounts - Object mapping topics to their counts
 * @param {Object} topicSubtopicCounts - Object mapping topics to their subtopic counts
 * @param {number} totalStatements - Total number of statements
 * @param {number} [n=3] - Number of top topics to return
 * @returns {Array<string>} Array of formatted topic strings
 */
function formatTopTopics(topicCounts, topicSubtopicCounts, totalStatements, n = 3) {
  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
  return sortedTopics.map(([topic, count]) => {
    const percent = totalStatements > 0 ? Math.round((count / totalStatements) * 100) : 0;
    const subtopics = topicSubtopicCounts[topic] || {};
    const largestSubtopic = Object.entries(subtopics).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    return t("altTopTopic", { topic, percent, subtopic: largestSubtopic });
  });
}

/**
 * Generates alt text for different chart types and views.
 * Provides descriptive text for accessibility purposes.
 *
 * @param {Array} data - Array of statement objects
 * @param {string} chartType - Type of chart (e.g., 'topic-alignment', 'topics-distribution')
 * @param {string} view - View type (e.g., 'solid', 'waffle', 'cluster', 'scatter')
 * @param {string} [topicFilter] - Optional topic to filter by
 * @returns {string} Descriptive alt text for the chart
 */
export function generateAltText(data, chartType, view, topicFilter) {
  if (chartType === "topic-alignment" && view === "solid" && Array.isArray(data) && topicFilter) {
    const percentages = getAlignmentGroupStats(data, topicFilter);
    return t("altTopicAlignmentSolid", {
      topic: topicFilter,
      high: percentages[0].percent,
      low: percentages[1].percent,
      uncertainty: percentages[2].percent,
      uncategorized: percentages[3].percent,
    });
  }
  if (chartType === "topic-alignment" && view === "waffle" && Array.isArray(data) && topicFilter) {
    const percentages = getAlignmentGroupStats(data, topicFilter);
    return t("altTopicAlignmentWaffle", {
      topic: topicFilter,
      highPercent: percentages[0].percent,
      highCount: percentages[0].count,
      lowPercent: percentages[1].percent,
      lowCount: percentages[1].count,
      uncertaintyPercent: percentages[2].percent,
      uncertaintyCount: percentages[2].count,
      uncategorizedPercent: percentages[3].percent,
      uncategorizedCount: percentages[3].count,
    });
  }
  if (chartType === "topics-distribution" && view === "cluster" && Array.isArray(data)) {
    const { totalStatements, topicCounts, topicSubtopicCounts } = getTopicAndSubtopicStats(data);
    const topTopicLines = formatTopTopics(topicCounts, topicSubtopicCounts, totalStatements, 3);
    return t("altTopicsDistributionCluster", {
      totalStatements,
      topicCount: Object.keys(topicCounts).length,
      topTopics: topTopicLines.join("\n"),
    });
  }
  if (chartType === "topics-distribution" && view === "scatter" && Array.isArray(data)) {
    return t("altTopicsDistributionScatter");
  }
  if (chartType === "topics-overview" && Array.isArray(data)) {
    const { totalStatements, topicCounts, topicSubtopicCounts } = getTopicAndSubtopicStats(data);
    const topTopicLines = formatTopTopics(topicCounts, topicSubtopicCounts, totalStatements, 3);
    return t("altTopicsOverview", {
      totalStatements,
      topicCount: Object.keys(topicCounts).length,
      topTopics: topTopicLines.join("\n"),
    });
  }
  // Default fallback
  return t("altDefault");
}
