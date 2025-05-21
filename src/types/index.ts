// User & Profile Types
export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  name: string;
  gender: "Male" | "Female" | "Other";
  birthMonth: string;
  birthYear: string;
  city: string;
  country: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Activity Types
export type ActivityType = "social" | "professional" | "dating" | "hobby" | "sports";

export interface Activity {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime?: string;
  activityType: ActivityType;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Questionnaire Types
export type QuestionType = "multiple_choice" | "text";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  order: number;
}

export interface Questionnaire {
  id: string;
  activityId: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
}

export interface QuestionnaireResponse {
  questionId: string;
  answer: string | string[];
}

// Participant Types
export type ParticipantStatus = "pending" | "completed";

export interface ActivityParticipant {
  id: string;
  activityId: string;
  profileId: string;
  status: ParticipantStatus;
  createdAt: string;
  updatedAt: string;
}

// Match Types
export type MatchRoundStatus = "scheduled" | "completed" | "cancelled";

export interface MatchRound {
  id: string;
  activityId: string;
  name: string;
  scheduledTime: string;
  status: MatchRoundStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  roundId: string;
  profileId1: string;
  profileId2: string;
  matchScore: number;
  matchReason1: string | null;
  matchReason2: string | null;
  icebreaker1: string | null;
  icebreaker2: string | null;
  createdAt: string;
  // Deprecated fields:
  /** @deprecated Use matchReason1/matchReason2 */
  matchReason?: string;
  /** @deprecated Use icebreaker1/icebreaker2 */
  icebreaker?: string;
}

// Feedback Types
export interface MatchFeedback {
  id: string;
  matchId: string;
  profileId: string;
  isPositive: boolean;
  reason?: string;
  createdAt: string;
}
