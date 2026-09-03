import { LEVELS_1_TO_5 } from './java/levels1_5';
import { LEVELS_6_TO_10 } from './java/levels6_10';
import { LEVELS_11_TO_15 } from './java/levels11_15';
import { LEVELS_16_TO_20 } from './java/levels16_20';
import { LEVELS_21_TO_25 } from './java/levels21_25';
import { LEVELS_26_TO_30 } from './java/levels26_30';

export interface SubtopicDetail {
  title: string;
  conceptSummary: string;
  keyPoints: string[];
  interviewQA: {
    question: string;
    answer: string;
  };
}

export interface TopicContent {
  slug: string;
  title: string;
  badge: string;
  overview: string;
  coreConcepts: {
    heading: string;
    description: string;
    bulletPoints?: string[];
    codeSnippet?: {
      title: string;
      language: string;
      code: string;
      explanation: string;
    };
  }[];
  comparisons?: {
    title: string;
    headers: string[];
    rows: string[][];
  };
  subtopicBreakdowns: Record<string, SubtopicDetail>;
}

export const TOPIC_CONTENT_REGISTRY: Record<string, TopicContent> = {
  ...LEVELS_1_TO_5,
  ...LEVELS_6_TO_10,
  ...LEVELS_11_TO_15,
  ...LEVELS_16_TO_20,
  ...LEVELS_21_TO_25,
  ...LEVELS_26_TO_30,
};
