
// Types for supabase tables
export interface Activity {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time?: string;
  activity_type: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Questionnaire {
  id: string;
  activity_id: string;
  title: string;
  description?: string;
  questions: Question[];
  created_at?: string;
}

export interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "text";
  options?: string[];
  required: boolean;
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  profile_id: string;
  answers: Record<string, { answer: string | string[] }>;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  gender: string;
  birth_month: string;
  birth_year: string;
  avatar_url?: string;
}

export interface Match {
  id: string;
  round_id: string;
  profile_id_1: string;
  profile_id_2: string;
  match_score: number;
  match_reason: string;
  icebreaker: string;
  created_at: string;
}

export interface MatchRound {
  id: string;
  activity_id: string;
  name: string;
  scheduled_time: string;
  status: string;
  created_at: string;
  updated_at?: string;
}
