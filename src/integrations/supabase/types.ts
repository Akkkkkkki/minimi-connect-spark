export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event: {
        Row: {
          event_type: string
          applicants_max_number: number | null
          city: string | null
          country: string | null
          created_at: string
          creator_id: string
          description: string
          end_time: string | null
          has_questionnaire: boolean | null
          id: string
          images: Json | null
          lang: string | null
          location: string
          mail: string | null
          mobile: string | null
          qrcode: Json | null
          scope: string | null
          social_media: string | null
          start_time: string
          state: string | null
          tags: string[] | null
          title: string
          updated_at: string
          version: number | null
        }
        Insert: {
          event_type: string
          applicants_max_number?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          creator_id: string
          description: string
          end_time?: string | null
          has_questionnaire?: boolean | null
          id?: string
          images?: Json | null
          lang?: string | null
          location: string
          mail?: string | null
          mobile?: string | null
          qrcode?: Json | null
          scope?: string | null
          social_media?: string | null
          start_time: string
          state?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          event_type?: string
          applicants_max_number?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          creator_id?: string
          description?: string
          end_time?: string | null
          has_questionnaire?: boolean | null
          id?: string
          images?: Json | null
          lang?: string | null
          location?: string
          mail?: string | null
          mobile?: string | null
          qrcode?: Json | null
          scope?: string | null
          social_media?: string | null
          start_time?: string
          state?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: []
      }
      event_feedback: {
        Row: {
          event_id: string | null
          comment: string | null
          created_at: string
          id: number
          profile_id: string
          rating: number
        }
        Insert: {
          event_id?: string | null
          comment?: string | null
          created_at?: string
          id?: never
          profile_id: string
          rating: number
        }
        Update: {
          event_id?: string | null
          comment?: string | null
          created_at?: string
          id?: never
          profile_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_feedback_event_id_new_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_feedback_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      event_match_trigger_rule: {
        Row: {
          event_id: string | null
          create_time: string | null
          create_user_id: string | null
          created_at: string | null
          deleted: number | null
          executed: number | null
          id: number
          name: string | null
          sorted: number | null
          status: string | null
          trigger_time: number
          trigger_type: string | null
          update_time: string | null
          update_user_id: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          event_id?: string | null
          create_time?: string | null
          create_user_id?: string | null
          created_at?: string | null
          deleted?: number | null
          executed?: number | null
          id?: number
          name?: string | null
          sorted?: number | null
          status?: string | null
          trigger_time: number
          trigger_type?: string | null
          update_time?: string | null
          update_user_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          event_id?: string | null
          create_time?: string | null
          create_user_id?: string | null
          created_at?: string | null
          deleted?: number | null
          executed?: number | null
          id?: number
          name?: string | null
          sorted?: number | null
          status?: string | null
          trigger_time?: number
          trigger_type?: string | null
          update_time?: string | null
          update_user_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_match_trigger_rule_event_id_new_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participant: {
        Row: {
          event_id: string | null
          created_at: string
          id: number
          match_type: string | null
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          event_id?: string | null
          created_at?: string
          id?: never
          match_type?: string | null
          profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          event_id?: string | null
          created_at?: string
          id?: never
          match_type?: string | null
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participant_event_id_new_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
        ]
      }
      event_questionnaire: {
        Row: {
          event_id: string | null;
          id: string;
          version: number | null;
        }
        Insert: {
          event_id?: string | null;
          id?: string;
          version?: number | null;
        }
        Update: {
          event_id?: string | null;
          id?: string;
          version?: number | null;
        }
        Relationships: [
          {
            foreignKeyName: "event_questionnaire_event_id_new_fkey",
            columns: ["event_id"],
            isOneToOne: false,
            referencedRelation: "event",
            referencedColumns: ["id"]
          },
        ]
      }
      event_tag: {
        Row: {
          event_id: string | null
          tag_id: number
        }
        Insert: {
          event_id?: string | null
          tag_id: number
        }
        Update: {
          event_id?: string | null
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_tag_event_id_new_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_message: {
        Row: {
          body: string
          created_at: string
          id: number
          match_id: number
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: never
          match_id: number
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: never
          match_id?: number
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      match: {
        Row: {
          created_at: string
          icebreaker: string | null
          id: number
          is_mutual_match: boolean | null
          last_vote_update: string | null
          match_reason: string | null
          match_score: number
          profile_1_vote: string | null
          profile_2_vote: string | null
          profile_id_1: string
          profile_id_2: string
          round_id: number
        }
        Insert: {
          created_at?: string
          icebreaker?: string | null
          id?: never
          is_mutual_match?: boolean | null
          last_vote_update?: string | null
          match_reason?: string | null
          match_score: number
          profile_1_vote?: string | null
          profile_2_vote?: string | null
          profile_id_1: string
          profile_id_2: string
          round_id: number
        }
        Update: {
          created_at?: string
          icebreaker?: string | null
          id?: never
          is_mutual_match?: boolean | null
          last_vote_update?: string | null
          match_reason?: string | null
          match_score?: number
          profile_1_vote?: string | null
          profile_2_vote?: string | null
          profile_id_1?: string
          profile_id_2?: string
          round_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "matches_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "match_round"
            referencedColumns: ["id"]
          },
        ]
      }
      match_feedback: {
        Row: {
          created_at: string
          id: number
          is_positive: boolean
          match_id: number
          profile_id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          is_positive: boolean
          match_id: number
          profile_id: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          is_positive?: boolean
          match_id?: number
          profile_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_feedback_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match"
            referencedColumns: ["id"]
          },
        ]
      }
      match_round: {
        Row: {
          event_id: string | null
          created_at: string
          id: number
          name: string
          scheduled_time: string
          status: string
          updated_at: string
        }
        Insert: {
          event_id?: string | null
          created_at?: string
          id?: never
          name: string
          scheduled_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          event_id?: string | null
          created_at?: string
          id?: never
          name?: string
          scheduled_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_round_event_id_new_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_month: number | null
          birth_year: number | null
          city: string | null
          country: string | null
          create_user_id: string | null
          created_at: string | null
          deleted: boolean
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          update_user_id: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_month?: number | null
          birth_year?: number | null
          city?: string | null
          country?: string | null
          create_user_id?: string | null
          created_at?: string | null
          deleted?: boolean
          first_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          update_user_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_month?: number | null
          birth_year?: number | null
          city?: string | null
          country?: string | null
          create_user_id?: string | null
          created_at?: string | null
          deleted?: boolean
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          update_user_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      questionnaire_question: {
        Row: {
          id: string
          options: Json | null
          order: number
          question_text: string
          question_type: string
          questionnaire_id: string | null
          required: boolean | null
        }
        Insert: {
          id?: string
          options?: Json | null
          order: number
          question_text: string
          question_type: string
          questionnaire_id?: string | null
          required?: boolean | null
        }
        Update: {
          id?: string
          options?: Json | null
          order?: number
          question_text?: string
          question_type?: string
          questionnaire_id?: string | null
          required?: boolean | null
        }
        Relationships: []
      }
      questionnaire_response: {
        Row: {
          answers: Json | null
          created_at: string
          id: number
          participant_id: number
          question_id: string | null
          updated_at: string | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          id?: never
          participant_id: number
          question_id?: string | null
          updated_at?: string | null
        }
        Update: {
          answers?: Json | null
          created_at?: string
          id?: never
          participant_id?: number
          question_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_questionnaire_response_question"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_question"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_response_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "event_participant"
            referencedColumns: ["id"]
          },
        ]
      }
      tag: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
