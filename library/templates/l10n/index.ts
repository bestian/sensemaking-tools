// Main export file for the localization system
export * from './languages';
export * from './report_sections';
export * from './report_content';
export * from './subsection_titles';
export * from './topic_summaries';
export * from './statistics_messages';

// Re-export commonly used types and functions
export type { SupportedLanguage } from "./languages";
export { getLanguagePrefix, isValidLanguage } from "./languages";
export { getReportSectionTitle } from "./report_sections";
export { getReportContent } from "./report_content";
export { getSubsectionTitle } from "./subsection_titles";
export { getTopicSummaryText, getPluralForm } from "./topic_summaries";
