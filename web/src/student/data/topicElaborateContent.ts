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

export interface SDEQuestionItem {
  number: number;
  question: string;
  officialDefinition?: string;
  whyNeeded?: string;
  problemBefore?: string;
  solution?: string;
  realWorldExample?: string;
  diagram?: string;
  whereUsed?: string[];
  explanation?: string;
  keyPoints?: string[];
  code?: string;
  output?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
  interviewAnswer: string;
}

export interface SDETrapItem {
  title: string;
  code?: string;
  answer?: string;
  output?: string;
  reason?: string;
}

export interface ComprehensiveDemo {
  title: string;
  code: string;
  output: string;
  explanation?: string;
  deepDiveNotes?: string[];
}

export interface SDEMentalModel {
  title: string;
  diagram: string;
  keyTakeaways: string[];
}

export interface TopicContent {
  slug: string;
  title: string;
  badge: string;
  levelHeading?: string;
  targetBanner?: {
    roles: string;
    tagline: string;
  };
  overview: string;
  sdeQuestions?: SDEQuestionItem[];
  comprehensiveDemo?: ComprehensiveDemo;
  sdeTraps?: SDETrapItem[];
  mentalModel?: SDEMentalModel;
  coreConcepts?: {
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
  subtopicBreakdowns?: Record<string, SubtopicDetail>;
}

export const TOPIC_CONTENT_REGISTRY: Record<string, TopicContent> = {
  ...LEVELS_1_TO_5,
  ...LEVELS_6_TO_10,
  ...LEVELS_11_TO_15,
  ...LEVELS_16_TO_20,
  ...LEVELS_21_TO_25,
  ...LEVELS_26_TO_30,
};
