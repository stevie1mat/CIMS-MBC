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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_types: {
        Row: {
          created_at: string
          id: number
          legacy_account_id: number | null
          name: string
          permissions: Json
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          legacy_account_id?: number | null
          name: string
          permissions?: Json
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          legacy_account_id?: number | null
          name?: string
          permissions?: Json
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          advertisement_code: string | null
          banner_bucket: string | null
          banner_link: string | null
          banner_path: string | null
          created_at: string
          id: number
          legacy_add_id: number | null
          position: string
          status: string
          updated_at: string
        }
        Insert: {
          advertisement_code?: string | null
          banner_bucket?: string | null
          banner_link?: string | null
          banner_path?: string | null
          created_at?: string
          id?: number
          legacy_add_id?: number | null
          position: string
          status?: string
          updated_at?: string
        }
        Update: {
          advertisement_code?: string | null
          banner_bucket?: string | null
          banner_link?: string | null
          banner_path?: string | null
          created_at?: string
          id?: number
          legacy_add_id?: number | null
          position?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointment_requests: {
        Row: {
          appointment_at: string
          created_at: string
          id: number
          requested_by: string
          requested_to: string
          status: string
          time_zone: string
          updated_at: string
        }
        Insert: {
          appointment_at?: string
          created_at?: string
          id?: number
          requested_by: string
          requested_to: string
          status?: string
          time_zone?: string
          updated_at?: string
        }
        Update: {
          appointment_at?: string
          created_at?: string
          id?: number
          requested_by?: string
          requested_to?: string
          status?: string
          time_zone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_requested_to_fkey"
            columns: ["requested_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_groups: {
        Row: {
          assignment_id: number
          group_id: number
        }
        Insert: {
          assignment_id: number
          group_id: number
        }
        Update: {
          assignment_id?: number
          group_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "assignment_groups_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: number
          attachment_bucket: string | null
          attachment_path: string | null
          created_at: string
          evaluated_at: string | null
          evaluated_by: string | null
          id: number
          profile_id: string
          score: number | null
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          assignment_id: number
          attachment_bucket?: string | null
          attachment_path?: string | null
          created_at?: string
          evaluated_at?: string | null
          evaluated_by?: string | null
          id?: number
          profile_id: string
          score?: number | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: number
          attachment_bucket?: string | null
          attachment_path?: string | null
          created_at?: string
          evaluated_at?: string | null
          evaluated_by?: string | null
          id?: number
          profile_id?: string
          score?: number | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          attachment_bucket: string | null
          attachment_path: string | null
          category_id: number | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: number
          title: string
          updated_at: string
        }
        Insert: {
          attachment_bucket?: string | null
          attachment_path?: string | null
          category_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: number
          title: string
          updated_at?: string
        }
        Update: {
          attachment_bucket?: string | null
          attachment_path?: string | null
          category_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attempt_answers: {
        Row: {
          answer_text: string | null
          attempt_id: number
          created_at: string
          id: number
          option_id: number | null
          question_id: number
          question_number: number
          score: number
          time_seconds: number
        }
        Insert: {
          answer_text?: string | null
          attempt_id: number
          created_at?: string
          id?: number
          option_id?: number | null
          question_id: number
          question_number?: number
          score?: number
          time_seconds?: number
        }
        Update: {
          answer_text?: string | null
          attempt_id?: number
          created_at?: string
          id?: number
          option_id?: number | null
          question_id?: number
          question_number?: number
          score?: number
          time_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          id: number
          profile_id: string
          recorded_at: string
          session_date: string
        }
        Insert: {
          id?: number
          profile_id: string
          recorded_at?: string
          session_date?: string
        }
        Update: {
          id?: number
          profile_id?: string
          recorded_at?: string
          session_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: number
          legacy_cid: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          legacy_cid?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          legacy_cid?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_form_fields: {
        Row: {
          created_at: string
          default_value: string | null
          display_at: string
          field_type: string
          id: number
          legacy_field_id: number | null
          sort_order: number
          title: string
          updated_at: string
          validation_rule: string | null
        }
        Insert: {
          created_at?: string
          default_value?: string | null
          display_at?: string
          field_type?: string
          id?: number
          legacy_field_id?: number | null
          sort_order?: number
          title: string
          updated_at?: string
          validation_rule?: string | null
        }
        Update: {
          created_at?: string
          default_value?: string | null
          display_at?: string
          field_type?: string
          id?: number
          legacy_field_id?: number | null
          sort_order?: number
          title?: string
          updated_at?: string
          validation_rule?: string | null
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          description: string | null
          id: number
          legacy_gid: number | null
          name: string
          price: number
          updated_at: string
          valid_for_days: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          legacy_gid?: number | null
          name: string
          price?: number
          updated_at?: string
          valid_for_days?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          legacy_gid?: number | null
          name?: string
          price?: number
          updated_at?: string
          valid_for_days?: number
        }
        Relationships: []
      }
      levels: {
        Row: {
          created_at: string
          id: number
          legacy_lid: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          legacy_lid?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          legacy_lid?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          created_at: string
          description: string | null
          group_id: number | null
          id: number
          media_asset_id: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id?: number | null
          id?: number
          media_asset_id?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: number | null
          id?: number
          media_asset_id?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_comments: {
        Row: {
          content: string
          created_at: string
          id: number
          live_class_id: number
          profile_id: string
          published: boolean
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          live_class_id: number
          profile_id: string
          published?: boolean
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          live_class_id?: number
          profile_id?: string
          published?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_comments_live_class_id_fkey"
            columns: ["live_class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_class_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_groups: {
        Row: {
          group_id: number
          live_class_id: number
        }
        Insert: {
          group_id: number
          live_class_id: number
        }
        Update: {
          group_id?: number
          live_class_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "live_class_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_class_groups_live_class_id_fkey"
            columns: ["live_class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_classes: {
        Row: {
          closed_at: string | null
          content: string | null
          created_at: string
          id: number
          initiated_by: string | null
          name: string
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          content?: string | null
          created_at?: string
          id?: number
          initiated_by?: string | null
          name: string
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          content?: string | null
          created_at?: string
          id?: number
          initiated_by?: string | null
          name?: string
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_classes_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          asset_type: string
          created_at: string
          created_by: string | null
          description: string | null
          external_url: string | null
          file_bucket: string | null
          file_path: string | null
          id: number
          title: string
          updated_at: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_url?: string | null
          file_bucket?: string | null
          file_path?: string | null
          id?: number
          title: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_url?: string | null
          file_bucket?: string | null
          file_path?: string | null
          id?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_feed: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: number
          published_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: number
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: number
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_feed_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_recipients: {
        Row: {
          notification_id: number
          profile_id: string
          viewed_at: string | null
        }
        Insert: {
          notification_id: number
          profile_id: string
          viewed_at?: string | null
        }
        Update: {
          notification_id?: number
          profile_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_recipients_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_recipients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          click_action: string | null
          created_at: string
          created_by: string | null
          id: number
          message: string | null
          response: string | null
          target: string | null
          title: string | null
        }
        Insert: {
          click_action?: string | null
          created_at?: string
          created_by?: string | null
          id?: number
          message?: string | null
          response?: string | null
          target?: string | null
          title?: string | null
        }
        Update: {
          click_action?: string | null
          created_at?: string
          created_by?: string | null
          id?: number
          message?: string | null
          response?: string | null
          target?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_submissions: {
        Row: {
          created_at: string
          full_name: string | null
          id: number
          installment_label: string | null
          payload: Json
          profile_id: string | null
          student_id: string | null
          student_name: string | null
          teacher_name: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: number
          installment_label?: string | null
          payload?: Json
          profile_id?: string | null
          student_id?: string | null
          student_name?: string | null
          teacher_name?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: number
          installment_label?: string | null
          payload?: Json
          profile_id?: string | null
          student_id?: string | null
          student_name?: string | null
          teacher_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          gateway: string
          group_id: number | null
          id: number
          legacy_pid: number | null
          other_data: Json
          paid_at: string | null
          profile_id: string | null
          quiz_id: number | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          gateway?: string
          group_id?: number | null
          id?: number
          legacy_pid?: number | null
          other_data?: Json
          paid_at?: string | null
          profile_id?: string | null
          quiz_id?: number | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          gateway?: string
          group_id?: number | null
          id?: number
          legacy_pid?: number | null
          other_data?: Json
          paid_at?: string | null
          profile_id?: string | null
          quiz_id?: number | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_custom_fields: {
        Row: {
          created_at: string
          field_id: number
          id: number
          profile_id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          field_id: number
          id?: number
          profile_id: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          field_id?: number
          id?: number
          profile_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_custom_fields_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_custom_fields_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_groups: {
        Row: {
          assigned_by: string | null
          created_at: string
          expires_at: string | null
          group_id: number
          profile_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          group_id: number
          profile_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          group_id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_groups_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_groups_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type_id: number | null
          android_token: string | null
          avatar_bucket: string | null
          avatar_path: string | null
          connection_key: string | null
          contact_no: string | null
          created_at: string
          email: string | null
          real_email: string | null
          fees_paid: boolean
          first_name: string | null
          id: string
          inserted_by: string | null
          last_name: string | null
          legacy_uid: number | null
          legacy_wp_user: string | null
          registered_at: string
          skype_id: string | null
          status: string
          subscription_expires_at: string | null
          time_zone: string
          updated_at: string
          web_token: string | null
        }
        Insert: {
          account_type_id?: number | null
          android_token?: string | null
          avatar_bucket?: string | null
          avatar_path?: string | null
          connection_key?: string | null
          contact_no?: string | null
          created_at?: string
          email?: string | null
          real_email?: string | null
          fees_paid?: boolean
          first_name?: string | null
          id: string
          inserted_by?: string | null
          last_name?: string | null
          legacy_uid?: number | null
          legacy_wp_user?: string | null
          registered_at?: string
          skype_id?: string | null
          status?: string
          subscription_expires_at?: string | null
          time_zone?: string
          updated_at?: string
          web_token?: string | null
        }
        Update: {
          account_type_id?: number | null
          android_token?: string | null
          avatar_bucket?: string | null
          avatar_path?: string | null
          connection_key?: string | null
          contact_no?: string | null
          real_email?: string | null
          created_at?: string
          email?: string | null
          fees_paid?: boolean
          first_name?: string | null
          id?: string
          inserted_by?: string | null
          last_name?: string | null
          legacy_uid?: number | null
          legacy_wp_user?: string | null
          registered_at?: string
          skype_id?: string | null
          status?: string
          subscription_expires_at?: string | null
          time_zone?: string
          updated_at?: string
          web_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_account_type_id_fkey"
            columns: ["account_type_id"]
            isOneToOne: false
            referencedRelation: "account_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_inserted_by_fkey"
            columns: ["inserted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          created_at: string
          id: number
          is_correct: boolean
          legacy_oid: number | null
          match_text: string | null
          match_text_alt: string | null
          option_text: string
          option_text_alt: string | null
          question_id: number
          score: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_correct?: boolean
          legacy_oid?: number | null
          match_text?: string | null
          match_text_alt?: string | null
          option_text: string
          option_text_alt?: string | null
          question_id: number
          score?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_correct?: boolean
          legacy_oid?: number | null
          match_text?: string | null
          match_text_alt?: string | null
          option_text?: string
          option_text_alt?: string | null
          question_id?: number
          score?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          body_alt: string | null
          created_at: string
          description: string | null
          explanation: string | null
          explanation_alt: string | null
          id: number
          inserted_by: string | null
          legacy_qid: number | null
          paragraph: string | null
          paragraph_alt: string | null
          parent_question_id: number | null
          question_text: string
          question_type: string
          quiz_id: number | null
          stats_correct: number
          stats_incorrect: number
          stats_served: number
          stats_unattempted: number
          updated_at: string
        }
        Insert: {
          body_alt?: string | null
          created_at?: string
          description?: string | null
          explanation?: string | null
          explanation_alt?: string | null
          id?: number
          inserted_by?: string | null
          legacy_qid?: number | null
          paragraph?: string | null
          paragraph_alt?: string | null
          parent_question_id?: number | null
          question_text?: string
          question_type?: string
          quiz_id?: number | null
          stats_correct?: number
          stats_incorrect?: number
          stats_served?: number
          stats_unattempted?: number
          updated_at?: string
        }
        Update: {
          body_alt?: string | null
          created_at?: string
          description?: string | null
          explanation?: string | null
          explanation_alt?: string | null
          id?: number
          inserted_by?: string | null
          legacy_qid?: number | null
          paragraph?: string | null
          paragraph_alt?: string | null
          parent_question_id?: number | null
          question_text?: string
          question_type?: string
          quiz_id?: number | null
          stats_correct?: number
          stats_incorrect?: number
          stats_served?: number
          stats_unattempted?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_inserted_by_fkey"
            columns: ["inserted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_parent_question_id_fkey"
            columns: ["parent_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          attempted_ip: unknown
          created_at: string
          ended_at: string | null
          id: number
          legacy_rid: number | null
          manual_valuation: boolean
          percentage_obtained: number
          photo_bucket: string | null
          photo_path: string | null
          profile_id: string
          quiz_id: number
          score_obtained: number
          snapshot: Json
          started_at: string
          status: string
          total_time_seconds: number
          updated_at: string
        }
        Insert: {
          attempted_ip?: unknown
          created_at?: string
          ended_at?: string | null
          id?: number
          legacy_rid?: number | null
          manual_valuation?: boolean
          percentage_obtained?: number
          photo_bucket?: string | null
          photo_path?: string | null
          profile_id: string
          quiz_id: number
          score_obtained?: number
          snapshot?: Json
          started_at?: string
          status?: string
          total_time_seconds?: number
          updated_at?: string
        }
        Update: {
          attempted_ip?: unknown
          created_at?: string
          ended_at?: string | null
          id?: number
          legacy_rid?: number | null
          manual_valuation?: boolean
          percentage_obtained?: number
          photo_bucket?: string | null
          photo_path?: string | null
          profile_id?: string
          quiz_id?: number
          score_obtained?: number
          snapshot?: Json
          started_at?: string
          status?: string
          total_time_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_groups: {
        Row: {
          group_id: number
          quiz_id: number
        }
        Insert: {
          group_id: number
          quiz_id: number
        }
        Update: {
          group_id?: number
          quiz_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_groups_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_selection_rules: {
        Row: {
          category_id: number | null
          correct_score: number
          created_at: string
          id: number
          incorrect_score: number
          level_id: number | null
          number_of_questions: number
          quiz_id: number
        }
        Insert: {
          category_id?: number | null
          correct_score?: number
          created_at?: string
          id?: number
          incorrect_score?: number
          level_id?: number | null
          number_of_questions: number
          quiz_id: number
        }
        Update: {
          category_id?: number | null
          correct_score?: number
          created_at?: string
          id?: number
          incorrect_score?: number
          level_id?: number | null
          number_of_questions?: number
          quiz_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_selection_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_selection_rules_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_selection_rules_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_users: {
        Row: {
          profile_id: string
          quiz_id: number
        }
        Insert: {
          profile_id: string
          quiz_id: number
        }
        Update: {
          profile_id?: string
          quiz_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_users_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_users_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          camera_required: boolean
          certificate_text: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          ends_at: string | null
          exam_instructions_title: string | null
          exam_questions_text: string | null
          exam_result_text: string | null
          exam_time_text: string | null
          generate_certificate: boolean
          id: number
          inserted_by: string | null
          ip_address_rule: string | null
          legacy_quid: number | null
          maximum_attempts: number
          name: string
          pass_percentage: number
          question_selection_mode: string
          quiz_price: number
          quiz_template: string
          requires_login: boolean
          show_chart_rank: boolean
          starts_at: string | null
          student_details: string | null
          student_subject: string | null
          student_teacher: string | null
          updated_at: string
          view_answer: boolean
        }
        Insert: {
          camera_required?: boolean
          certificate_text?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          ends_at?: string | null
          exam_instructions_title?: string | null
          exam_questions_text?: string | null
          exam_result_text?: string | null
          exam_time_text?: string | null
          generate_certificate?: boolean
          id?: number
          inserted_by?: string | null
          ip_address_rule?: string | null
          legacy_quid?: number | null
          maximum_attempts?: number
          name: string
          pass_percentage?: number
          question_selection_mode?: string
          quiz_price?: number
          quiz_template?: string
          requires_login?: boolean
          show_chart_rank?: boolean
          starts_at?: string | null
          student_details?: string | null
          student_subject?: string | null
          student_teacher?: string | null
          updated_at?: string
          view_answer?: boolean
        }
        Update: {
          camera_required?: boolean
          certificate_text?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          ends_at?: string | null
          exam_instructions_title?: string | null
          exam_questions_text?: string | null
          exam_result_text?: string | null
          exam_time_text?: string | null
          generate_certificate?: boolean
          id?: number
          inserted_by?: string | null
          ip_address_rule?: string | null
          legacy_quid?: number | null
          maximum_attempts?: number
          name?: string
          pass_percentage?: number
          question_selection_mode?: string
          quiz_price?: number
          quiz_template?: string
          requires_login?: boolean
          show_chart_rank?: boolean
          starts_at?: string | null
          student_details?: string | null
          student_subject?: string | null
          student_teacher?: string | null
          updated_at?: string
          view_answer?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_inserted_by_fkey"
            columns: ["inserted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          description: string | null
          group_name: string
          id: number
          key: string
          sort_order: number
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_name?: string
          id?: number
          key: string
          sort_order?: number
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          group_name?: string
          id?: number
          key?: string
          sort_order?: number
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      social_group_members: {
        Row: {
          joined_at: string
          profile_id: string
          social_group_id: number
        }
        Insert: {
          joined_at?: string
          profile_id: string
          social_group_id: number
        }
        Update: {
          joined_at?: string
          profile_id?: string
          social_group_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "social_group_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_group_members_social_group_id_fkey"
            columns: ["social_group_id"]
            isOneToOne: false
            referencedRelation: "social_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      social_groups: {
        Row: {
          about: string | null
          created_at: string
          created_by: string | null
          id: number
          legacy_sg_id: number | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          about?: string | null
          created_at?: string
          created_by?: string | null
          id?: number
          legacy_sg_id?: number | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          about?: string | null
          created_at?: string
          created_by?: string | null
          id?: number
          legacy_sg_id?: number | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_pictures: {
        Row: {
          created_at: string
          file_bucket: string | null
          file_path: string
          id: number
          profile_id: string | null
          title: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_bucket?: string | null
          file_path: string
          id?: number
          profile_id?: string | null
          title?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_bucket?: string | null
          file_path?: string
          id?: number
          profile_id?: string | null
          title?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_pictures_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_pictures_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_material_groups: {
        Row: {
          group_id: number
          study_material_id: number
        }
        Insert: {
          group_id: number
          study_material_id: number
        }
        Update: {
          group_id?: number
          study_material_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_material_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_material_groups_study_material_id_fkey"
            columns: ["study_material_id"]
            isOneToOne: false
            referencedRelation: "study_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      study_materials: {
        Row: {
          category_id: number | null
          created_at: string
          created_by: string | null
          description: string | null
          file_bucket: string | null
          file_path: string | null
          id: number
          legacy_stid: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_bucket?: string | null
          file_path?: string | null
          id?: number
          legacy_stid?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_bucket?: string | null
          file_path?: string | null
          id?: number
          legacy_stid?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_materials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_materials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      warning_messages: {
        Row: {
          attempt_id: number | null
          id: number
          message: string
          profile_id: string | null
          warning_at: string
        }
        Insert: {
          attempt_id?: number | null
          id?: number
          message: string
          profile_id?: string | null
          warning_at?: string
        }
        Update: {
          attempt_id?: number | null
          id?: number
          message?: string
          profile_id?: string | null
          warning_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warning_messages_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warning_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_account_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
