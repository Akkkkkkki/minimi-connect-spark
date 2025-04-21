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
      activity: {
        Row: {
          activity_type: string
          created_at: string
          creator_id: string
          description: string
          end_time: string | null
          id: number
          location: string
          start_time: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          creator_id: string
          description: string
          end_time?: string | null
          id?: never
          location: string
          start_time: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          creator_id?: string
          description?: string
          end_time?: string | null
          id?: never
          location?: string
          start_time?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_feedback: {
        Row: {
          activity_id: number
          comment: string | null
          created_at: string
          id: number
          profile_id: string
          rating: number
        }
        Insert: {
          activity_id: number
          comment?: string | null
          created_at?: string
          id?: never
          profile_id: string
          rating: number
        }
        Update: {
          activity_id?: number
          comment?: string | null
          created_at?: string
          id?: never
          profile_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feedback_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_participant: {
        Row: {
          activity_id: number
          answers: Json | null
          created_at: string
          id: number
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          activity_id: number
          answers?: Json | null
          created_at?: string
          id?: never
          profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity_id?: number
          answers?: Json | null
          created_at?: string
          id?: never
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_participants_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_tag: {
        Row: {
          activity_id: number
          tag_id: number
        }
        Insert: {
          activity_id: number
          tag_id: number
        }
        Update: {
          activity_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_tag_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_tag_tag_id_fkey"
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
          match_reason: string | null
          match_score: number
          profile_id_1: string
          profile_id_2: string
          round_id: number
        }
        Insert: {
          created_at?: string
          icebreaker?: string | null
          id?: never
          match_reason?: string | null
          match_score: number
          profile_id_1: string
          profile_id_2: string
          round_id: number
        }
        Update: {
          created_at?: string
          icebreaker?: string | null
          id?: never
          match_reason?: string | null
          match_score?: number
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
          activity_id: number
          created_at: string
          id: number
          name: string
          scheduled_time: string
          status: string
          updated_at: string
        }
        Insert: {
          activity_id: number
          created_at?: string
          id?: never
          name: string
          scheduled_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity_id?: number
          created_at?: string
          id?: never
          name?: string
          scheduled_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_rounds_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity"
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
          created_at: string | null
          deleted: boolean
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_month?: number | null
          birth_year?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted?: boolean
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_month?: number | null
          birth_year?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted?: boolean
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questionnaire: {
        Row: {
          activity_id: number
          created_at: string
          description: string | null
          id: number
          questions: Json
          title: string
        }
        Insert: {
          activity_id: number
          created_at?: string
          description?: string | null
          id?: never
          questions?: Json
          title: string
        }
        Update: {
          activity_id?: number
          created_at?: string
          description?: string | null
          id?: never
          questions?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaires_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_response: {
        Row: {
          answers: Json
          created_at: string
          id: number
          participant_id: number
          questionnaire_id: number
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: never
          participant_id: number
          questionnaire_id: number
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: never
          participant_id?: number
          questionnaire_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_response_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "activity_participant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_response_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaire"
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
