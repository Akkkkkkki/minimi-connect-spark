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

// Event Types
export type EventType = "social" | "professional" | "dating" | "hobby" | "sports";

export interface Event {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime?: string;
  eventType: EventType;
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
  eventId: string;
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

export interface EventParticipant {
  id: string;
  eventId: string;
  profileId: string;
  status: ParticipantStatus;
  createdAt: string;
  updatedAt: string;
}

// Match Types
export type MatchRoundStatus = "scheduled" | "completed" | "cancelled";

export interface MatchRound {
  id: string;
  eventId: string;
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
