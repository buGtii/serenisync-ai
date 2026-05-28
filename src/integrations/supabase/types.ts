export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          context: string
          created_at: string
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          context?: string
          created_at?: string
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          context?: string
          created_at?: string
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          at: string
          id: string
          ip: string | null
          metadata: Json | null
          resource: string | null
          resource_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          at?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          at?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      consents: {
        Row: {
          accepted_at: string
          id: string
          kind: Database["public"]["Enums"]["consent_kind"]
          user_id: string
          version: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          kind: Database["public"]["Enums"]["consent_kind"]
          user_id: string
          version: string
        }
        Update: {
          accepted_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["consent_kind"]
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      crisis_events: {
        Row: {
          created_at: string
          excerpt: string | null
          handled: boolean
          id: string
          kind: Database["public"]["Enums"]["crisis_kind"]
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          excerpt?: string | null
          handled?: boolean
          id?: string
          kind: Database["public"]["Enums"]["crisis_kind"]
          source?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          excerpt?: string | null
          handled?: boolean
          id?: string
          kind?: Database["public"]["Enums"]["crisis_kind"]
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      dsm_assessment_tools: {
        Row: {
          acronym: string | null
          description: string | null
          disorder_id: string | null
          id: string
          name: string
        }
        Insert: {
          acronym?: string | null
          description?: string | null
          disorder_id?: string | null
          id?: string
          name: string
        }
        Update: {
          acronym?: string | null
          description?: string | null
          disorder_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsm_assessment_tools_disorder_id_fkey"
            columns: ["disorder_id"]
            isOneToOne: false
            referencedRelation: "dsm_disorders"
            referencedColumns: ["id"]
          },
        ]
      }
      dsm_chapters: {
        Row: {
          color_hint: string | null
          created_at: string
          id: string
          number: number
          slug: string
          summary: string
          title: string
        }
        Insert: {
          color_hint?: string | null
          created_at?: string
          id?: string
          number: number
          slug: string
          summary: string
          title: string
        }
        Update: {
          color_hint?: string | null
          created_at?: string
          id?: string
          number?: number
          slug?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      dsm_criteria: {
        Row: {
          code: string
          description: string
          disorder_id: string
          id: string
          ordinal: number
        }
        Insert: {
          code: string
          description: string
          disorder_id: string
          id?: string
          ordinal?: number
        }
        Update: {
          code?: string
          description?: string
          disorder_id?: string
          id?: string
          ordinal?: number
        }
        Relationships: [
          {
            foreignKeyName: "dsm_criteria_disorder_id_fkey"
            columns: ["disorder_id"]
            isOneToOne: false
            referencedRelation: "dsm_disorders"
            referencedColumns: ["id"]
          },
        ]
      }
      dsm_disorders: {
        Row: {
          chapter_id: string
          comorbidities: string[] | null
          created_at: string
          cultural_considerations: string | null
          developmental_considerations: string | null
          differential_diagnoses: string[] | null
          duration_requirement: string | null
          exclusion_criteria: string | null
          functional_impairment: string | null
          gender_considerations: string | null
          icd10: string | null
          icd11: string | null
          id: string
          is_seeded: boolean
          name: string
          overview: string
          risk_factors: string[] | null
          slug: string
        }
        Insert: {
          chapter_id: string
          comorbidities?: string[] | null
          created_at?: string
          cultural_considerations?: string | null
          developmental_considerations?: string | null
          differential_diagnoses?: string[] | null
          duration_requirement?: string | null
          exclusion_criteria?: string | null
          functional_impairment?: string | null
          gender_considerations?: string | null
          icd10?: string | null
          icd11?: string | null
          id?: string
          is_seeded?: boolean
          name: string
          overview: string
          risk_factors?: string[] | null
          slug: string
        }
        Update: {
          chapter_id?: string
          comorbidities?: string[] | null
          created_at?: string
          cultural_considerations?: string | null
          developmental_considerations?: string | null
          differential_diagnoses?: string[] | null
          duration_requirement?: string | null
          exclusion_criteria?: string | null
          functional_impairment?: string | null
          gender_considerations?: string | null
          icd10?: string | null
          icd11?: string | null
          id?: string
          is_seeded?: boolean
          name?: string
          overview?: string
          risk_factors?: string[] | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsm_disorders_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "dsm_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      dsm_specifiers: {
        Row: {
          description: string | null
          disorder_id: string
          id: string
          label: string
        }
        Insert: {
          description?: string | null
          disorder_id: string
          id?: string
          label: string
        }
        Update: {
          description?: string | null
          disorder_id?: string
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsm_specifiers_disorder_id_fkey"
            columns: ["disorder_id"]
            isOneToOne: false
            referencedRelation: "dsm_disorders"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          body: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          anxiety: number | null
          created_at: string
          energy: number | null
          id: string
          mood: number
          note: string | null
          user_id: string
        }
        Insert: {
          anxiety?: number | null
          created_at?: string
          energy?: number | null
          id?: string
          mood: number
          note?: string | null
          user_id: string
        }
        Update: {
          anxiety?: number | null
          created_at?: string
          energy?: number | null
          id?: string
          mood?: number
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          locale: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          locale?: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          chapter_id: string | null
          created_at: string
          details: Json | null
          id: string
          score: number
          total: number
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          score: number
          total: number
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "dsm_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "guest"
        | "client"
        | "student"
        | "researcher"
        | "clinician"
        | "supervisor"
        | "admin"
      consent_kind:
        | "terms"
        | "privacy"
        | "clinical_disclaimer"
        | "ai_use"
        | "research"
      crisis_kind:
        | "suicide"
        | "self_harm"
        | "psychosis"
        | "violence"
        | "substance_withdrawal"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "guest",
        "client",
        "student",
        "researcher",
        "clinician",
        "supervisor",
        "admin",
      ],
      consent_kind: [
        "terms",
        "privacy",
        "clinical_disclaimer",
        "ai_use",
        "research",
      ],
      crisis_kind: [
        "suicide",
        "self_harm",
        "psychosis",
        "violence",
        "substance_withdrawal",
        "other",
      ],
    },
  },
} as const
