export interface QuestionAttribute {
  id: string;
  questionId: string;
  type: 'hard_filter' | 'soft_preference';
  description: string;
  weight?: number;  // For soft preferences
  required?: boolean;  // For hard filters
}

import { QuestionnaireQuestion } from '@/utils/supabaseTypes';

export interface UserProfile {
  userId: string;
  name: string;
  gender: string;
  birth_month: string;
  birth_year: string;
  interests: string[];
  preferences: string[];
  personalityTraits: string[];
  activities: string[];
  answers: Record<string, any>;  // Questionnaire answers
  hardFilters: string[];  // Hard filter requirements
  softPreferences: string[];  // Soft preference requirements
}

export interface EventQuestionnaire {
  id: string;
  eventId: string;
  questions: QuestionnaireQuestion[];
  attributes: QuestionAttribute[];
}

export interface MatchingOptions {
  userId: string;
  eventId: string;
  targetUsers: UserProfile[];
  questionnaire: EventQuestionnaire;
  model?: string;
  temperature?: number;
  maxResults?: number;
}

export interface Candidate {
  userId: string;
  similarityScore: number;
  softPreferenceScore: number;
  combinedScore: number;
  index: number;
  explanation: string;
  commonInterests: string[];
  commonPreferences: string[];
  hardFilterMatches: number;
}

export interface MatchResult {
  userId: string;
  score: number;
  explanation: string;
  commonInterests: string[];
  commonPreferences: string[];
  hardFilterMatches: number;
  softPreferenceScore: number;
}

export interface MatchingResult {
  success: boolean;
  matches: MatchResult[];
  explanations: string;
  timestamp: string;
}
