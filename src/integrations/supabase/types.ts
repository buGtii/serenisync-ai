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
      assessment_administrations: {
        Row: {
          answers: Json
          client_id: string
          clinician_id: string | null
          created_at: string
          id: string
          instrument: string
          notes: string | null
          severity: string | null
          total_score: number
        }
        Insert: {
          answers: Json
          client_id: string
          clinician_id?: string | null
          created_at?: string
          id?: string
          instrument: string
          notes?: string | null
          severity?: string | null
          total_score: number
        }
        Update: {
          answers?: Json
          client_id?: string
          clinician_id?: string | null
          created_at?: string
          id?: string
          instrument?: string
          notes?: string | null
          severity?: string | null
          total_score?: number
        }
        Relationships: []
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
      booking_messages: {
        Row: {
          body: string
          booking_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          booking_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          booking_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          client_id: string
          created_at: string
          duration_minutes: number
          id: string
          message: string | null
          scheduled_at: string
          status: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          message?: string | null
          scheduled_at: string
          status?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          message?: string | null
          scheduled_at?: string
          status?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_assessments: {
        Row: {
          characteristics: Json
          client_id: string
          clinician_id: string
          complaints: Json
          created_at: string
          criteria_marks: Json
          id: string
          impairment: Json
          notes: string | null
          risk_flags: string[]
          severity: string | null
          specifiers: Json
          status: string
          title: string
          updated_at: string
          working_disorder_id: string | null
        }
        Insert: {
          characteristics?: Json
          client_id: string
          clinician_id: string
          complaints?: Json
          created_at?: string
          criteria_marks?: Json
          id?: string
          impairment?: Json
          notes?: string | null
          risk_flags?: string[]
          severity?: string | null
          specifiers?: Json
          status?: string
          title?: string
          updated_at?: string
          working_disorder_id?: string | null
        }
        Update: {
          characteristics?: Json
          client_id?: string
          clinician_id?: string
          complaints?: Json
          created_at?: string
          criteria_marks?: Json
          id?: string
          impairment?: Json
          notes?: string | null
          risk_flags?: string[]
          severity?: string | null
          specifiers?: Json
          status?: string
          title?: string
          updated_at?: string
          working_disorder_id?: string | null
        }
        Relationships: []
      }
      clinician_clients: {
        Row: {
          client_id: string
          clinician_id: string
          created_at: string
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          clinician_id: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          clinician_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinician_verifications: {
        Row: {
          created_at: string
          id: string
          license_country: string | null
          license_number: string | null
          notes: string | null
          organization: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specialization: string | null
          status: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          license_country?: string | null
          license_number?: string | null
          notes?: string | null
          organization?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialization?: string | null
          status?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          license_country?: string | null
          license_number?: string | null
          notes?: string | null
          organization?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialization?: string | null
          status?: string
          user_id?: string
          years_experience?: number | null
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
      dsm_bookmarks: {
        Row: {
          created_at: string
          disorder_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disorder_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disorder_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
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
          course: string | null
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
          prevalence: string | null
          risk_factors: string[] | null
          slug: string
          symptoms: string[] | null
          treatment_overview: string | null
        }
        Insert: {
          chapter_id: string
          comorbidities?: string[] | null
          course?: string | null
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
          prevalence?: string | null
          risk_factors?: string[] | null
          slug: string
          symptoms?: string[] | null
          treatment_overview?: string | null
        }
        Update: {
          chapter_id?: string
          comorbidities?: string[] | null
          course?: string | null
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
          prevalence?: string | null
          risk_factors?: string[] | null
          slug?: string
          symptoms?: string[] | null
          treatment_overview?: string | null
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
      dsm_quiz_questions: {
        Row: {
          chapter_id: string
          choices: Json
          correct_key: string
          created_at: string
          difficulty: number
          disorder_id: string | null
          explanation: string | null
          id: string
          question: string
        }
        Insert: {
          chapter_id: string
          choices: Json
          correct_key: string
          created_at?: string
          difficulty?: number
          disorder_id?: string | null
          explanation?: string | null
          id?: string
          question: string
        }
        Update: {
          chapter_id?: string
          choices?: Json
          correct_key?: string
          created_at?: string
          difficulty?: number
          disorder_id?: string | null
          explanation?: string | null
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsm_quiz_questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "dsm_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dsm_quiz_questions_disorder_id_fkey"
            columns: ["disorder_id"]
            isOneToOne: false
            referencedRelation: "dsm_disorders"
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
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clinician_details: Json | null
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          intent_role: string | null
          locale: string
          onboarded_at: string | null
          researcher_details: Json | null
          student_details: Json | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          clinician_details?: Json | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          intent_role?: string | null
          locale?: string
          onboarded_at?: string | null
          researcher_details?: Json | null
          student_details?: Json | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          clinician_details?: Json | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          intent_role?: string | null
          locale?: string
          onboarded_at?: string | null
          researcher_details?: Json | null
          student_details?: Json | null
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
      session_notes: {
        Row: {
          assessment: string | null
          client_id: string
          clinician_id: string
          created_at: string
          id: string
          objective: string | null
          plan: string | null
          risk_flags: string[] | null
          session_date: string
          subjective: string | null
          updated_at: string
        }
        Insert: {
          assessment?: string | null
          client_id: string
          clinician_id: string
          created_at?: string
          id?: string
          objective?: string | null
          plan?: string | null
          risk_flags?: string[] | null
          session_date?: string
          subjective?: string | null
          updated_at?: string
        }
        Update: {
          assessment?: string | null
          client_id?: string
          clinician_id?: string
          created_at?: string
          id?: string
          objective?: string | null
          plan?: string | null
          risk_flags?: string[] | null
          session_date?: string
          subjective?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      therapist_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          therapist_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          therapist_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          therapist_id?: string
        }
        Relationships: []
      }
      therapist_profiles: {
        Row: {
          accepting_new_clients: boolean
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          credentials: string | null
          currency: string
          display_name: string
          headline: string | null
          hourly_rate_cents: number | null
          id: string
          languages: string[]
          modalities: string[]
          specialties: string[]
          timezone: string | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          accepting_new_clients?: boolean
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          credentials?: string | null
          currency?: string
          display_name: string
          headline?: string | null
          hourly_rate_cents?: number | null
          id?: string
          languages?: string[]
          modalities?: string[]
          specialties?: string[]
          timezone?: string | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          accepting_new_clients?: boolean
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          credentials?: string | null
          currency?: string
          display_name?: string
          headline?: string | null
          hourly_rate_cents?: number | null
          id?: string
          languages?: string[]
          modalities?: string[]
          specialties?: string[]
          timezone?: string | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      treatment_plans: {
        Row: {
          client_id: string
          clinician_id: string
          created_at: string
          diagnosis: string | null
          goals: Json
          id: string
          interventions: Json
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          clinician_id: string
          created_at?: string
          diagnosis?: string | null
          goals?: Json
          id?: string
          interventions?: Json
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          clinician_id?: string
          created_at?: string
          diagnosis?: string | null
          goals?: Json
          id?: string
          interventions?: Json
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
