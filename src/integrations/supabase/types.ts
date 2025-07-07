export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_assistant_conversations: {
        Row: {
          assistant_response: string
          created_at: string
          id: string
          resolved: boolean | null
          sentiment: string | null
          session_id: string
          user_id: string | null
          user_message: string
        }
        Insert: {
          assistant_response: string
          created_at?: string
          id?: string
          resolved?: boolean | null
          sentiment?: string | null
          session_id: string
          user_id?: string | null
          user_message: string
        }
        Update: {
          assistant_response?: string
          created_at?: string
          id?: string
          resolved?: boolean | null
          sentiment?: string | null
          session_id?: string
          user_id?: string | null
          user_message?: string
        }
        Relationships: []
      }
      ai_assistant_knowledge: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          keywords: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_ai_solutions: {
        Row: {
          benefits: string[] | null
          category: string
          complexity_level: string | null
          created_at: string
          description: string
          features: string[] | null
          id: string
          implementation_time: string | null
          is_active: boolean | null
          name: string
          price_max: number | null
          price_min: number | null
          pricing_model: string | null
          roi_estimate: string | null
          subcategory: string | null
          target_company_size: string[] | null
          target_industries: string[] | null
          updated_at: string
        }
        Insert: {
          benefits?: string[] | null
          category: string
          complexity_level?: string | null
          created_at?: string
          description: string
          features?: string[] | null
          id?: string
          implementation_time?: string | null
          is_active?: boolean | null
          name: string
          price_max?: number | null
          price_min?: number | null
          pricing_model?: string | null
          roi_estimate?: string | null
          subcategory?: string | null
          target_company_size?: string[] | null
          target_industries?: string[] | null
          updated_at?: string
        }
        Update: {
          benefits?: string[] | null
          category?: string
          complexity_level?: string | null
          created_at?: string
          description?: string
          features?: string[] | null
          id?: string
          implementation_time?: string | null
          is_active?: boolean | null
          name?: string
          price_max?: number | null
          price_min?: number | null
          pricing_model?: string | null
          roi_estimate?: string | null
          subcategory?: string | null
          target_company_size?: string[] | null
          target_industries?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      coaching_projects_ia: {
        Row: {
          budget: number | null
          created_at: string
          end_date: string | null
          id: string
          milestones: Json | null
          notes: string | null
          opportunity_id: string | null
          progress_percentage: number | null
          project_name: string
          project_type: string | null
          start_date: string | null
          status: string | null
          team_members: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          milestones?: Json | null
          notes?: string | null
          opportunity_id?: string | null
          progress_percentage?: number | null
          project_name: string
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          team_members?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          milestones?: Json | null
          notes?: string | null
          opportunity_id?: string | null
          progress_percentage?: number | null
          project_name?: string
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          team_members?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_projects_ia_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities_ia"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string | null
          name: string
          size_category: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          name: string
          size_category?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          name?: string
          size_category?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      generated_descriptions: {
        Row: {
          bold_words: string[] | null
          created_at: string
          description: string
          id: string
          include_benefits: boolean | null
          language: string
          product_name: string
          project_id: string
          user_id: string
          word_count: number
          writing_style: string
        }
        Insert: {
          bold_words?: string[] | null
          created_at?: string
          description: string
          id?: string
          include_benefits?: boolean | null
          language: string
          product_name: string
          project_id: string
          user_id: string
          word_count: number
          writing_style: string
        }
        Update: {
          bold_words?: string[] | null
          created_at?: string
          description?: string
          id?: string
          include_benefits?: boolean | null
          language?: string
          product_name?: string
          project_id?: string
          user_id?: string
          word_count?: number
          writing_style?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_descriptions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_prospects_ia: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          lead_source: string | null
          notes: string | null
          phone: string | null
          position: string | null
          priority: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          lead_source?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          lead_source?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_prospects_ia_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities_ia: {
        Row: {
          company_id: string | null
          configured_solutions: Json | null
          created_at: string
          description: string | null
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          payment_status: string | null
          probability: number | null
          stage: string | null
          stripe_session_id: string | null
          title: string
          total_estimated_price: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          configured_solutions?: Json | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          payment_status?: string | null
          probability?: number | null
          stage?: string | null
          stripe_session_id?: string | null
          title: string
          total_estimated_price?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          configured_solutions?: Json | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          payment_status?: string | null
          probability?: number | null
          stage?: string | null
          stripe_session_id?: string | null
          title?: string
          total_estimated_price?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_ia_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_ia_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_prospects_ia"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          categorie: string | null
          created_at: string
          email_from: string
          gmail_message_id: string | null
          id: string
          message: string
          priorite: string | null
          statut: string | null
          sujet: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          categorie?: string | null
          created_at?: string
          email_from: string
          gmail_message_id?: string | null
          id?: string
          message: string
          priorite?: string | null
          statut?: string | null
          sujet: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          categorie?: string | null
          created_at?: string
          email_from?: string
          gmail_message_id?: string | null
          id?: string
          message?: string
          priorite?: string | null
          statut?: string | null
          sujet?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
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
      app_role: ["admin", "client"],
    },
  },
} as const
