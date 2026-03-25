type VoteGroup = {
  agreeCount: number,
  disagreeCount: number,
  passCount: number,
};

type Statement = {
  id: string,
  text: string,
  votes: object,
  topics: string,
  passRate: number,
  agreeRate: number,
  disagreeRate: number,
  isHighAlignment: boolean,
  highAlignmentScore: number,
  isLowAlignment: boolean,
  lowAlignmentScore: number,
  isHighUncertainty: boolean,
  highUncertaintyScore: number,
  isFilteredOut: boolean,
};

type Subtopic = {
  name: string,
  commentCount: number,
  voteCount: number,
  relativeAlignment: string,
  relativeEngagement: string,
  comments?: Statement[],
  id?: string,
};

type Topic = {
  name: string,
  commentCount: number,
  voteCount: number,
  relativeAlignment: string,
  relativeEngagement: string,
  subtopicStats: Subtopic[],
};

type ReportMetadata = {
  title?: string,
  subtitle?: string,
  question?: string,
  sourceUrl?: string,
  modelName?: string,
  generatedAt?: string,
};

export {
  ReportMetadata,
  VoteGroup,
  Statement,
  Subtopic,
  Topic,
};
