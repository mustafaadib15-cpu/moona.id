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
      client_accounts: {
        Row: {
          company: string | null
          created_at: string
          id: string
          name: string
          next_label: string | null
          phase_label: string | null
          plan_label: string | null
          plan_stage: string
          role_title: string | null
          status: Database["public"]["Enums"]["engagement_status"]
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          name: string
          next_label?: string | null
          phase_label?: string | null
          plan_label?: string | null
          plan_stage?: string
          role_title?: string | null
          status?: Database["public"]["Enums"]["engagement_status"]
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          name?: string
          next_label?: string | null
          phase_label?: string | null
          plan_label?: string | null
          plan_stage?: string
          role_title?: string | null
          status?: Database["public"]["Enums"]["engagement_status"]
          updated_at?: string
        }
        Relationships: []
      }
      content_groups: {
        Row: {
          created_at: string
          id: number
          kind: Database["public"]["Enums"]["group_kind"]
          name: string
          plan_id: number
          range_label: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          kind?: Database["public"]["Enums"]["group_kind"]
          name: string
          plan_id: number
          range_label?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          kind?: Database["public"]["Enums"]["group_kind"]
          name?: string
          plan_id?: number
          range_label?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_groups_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "content_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      content_plans: {
        Row: {
          client_id: string
          created_at: string
          id: number
          period_label: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: never
          period_label?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: never
          period_label?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          client_id: string
          created_at: string
          date_label: string | null
          description: string | null
          file_url: string | null
          id: number
          sort_order: number
          status: Database["public"]["Enums"]["deliverable_status"]
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date_label?: string | null
          description?: string | null
          file_url?: string | null
          id?: never
          sort_order?: number
          status?: Database["public"]["Enums"]["deliverable_status"]
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date_label?: string | null
          description?: string | null
          file_url?: string | null
          id?: never
          sort_order?: number
          status?: Database["public"]["Enums"]["deliverable_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string | null
          author_role: Database["public"]["Enums"]["user_role"]
          body: string
          created_at: string
          id: number
          post_id: number
        }
        Insert: {
          author_id?: string | null
          author_role: Database["public"]["Enums"]["user_role"]
          body: string
          created_at?: string
          id?: never
          post_id: number
        }
        Update: {
          author_id?: string | null
          author_role?: Database["public"]["Enums"]["user_role"]
          body?: string
          created_at?: string
          id?: never
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: Json
          content_form: string | null
          created_at: string
          day_label: string | null
          decided_at: string | null
          decided_by: string | null
          decision: Database["public"]["Enums"]["post_decision"]
          group_id: number
          hook: string
          id: number
          part_label: string | null
          plan_id: number
          post_date: string | null
          seq: number
          subject: string
          tags: string | null
          updated_at: string
          why_now: string | null
        }
        Insert: {
          body?: Json
          content_form?: string | null
          created_at?: string
          day_label?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision?: Database["public"]["Enums"]["post_decision"]
          group_id: number
          hook: string
          id?: never
          part_label?: string | null
          plan_id: number
          post_date?: string | null
          seq: number
          subject: string
          tags?: string | null
          updated_at?: string
          why_now?: string | null
        }
        Update: {
          body?: Json
          content_form?: string | null
          created_at?: string
          day_label?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision?: Database["public"]["Enums"]["post_decision"]
          group_id?: number
          hook?: string
          id?: never
          part_label?: string | null
          plan_id?: number
          post_date?: string | null
          seq?: number
          subject?: string
          tags?: string | null
          updated_at?: string
          why_now?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "content_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "content_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          client_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_client_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      deliverable_status: "delivered" | "in_review" | "upcoming"
      engagement_status: "active" | "paused" | "completed"
      group_kind: "week" | "series"
      post_decision: "pending" | "approved" | "revision"
      user_role: "client" | "admin"
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
      deliverable_status: ["delivered", "in_review", "upcoming"],
      engagement_status: ["active", "paused", "completed"],
      group_kind: ["week", "series"],
      post_decision: ["pending", "approved", "revision"],
      user_role: ["client", "admin"],
    },
  },
} as const
