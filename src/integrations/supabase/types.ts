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
      activity_logs: {
        Row: {
          action: string
          id: string
          target_id: string | null
          target_type: string
          timestamp: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          id?: string
          target_id?: string | null
          target_type: string
          timestamp?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          id?: string
          target_id?: string | null
          target_type?: string
          timestamp?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_signatures: {
        Row: {
          created_at: string | null
          id: string
          qr_code_url: string | null
          signature_url: string | null
          status: string | null
          supervisor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          qr_code_url?: string | null
          signature_url?: string | null
          status?: string | null
          supervisor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          qr_code_url?: string | null
          signature_url?: string | null
          status?: string | null
          supervisor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          comments: string | null
          created_at: string | null
          document_url: string | null
          evaluation_date: string | null
          evaluator_id: string
          evaluator_type: string
          id: string
          score: number
          student_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          document_url?: string | null
          evaluation_date?: string | null
          evaluator_id: string
          evaluator_type: string
          id?: string
          score: number
          student_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          document_url?: string | null
          evaluation_date?: string | null
          evaluator_id?: string
          evaluator_type?: string
          id?: string
          score?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guidance_reports: {
        Row: {
          id: string
          notes: string | null
          report_url: string | null
          session_id: string
          submitted_at: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          report_url?: string | null
          session_id: string
          submitted_at?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          report_url?: string | null
          session_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guidance_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "guidance_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      guidance_sessions: {
        Row: {
          created_at: string | null
          id: string
          session_date: string
          session_type: string
          status: string
          student_id: string
          supervisor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_date: string
          session_type: string
          status?: string
          student_id: string
          supervisor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_date?: string
          session_type?: string
          status?: string
          student_id?: string
          supervisor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guidance_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guidance_sessions_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_documents: {
        Row: {
          description: string | null
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          title: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          description?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          title: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          description?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          title?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      kp_discussions: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          stage: string
          student_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          stage: string
          student_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          stage?: string
          student_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kp_discussions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kp_discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "kp_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kp_discussions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kp_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string
          file_url: string
          id: string
          status: string | null
          student_id: string
          supervisor_feedback: string | null
          updated_at: string | null
          uploaded_by: string
          version: number | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name: string
          file_url: string
          id?: string
          status?: string | null
          student_id: string
          supervisor_feedback?: string | null
          updated_at?: string | null
          uploaded_by: string
          version?: number | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          status?: string | null
          student_id?: string
          supervisor_feedback?: string | null
          updated_at?: string | null
          uploaded_by?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kp_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kp_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kp_guidance_schedule: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          meeting_link: string | null
          requested_date: string
          status: string | null
          student_id: string
          supervisor_id: string
          supervisor_notes: string | null
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          requested_date: string
          status?: string | null
          student_id: string
          supervisor_id: string
          supervisor_notes?: string | null
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          requested_date?: string
          status?: string | null
          student_id?: string
          supervisor_id?: string
          supervisor_notes?: string | null
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kp_guidance_schedule_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kp_guidance_schedule_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kp_journal_entries: {
        Row: {
          created_at: string | null
          entry_date: string
          id: string
          meeting_date: string | null
          progress_percentage: number | null
          status: string | null
          student_id: string
          supervisor_id: string
          supervisor_notes: string | null
          topics_discussed: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entry_date: string
          id?: string
          meeting_date?: string | null
          progress_percentage?: number | null
          status?: string | null
          student_id: string
          supervisor_id: string
          supervisor_notes?: string | null
          topics_discussed: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entry_date?: string
          id?: string
          meeting_date?: string | null
          progress_percentage?: number | null
          status?: string | null
          student_id?: string
          supervisor_id?: string
          supervisor_notes?: string | null
          topics_discussed?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kp_journal_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kp_journal_entries_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kp_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kp_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kp_progress: {
        Row: {
          created_at: string | null
          current_stage: string
          guidance_sessions_completed: number | null
          id: string
          last_activity: string | null
          overall_progress: number | null
          presentation_status: string | null
          proposal_status: string | null
          report_status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_stage?: string
          guidance_sessions_completed?: number | null
          id?: string
          last_activity?: string | null
          overall_progress?: number | null
          presentation_status?: string | null
          proposal_status?: string | null
          report_status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_stage?: string
          guidance_sessions_completed?: number | null
          id?: string
          last_activity?: string | null
          overall_progress?: number | null
          presentation_status?: string | null
          proposal_status?: string | null
          report_status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kp_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kp_timeline: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          period: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          period: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          period?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          faculty: string | null
          full_name: string | null
          id: string
          nid: string | null
          nim: string | null
          nip: string | null
          profile_image: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          faculty?: string | null
          full_name?: string | null
          id: string
          nid?: string | null
          nim?: string | null
          nip?: string | null
          profile_image?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          faculty?: string | null
          full_name?: string | null
          id?: string
          nid?: string | null
          nim?: string | null
          nip?: string | null
          profile_image?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      proposal_documents: {
        Row: {
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          proposal_id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          proposal_id: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          proposal_id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_documents_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_feedback: {
        Row: {
          content: string
          created_at: string | null
          id: string
          proposal_id: string
          supervisor_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          proposal_id: string
          supervisor_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          proposal_id?: string
          supervisor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_feedback_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          company_name: string | null
          created_at: string | null
          description: string | null
          id: string
          rejection_reason: string | null
          status: string | null
          student_id: string
          supervisor_id: string | null
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string | null
          student_id: string
          supervisor_id?: string | null
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string | null
          student_id?: string
          supervisor_id?: string | null
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      student_timesheets: {
        Row: {
          activity_description: string
          approved_by_supervisor: boolean | null
          created_at: string | null
          entry_date: string
          evidence_url: string | null
          hours_worked: number
          id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          activity_description: string
          approved_by_supervisor?: boolean | null
          created_at?: string | null
          entry_date: string
          evidence_url?: string | null
          hours_worked: number
          id?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          activity_description?: string
          approved_by_supervisor?: boolean | null
          created_at?: string | null
          entry_date?: string
          evidence_url?: string | null
          hours_worked?: number
          id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_timesheets_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          team_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_supervisors: {
        Row: {
          created_at: string | null
          id: string
          supervisor_id: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          supervisor_id: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          supervisor_id?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_supervisors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_team_proposals: {
        Args: {
          p_proposal_id: string
          p_new_status?: string
          p_rejection_reason?: string
        }
        Returns: Json
      }
      update_team_proposals: {
        Args: { p_team_id: string; p_status: string; p_reason: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "student" | "coordinator" | "admin" | "supervisor"
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
    Enums: {
      user_role: ["student", "coordinator", "admin", "supervisor"],
    },
  },
} as const
