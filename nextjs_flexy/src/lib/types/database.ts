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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_translation_cache: {
        Row: {
          confidence_score: number | null
          context_type: string | null
          cost_usd: number | null
          created_at: string | null
          domain: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          model_name: string
          model_version: string | null
          original_language: string
          original_text: string
          prompt_template: string | null
          target_language: string
          text_hash: string
          tokens_used: number | null
          translated_text: string
          usage_count: number | null
        }
        Insert: {
          confidence_score?: number | null
          context_type?: string | null
          cost_usd?: number | null
          created_at?: string | null
          domain?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          model_name: string
          model_version?: string | null
          original_language: string
          original_text: string
          prompt_template?: string | null
          target_language: string
          text_hash: string
          tokens_used?: number | null
          translated_text: string
          usage_count?: number | null
        }
        Update: {
          confidence_score?: number | null
          context_type?: string | null
          cost_usd?: number | null
          created_at?: string | null
          domain?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          model_name?: string
          model_version?: string | null
          original_language?: string
          original_text?: string
          prompt_template?: string | null
          target_language?: string
          text_hash?: string
          tokens_used?: number | null
          translated_text?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      bulk_orders: {
        Row: {
          additional_requests: string | null
          adjustment_reason: string | null
          assigned_staff_id: string | null
          bl_document: string | null
          company_name: string
          contact_email: string | null
          contact_person: string
          contact_phone: string
          created_at: string | null
          customs_status: string | null
          delivery_address: string | null
          delivery_date: string | null
          delivery_method: string | null
          delivery_period: string | null
          delivery_receipt: string | null
          down_payment: Json | null
          estimated_arrival_date: string | null
          expected_completion_date: string | null
          factory_confirmation: string | null
          final_payment: Json | null
          id: string
          invoice_document: string | null
          market_research_id: string | null
          middle_payment: Json | null
          order_items: Json
          packing_list_document: string | null
          packing_requirements: string | null
          packing_status: string | null
          payment_status: string | null
          price_adjustment: number | null
          production_photos: Json | null
          production_progress: number | null
          production_schedule: string | null
          purchase_order_file: string | null
          quality_inspection_report: string | null
          quality_standards: string | null
          quantity_change_confirm: boolean | null
          quotation_file: string | null
          reference_files: Json | null
          reservation_number: string
          revised_unit_price: number | null
          status: string | null
          tax_invoices: Json | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_requests?: string | null
          adjustment_reason?: string | null
          assigned_staff_id?: string | null
          bl_document?: string | null
          company_name: string
          contact_email?: string | null
          contact_person: string
          contact_phone: string
          created_at?: string | null
          customs_status?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_method?: string | null
          delivery_period?: string | null
          delivery_receipt?: string | null
          down_payment?: Json | null
          estimated_arrival_date?: string | null
          expected_completion_date?: string | null
          factory_confirmation?: string | null
          final_payment?: Json | null
          id?: string
          invoice_document?: string | null
          market_research_id?: string | null
          middle_payment?: Json | null
          order_items: Json
          packing_list_document?: string | null
          packing_requirements?: string | null
          packing_status?: string | null
          payment_status?: string | null
          price_adjustment?: number | null
          production_photos?: Json | null
          production_progress?: number | null
          production_schedule?: string | null
          purchase_order_file?: string | null
          quality_inspection_report?: string | null
          quality_standards?: string | null
          quantity_change_confirm?: boolean | null
          quotation_file?: string | null
          reference_files?: Json | null
          reservation_number: string
          revised_unit_price?: number | null
          status?: string | null
          tax_invoices?: Json | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_requests?: string | null
          adjustment_reason?: string | null
          assigned_staff_id?: string | null
          bl_document?: string | null
          company_name?: string
          contact_email?: string | null
          contact_person?: string
          contact_phone?: string
          created_at?: string | null
          customs_status?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_method?: string | null
          delivery_period?: string | null
          delivery_receipt?: string | null
          down_payment?: Json | null
          estimated_arrival_date?: string | null
          expected_completion_date?: string | null
          factory_confirmation?: string | null
          final_payment?: Json | null
          id?: string
          invoice_document?: string | null
          market_research_id?: string | null
          middle_payment?: Json | null
          order_items?: Json
          packing_list_document?: string | null
          packing_requirements?: string | null
          packing_status?: string | null
          payment_status?: string | null
          price_adjustment?: number | null
          production_photos?: Json | null
          production_progress?: number | null
          production_schedule?: string | null
          purchase_order_file?: string | null
          quality_inspection_report?: string | null
          quality_standards?: string | null
          quantity_change_confirm?: boolean | null
          quotation_file?: string | null
          reference_files?: Json | null
          reservation_number?: string
          revised_unit_price?: number | null
          status?: string | null
          tax_invoices?: Json | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_orders_market_research_id_fkey"
            columns: ["market_research_id"]
            isOneToOne: false
            referencedRelation: "market_research_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_deleted: boolean | null
          message_type: string | null
          order_id: string
          original_language: string
          original_message: string
          sender_id: string
          sender_name: string
          sender_role: string
          translated_language: string | null
          translated_message: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          order_id: string
          original_language: string
          original_message: string
          sender_id: string
          sender_name: string
          sender_role: string
          translated_language?: string | null
          translated_message?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          order_id?: string
          original_language?: string
          original_message?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
          translated_language?: string | null
          translated_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          display_name: string | null
          id: string
          is_online: boolean | null
          joined_at: string | null
          last_seen: string | null
          left_at: string | null
          order_id: string
          role: string
          typing: boolean | null
          user_id: string
        }
        Insert: {
          display_name?: string | null
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          last_seen?: string | null
          left_at?: string | null
          order_id: string
          role: string
          typing?: boolean | null
          user_id: string
        }
        Update: {
          display_name?: string | null
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          last_seen?: string | null
          left_at?: string | null
          order_id?: string
          role?: string
          typing?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      china_business_trips: {
        Row: {
          actual_end_date: string | null
          actual_start_date: string | null
          china_expenses_request: number | null
          china_expenses_rmb: number | null
          confirmed_date: string | null
          created_at: string | null
          daily_rate: number | null
          desired_date: string | null
          factory_address: string
          factory_contact: string | null
          factory_name: string
          factory_phone: string | null
          id: string
          inspection_days: number | null
          inspection_files: Json | null
          inspection_report: string | null
          inspection_request: string
          inspection_request_cn: string | null
          order_id: string
          product_name: string
          product_name_chinese: string | null
          qc_standard: string | null
          quantity: number | null
          quotation_number: string | null
          request_files: Json | null
          service_sub_type: string
          specification: string | null
          supply_amount: number | null
          tax_amount: number | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          china_expenses_request?: number | null
          china_expenses_rmb?: number | null
          confirmed_date?: string | null
          created_at?: string | null
          daily_rate?: number | null
          desired_date?: string | null
          factory_address: string
          factory_contact?: string | null
          factory_name: string
          factory_phone?: string | null
          id?: string
          inspection_days?: number | null
          inspection_files?: Json | null
          inspection_report?: string | null
          inspection_request: string
          inspection_request_cn?: string | null
          order_id: string
          product_name: string
          product_name_chinese?: string | null
          qc_standard?: string | null
          quantity?: number | null
          quotation_number?: string | null
          request_files?: Json | null
          service_sub_type: string
          specification?: string | null
          supply_amount?: number | null
          tax_amount?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          china_expenses_request?: number | null
          china_expenses_rmb?: number | null
          confirmed_date?: string | null
          created_at?: string | null
          daily_rate?: number | null
          desired_date?: string | null
          factory_address?: string
          factory_contact?: string | null
          factory_name?: string
          factory_phone?: string | null
          id?: string
          inspection_days?: number | null
          inspection_files?: Json | null
          inspection_report?: string | null
          inspection_request?: string
          inspection_request_cn?: string | null
          order_id?: string
          product_name?: string
          product_name_chinese?: string | null
          qc_standard?: string | null
          quantity?: number | null
          quotation_number?: string | null
          request_files?: Json | null
          service_sub_type?: string
          specification?: string | null
          supply_amount?: number | null
          tax_amount?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "china_business_trips_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      company_addresses: {
        Row: {
          address: string | null
          address_detail: string | null
          company_name: string
          company_name_chinese: string | null
          contact_person: string
          created_at: string | null
          email: string | null
          id: string
          is_default: boolean | null
          phone: string
          postal_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          address_detail?: string | null
          company_name: string
          company_name_chinese?: string | null
          contact_person: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_default?: boolean | null
          phone: string
          postal_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          address_detail?: string | null
          company_name?: string
          company_name_chinese?: string | null
          contact_person?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_default?: boolean | null
          phone?: string
          postal_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_inquiries: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          inquiry_channel: string | null
          inquiry_content: string
          inquiry_date: string | null
          inquiry_files: Json | null
          inquiry_number: number
          response_content: string | null
          response_date: string | null
          response_files: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          inquiry_channel?: string | null
          inquiry_content: string
          inquiry_date?: string | null
          inquiry_files?: Json | null
          inquiry_number?: number
          response_content?: string | null
          response_date?: string | null
          response_files?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          inquiry_channel?: string | null
          inquiry_content?: string
          inquiry_date?: string | null
          inquiry_files?: Json | null
          inquiry_number?: number
          response_content?: string | null
          response_date?: string | null
          response_files?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      guest_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          guest_email: string | null
          guest_name: string | null
          id: string
          order_id: string
          role: string
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          order_id: string
          role: string
          token: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          order_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_tokens_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_applications: {
        Row: {
          assigned_chinese_staff: string | null
          available_dates: Json | null
          box_details: string | null
          company_name: string
          confirm_reservation: boolean | null
          confirmed_date: string | null
          contact_email: string | null
          contact_person: string
          contact_phone: string
          created_at: string | null
          custom_box_required: boolean | null
          detail_page: string | null
          detail_page_cn: string | null
          factory_address: string | null
          factory_contact: string | null
          factory_name: string | null
          factory_phone: string | null
          id: string
          improvement_items: Json | null
          inspection_days: number | null
          inspection_method: string | null
          inspection_photos: Json | null
          inspection_report: string | null
          inspection_summary: string | null
          logo_details: string | null
          logo_required: boolean | null
          moq_check: boolean | null
          pass_fail_status: string | null
          payment_status: string | null
          product_name: string
          product_name_translated: string | null
          production_quantity: number | null
          quotation_pdf: string | null
          research_type: string | null
          reservation_number: string
          schedule_availability: string | null
          schedule_type: string | null
          service_subtype: string | null
          service_subtype_chinese: string | null
          service_type: string
          special_requirements: string | null
          special_requirements_translated: string | null
          status: string | null
          status_chinese: string | null
          tax_invoice_pdf: string | null
          total_cost: number | null
          updated_at: string | null
          user_id: string
          vat_amount: number | null
        }
        Insert: {
          assigned_chinese_staff?: string | null
          available_dates?: Json | null
          box_details?: string | null
          company_name: string
          confirm_reservation?: boolean | null
          confirmed_date?: string | null
          contact_email?: string | null
          contact_person: string
          contact_phone: string
          created_at?: string | null
          custom_box_required?: boolean | null
          detail_page?: string | null
          detail_page_cn?: string | null
          factory_address?: string | null
          factory_contact?: string | null
          factory_name?: string | null
          factory_phone?: string | null
          id?: string
          improvement_items?: Json | null
          inspection_days?: number | null
          inspection_method?: string | null
          inspection_photos?: Json | null
          inspection_report?: string | null
          inspection_summary?: string | null
          logo_details?: string | null
          logo_required?: boolean | null
          moq_check?: boolean | null
          pass_fail_status?: string | null
          payment_status?: string | null
          product_name: string
          product_name_translated?: string | null
          production_quantity?: number | null
          quotation_pdf?: string | null
          research_type?: string | null
          reservation_number: string
          schedule_availability?: string | null
          schedule_type?: string | null
          service_subtype?: string | null
          service_subtype_chinese?: string | null
          service_type: string
          special_requirements?: string | null
          special_requirements_translated?: string | null
          status?: string | null
          status_chinese?: string | null
          tax_invoice_pdf?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id: string
          vat_amount?: number | null
        }
        Update: {
          assigned_chinese_staff?: string | null
          available_dates?: Json | null
          box_details?: string | null
          company_name?: string
          confirm_reservation?: boolean | null
          confirmed_date?: string | null
          contact_email?: string | null
          contact_person?: string
          contact_phone?: string
          created_at?: string | null
          custom_box_required?: boolean | null
          detail_page?: string | null
          detail_page_cn?: string | null
          factory_address?: string | null
          factory_contact?: string | null
          factory_name?: string | null
          factory_phone?: string | null
          id?: string
          improvement_items?: Json | null
          inspection_days?: number | null
          inspection_method?: string | null
          inspection_photos?: Json | null
          inspection_report?: string | null
          inspection_summary?: string | null
          logo_details?: string | null
          logo_required?: boolean | null
          moq_check?: boolean | null
          pass_fail_status?: string | null
          payment_status?: string | null
          product_name?: string
          product_name_translated?: string | null
          production_quantity?: number | null
          quotation_pdf?: string | null
          research_type?: string | null
          reservation_number?: string
          schedule_availability?: string | null
          schedule_type?: string | null
          service_subtype?: string | null
          service_subtype_chinese?: string | null
          service_type?: string
          special_requirements?: string | null
          special_requirements_translated?: string | null
          status?: string | null
          status_chinese?: string | null
          tax_invoice_pdf?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string
          vat_amount?: number | null
        }
        Relationships: []
      }
      inspection_reports: {
        Row: {
          ai_analysis: Json | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          file_path: string
          file_size: number | null
          id: string
          order_id: string
          original_filename: string
          report_type: string | null
          report_url: string | null
          status: string | null
          translated_content: Json | null
          translation_completed_at: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          ai_analysis?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          order_id: string
          original_filename: string
          report_type?: string | null
          report_url?: string | null
          status?: string | null
          translated_content?: Json | null
          translation_completed_at?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          ai_analysis?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          order_id?: string
          original_filename?: string
          report_type?: string | null
          report_url?: string | null
          status?: string | null
          translated_content?: Json | null
          translation_completed_at?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_reports_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      market_research_costs: {
        Row: {
          china_shipping_cost: number | null
          china_unit_price: number | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          exchange_rate: number | null
          exw_total: number | null
          fcl_freight: number | null
          first_detail_cost: number | null
          first_payment: number | null
          id: string
          reservation_number: string
          second_payment_estimate: number | null
          shipping_method: string | null
          tariff: number | null
          total_supply_price: number | null
          unit_price: number | null
          updated_at: string | null
          vat: number | null
        }
        Insert: {
          china_shipping_cost?: number | null
          china_unit_price?: number | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          exchange_rate?: number | null
          exw_total?: number | null
          fcl_freight?: number | null
          first_detail_cost?: number | null
          first_payment?: number | null
          id?: string
          reservation_number: string
          second_payment_estimate?: number | null
          shipping_method?: string | null
          tariff?: number | null
          total_supply_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
          vat?: number | null
        }
        Update: {
          china_shipping_cost?: number | null
          china_unit_price?: number | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          exchange_rate?: number | null
          exw_total?: number | null
          fcl_freight?: number | null
          first_detail_cost?: number | null
          first_payment?: number | null
          id?: string
          reservation_number?: string
          second_payment_estimate?: number | null
          shipping_method?: string | null
          tariff?: number | null
          total_supply_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
          vat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_research_costs_reservation_number_fkey"
            columns: ["reservation_number"]
            isOneToOne: true
            referencedRelation: "inspection_applications"
            referencedColumns: ["reservation_number"]
          },
        ]
      }
      market_research_products: {
        Row: {
          box_height: number | null
          box_length: number | null
          box_width: number | null
          created_at: string | null
          id: string
          other_matters_kr: string | null
          product_code: string | null
          quoted_quantity: number | null
          research_photos: Json | null
          reservation_number: string
          total_boxes: number | null
          total_cbm: number | null
          units_per_box: number | null
          updated_at: string | null
          work_period: string | null
        }
        Insert: {
          box_height?: number | null
          box_length?: number | null
          box_width?: number | null
          created_at?: string | null
          id?: string
          other_matters_kr?: string | null
          product_code?: string | null
          quoted_quantity?: number | null
          research_photos?: Json | null
          reservation_number: string
          total_boxes?: number | null
          total_cbm?: number | null
          units_per_box?: number | null
          updated_at?: string | null
          work_period?: string | null
        }
        Update: {
          box_height?: number | null
          box_length?: number | null
          box_width?: number | null
          created_at?: string | null
          id?: string
          other_matters_kr?: string | null
          product_code?: string | null
          quoted_quantity?: number | null
          research_photos?: Json | null
          reservation_number?: string
          total_boxes?: number | null
          total_cbm?: number | null
          units_per_box?: number | null
          updated_at?: string | null
          work_period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_research_products_reservation_number_fkey"
            columns: ["reservation_number"]
            isOneToOne: true
            referencedRelation: "inspection_applications"
            referencedColumns: ["reservation_number"]
          },
        ]
      }
      market_research_requests: {
        Row: {
          additional_notes: string | null
          assigned_staff: string | null
          box_design_file: Json | null
          box_details: string | null
          box_height_cm: number | null
          box_length_cm: number | null
          box_width_cm: number | null
          cbm_volume: number | null
          certification_cost: number | null
          china_shipping_cost: number | null
          china_unit_price: number | null
          commission_amount: number | null
          commission_rate: number | null
          company_name: string
          contact_email: string
          contact_person: string
          contact_phone: string
          created_at: string | null
          custom_box_required: boolean | null
          detail_page: string | null
          estimated_shipping_cost: number | null
          estimated_tax: number | null
          estimated_total_amount: number | null
          estimated_total_supply: number | null
          estimated_unit_price: number | null
          exchange_rate: number | null
          exw_total: number | null
          first_payment_amount: number | null
          first_payment_details: string | null
          hs_code: string | null
          id: string
          logo_details: string | null
          logo_file: Json | null
          logo_print_details: string | null
          logo_required: boolean | null
          moq_check: boolean | null
          moq_quantity: number | null
          payment_status: string | null
          photos: Json | null
          product_colors: string | null
          product_composition: string | null
          product_dimensions: string | null
          product_functions: string | null
          product_height_cm: number | null
          product_length_cm: number | null
          product_materials: string | null
          product_name: string
          product_name_chinese: string | null
          product_options: string | null
          product_specifications: string | null
          product_url: string | null
          product_width_cm: number | null
          production_duration: string | null
          quote_amount: number | null
          quote_sent_at: string | null
          reference_files: Json | null
          required_certifications: string | null
          requirements: string
          research_completed_at: string | null
          research_photos: Json | null
          research_quantity: number
          reservation_number: string
          sample_availability: boolean | null
          sample_delivery_time: string | null
          sample_order_quantity: number | null
          sample_quantity: number | null
          sample_total_price: number | null
          sample_unit_price: number | null
          sample_weight_kg: number | null
          second_payment_estimate: number | null
          second_payment_note: string | null
          service_subtype: string | null
          service_type: string | null
          shipping_cost: number | null
          shipping_cost_note: string | null
          shipping_method: string | null
          status: string | null
          total_box_count: number | null
          units_per_box: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          assigned_staff?: string | null
          box_design_file?: Json | null
          box_details?: string | null
          box_height_cm?: number | null
          box_length_cm?: number | null
          box_width_cm?: number | null
          cbm_volume?: number | null
          certification_cost?: number | null
          china_shipping_cost?: number | null
          china_unit_price?: number | null
          commission_amount?: number | null
          commission_rate?: number | null
          company_name: string
          contact_email: string
          contact_person: string
          contact_phone: string
          created_at?: string | null
          custom_box_required?: boolean | null
          detail_page?: string | null
          estimated_shipping_cost?: number | null
          estimated_tax?: number | null
          estimated_total_amount?: number | null
          estimated_total_supply?: number | null
          estimated_unit_price?: number | null
          exchange_rate?: number | null
          exw_total?: number | null
          first_payment_amount?: number | null
          first_payment_details?: string | null
          hs_code?: string | null
          id?: string
          logo_details?: string | null
          logo_file?: Json | null
          logo_print_details?: string | null
          logo_required?: boolean | null
          moq_check?: boolean | null
          moq_quantity?: number | null
          payment_status?: string | null
          photos?: Json | null
          product_colors?: string | null
          product_composition?: string | null
          product_dimensions?: string | null
          product_functions?: string | null
          product_height_cm?: number | null
          product_length_cm?: number | null
          product_materials?: string | null
          product_name: string
          product_name_chinese?: string | null
          product_options?: string | null
          product_specifications?: string | null
          product_url?: string | null
          product_width_cm?: number | null
          production_duration?: string | null
          quote_amount?: number | null
          quote_sent_at?: string | null
          reference_files?: Json | null
          required_certifications?: string | null
          requirements: string
          research_completed_at?: string | null
          research_photos?: Json | null
          research_quantity: number
          reservation_number: string
          sample_availability?: boolean | null
          sample_delivery_time?: string | null
          sample_order_quantity?: number | null
          sample_quantity?: number | null
          sample_total_price?: number | null
          sample_unit_price?: number | null
          sample_weight_kg?: number | null
          second_payment_estimate?: number | null
          second_payment_note?: string | null
          service_subtype?: string | null
          service_type?: string | null
          shipping_cost?: number | null
          shipping_cost_note?: string | null
          shipping_method?: string | null
          status?: string | null
          total_box_count?: number | null
          units_per_box?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          assigned_staff?: string | null
          box_design_file?: Json | null
          box_details?: string | null
          box_height_cm?: number | null
          box_length_cm?: number | null
          box_width_cm?: number | null
          cbm_volume?: number | null
          certification_cost?: number | null
          china_shipping_cost?: number | null
          china_unit_price?: number | null
          commission_amount?: number | null
          commission_rate?: number | null
          company_name?: string
          contact_email?: string
          contact_person?: string
          contact_phone?: string
          created_at?: string | null
          custom_box_required?: boolean | null
          detail_page?: string | null
          estimated_shipping_cost?: number | null
          estimated_tax?: number | null
          estimated_total_amount?: number | null
          estimated_total_supply?: number | null
          estimated_unit_price?: number | null
          exchange_rate?: number | null
          exw_total?: number | null
          first_payment_amount?: number | null
          first_payment_details?: string | null
          hs_code?: string | null
          id?: string
          logo_details?: string | null
          logo_file?: Json | null
          logo_print_details?: string | null
          logo_required?: boolean | null
          moq_check?: boolean | null
          moq_quantity?: number | null
          payment_status?: string | null
          photos?: Json | null
          product_colors?: string | null
          product_composition?: string | null
          product_dimensions?: string | null
          product_functions?: string | null
          product_height_cm?: number | null
          product_length_cm?: number | null
          product_materials?: string | null
          product_name?: string
          product_name_chinese?: string | null
          product_options?: string | null
          product_specifications?: string | null
          product_url?: string | null
          product_width_cm?: number | null
          production_duration?: string | null
          quote_amount?: number | null
          quote_sent_at?: string | null
          reference_files?: Json | null
          required_certifications?: string | null
          requirements?: string
          research_completed_at?: string | null
          research_photos?: Json | null
          research_quantity?: number
          reservation_number?: string
          sample_availability?: boolean | null
          sample_delivery_time?: string | null
          sample_order_quantity?: number | null
          sample_quantity?: number | null
          sample_total_price?: number | null
          sample_unit_price?: number | null
          sample_weight_kg?: number | null
          second_payment_estimate?: number | null
          second_payment_note?: string | null
          service_subtype?: string | null
          service_type?: string | null
          shipping_cost?: number | null
          shipping_cost_note?: string | null
          shipping_method?: string | null
          status?: string | null
          total_box_count?: number | null
          units_per_box?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      market_research_samples: {
        Row: {
          cert_cost: number | null
          certification_required: boolean | null
          created_at: string | null
          hs_code: string | null
          id: string
          reservation_number: string
          sample_available: boolean | null
          sample_make_time: string | null
          sample_order_qty: number | null
          sample_price: number | null
          sample_unit_price: number | null
          sample_weight: number | null
          updated_at: string | null
        }
        Insert: {
          cert_cost?: number | null
          certification_required?: boolean | null
          created_at?: string | null
          hs_code?: string | null
          id?: string
          reservation_number: string
          sample_available?: boolean | null
          sample_make_time?: string | null
          sample_order_qty?: number | null
          sample_price?: number | null
          sample_unit_price?: number | null
          sample_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          cert_cost?: number | null
          certification_required?: boolean | null
          created_at?: string | null
          hs_code?: string | null
          id?: string
          reservation_number?: string
          sample_available?: boolean | null
          sample_make_time?: string | null
          sample_order_qty?: number | null
          sample_price?: number | null
          sample_unit_price?: number | null
          sample_weight?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_research_samples_reservation_number_fkey"
            columns: ["reservation_number"]
            isOneToOne: true
            referencedRelation: "inspection_applications"
            referencedColumns: ["reservation_number"]
          },
        ]
      }
      market_research_suppliers: {
        Row: {
          business_scope_kr: string | null
          company_scale: string | null
          company_size_kr: string | null
          company_status: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          established_date: string | null
          id: string
          industry_kr: string | null
          legal_type_kr: string | null
          registered_address: string | null
          registered_capital: string | null
          reservation_number: string
          supplier_name: string | null
          updated_at: string | null
        }
        Insert: {
          business_scope_kr?: string | null
          company_scale?: string | null
          company_size_kr?: string | null
          company_status?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          established_date?: string | null
          id?: string
          industry_kr?: string | null
          legal_type_kr?: string | null
          registered_address?: string | null
          registered_capital?: string | null
          reservation_number: string
          supplier_name?: string | null
          updated_at?: string | null
        }
        Update: {
          business_scope_kr?: string | null
          company_scale?: string | null
          company_size_kr?: string | null
          company_status?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          established_date?: string | null
          id?: string
          industry_kr?: string | null
          legal_type_kr?: string | null
          registered_address?: string | null
          registered_capital?: string | null
          reservation_number?: string
          supplier_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_research_suppliers_reservation_number_fkey"
            columns: ["reservation_number"]
            isOneToOne: true
            referencedRelation: "inspection_applications"
            referencedColumns: ["reservation_number"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_staff: string | null
          completed_at: string | null
          created_at: string | null
          customer_number: string | null
          duly_manager: string | null
          id: string
          margin_amount: number | null
          margin_percentage: number | null
          metadata: Json | null
          order_number: string
          payment_status: string | null
          service_type: string
          status: string
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_staff?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_number?: string | null
          duly_manager?: string | null
          id?: string
          margin_amount?: number | null
          margin_percentage?: number | null
          metadata?: Json | null
          order_number: string
          payment_status?: string | null
          service_type: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_staff?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_number?: string | null
          duly_manager?: string | null
          id?: string
          margin_amount?: number | null
          margin_percentage?: number | null
          metadata?: Json | null
          order_number?: string
          payment_status?: string | null
          service_type?: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      price_calculations: {
        Row: {
          calculation_number: string | null
          cbm: number | null
          commission: number | null
          created_at: string | null
          customs_clearance: number | null
          ddp_fcl: number | null
          ddp_lcl: number | null
          exchange_applied: number | null
          export_port: string | null
          exw_total: number | null
          first_payment_amount: number | null
          fob_total: number | null
          id: string
          product_name: string
          quantity: number
          second_payment_estimate: number | null
          tariff: number | null
          trade_terms: string | null
          unit_price_ddp: number | null
          unit_price_rmb: number
          user_id: string | null
        }
        Insert: {
          calculation_number?: string | null
          cbm?: number | null
          commission?: number | null
          created_at?: string | null
          customs_clearance?: number | null
          ddp_fcl?: number | null
          ddp_lcl?: number | null
          exchange_applied?: number | null
          export_port?: string | null
          exw_total?: number | null
          first_payment_amount?: number | null
          fob_total?: number | null
          id?: string
          product_name: string
          quantity: number
          second_payment_estimate?: number | null
          tariff?: number | null
          trade_terms?: string | null
          unit_price_ddp?: number | null
          unit_price_rmb: number
          user_id?: string | null
        }
        Update: {
          calculation_number?: string | null
          cbm?: number | null
          commission?: number | null
          created_at?: string | null
          customs_clearance?: number | null
          ddp_fcl?: number | null
          ddp_lcl?: number | null
          exchange_applied?: number | null
          export_port?: string | null
          exw_total?: number | null
          first_payment_amount?: number | null
          fob_total?: number | null
          id?: string
          product_name?: string
          quantity?: number
          second_payment_estimate?: number | null
          tariff?: number | null
          trade_terms?: string | null
          unit_price_ddp?: number | null
          unit_price_rmb?: number
          user_id?: string | null
        }
        Relationships: []
      }
      process_logs: {
        Row: {
          id: string
          internal_process: string | null
          ip_address: unknown | null
          is_internal: boolean | null
          log_type: string | null
          order_id: string
          process_feedback: string | null
          process_node: string
          process_result: string | null
          process_time: string | null
          processor: string
          step_number: number
          user_agent: string | null
        }
        Insert: {
          id?: string
          internal_process?: string | null
          ip_address?: unknown | null
          is_internal?: boolean | null
          log_type?: string | null
          order_id: string
          process_feedback?: string | null
          process_node: string
          process_result?: string | null
          process_time?: string | null
          processor: string
          step_number: number
          user_agent?: string | null
        }
        Update: {
          id?: string
          internal_process?: string | null
          ip_address?: unknown | null
          is_internal?: boolean | null
          log_type?: string | null
          order_id?: string
          process_feedback?: string | null
          process_node?: string
          process_result?: string | null
          process_time?: string | null
          processor?: string
          step_number?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          created_at: string | null
          id: string
          options: string | null
          product_link: string | null
          product_name: string
          purchase_status: string | null
          purchasing_order_id: string
          quantity: number
          total_price: number
          tracking_number: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          options?: string | null
          product_link?: string | null
          product_name: string
          purchase_status?: string | null
          purchasing_order_id: string
          quantity: number
          total_price: number
          tracking_number?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          options?: string | null
          product_link?: string | null
          product_name?: string
          purchase_status?: string | null
          purchasing_order_id?: string
          quantity?: number
          total_price?: number
          tracking_number?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_purchasing_order_id_fkey"
            columns: ["purchasing_order_id"]
            isOneToOne: false
            referencedRelation: "purchasing_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchasing_orders: {
        Row: {
          additional_requests: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          customs_clearance_status: string | null
          customs_docs: Json | null
          customs_name: string
          delivered_at: string | null
          domestic_shipping: number | null
          exchange_rate: number
          id: string
          marking_number: string | null
          order_id: string
          postal_code: string | null
          purchase_status: string | null
          purchase_type: string | null
          purchased_at: string | null
          receiver_name: string
          receiver_phone: string
          shipped_at: string | null
          shipping_address: string
          total_product_cost: number
          updated_at: string | null
          warehouse_location: string | null
          warehouse_number: string | null
        }
        Insert: {
          additional_requests?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          customs_clearance_status?: string | null
          customs_docs?: Json | null
          customs_name: string
          delivered_at?: string | null
          domestic_shipping?: number | null
          exchange_rate: number
          id?: string
          marking_number?: string | null
          order_id: string
          postal_code?: string | null
          purchase_status?: string | null
          purchase_type?: string | null
          purchased_at?: string | null
          receiver_name: string
          receiver_phone: string
          shipped_at?: string | null
          shipping_address: string
          total_product_cost: number
          updated_at?: string | null
          warehouse_location?: string | null
          warehouse_number?: string | null
        }
        Update: {
          additional_requests?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          customs_clearance_status?: string | null
          customs_docs?: Json | null
          customs_name?: string
          delivered_at?: string | null
          domestic_shipping?: number | null
          exchange_rate?: number
          id?: string
          marking_number?: string | null
          order_id?: string
          postal_code?: string | null
          purchase_status?: string | null
          purchase_type?: string | null
          purchased_at?: string | null
          receiver_name?: string
          receiver_phone?: string
          shipped_at?: string | null
          shipping_address?: string
          total_product_cost?: number
          updated_at?: string | null
          warehouse_location?: string | null
          warehouse_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchasing_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_items: {
        Row: {
          created_at: string | null
          evaluation_notes: string | null
          id: string
          photos: Json | null
          product_name: string
          quality_rating: number | null
          quantity: number
          sample_order_id: string
          specifications: string | null
          unit_price: number
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          evaluation_notes?: string | null
          id?: string
          photos?: Json | null
          product_name: string
          quality_rating?: number | null
          quantity: number
          sample_order_id: string
          specifications?: string | null
          unit_price: number
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          evaluation_notes?: string | null
          id?: string
          photos?: Json | null
          product_name?: string
          quality_rating?: number | null
          quantity?: number
          sample_order_id?: string
          specifications?: string | null
          unit_price?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_items_sample_order_id_fkey"
            columns: ["sample_order_id"]
            isOneToOne: false
            referencedRelation: "sample_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_orders: {
        Row: {
          additional_sample_request: boolean | null
          bulk_order_interest: boolean | null
          created_at: string | null
          customs_clearance_number: string | null
          customs_clearance_type: string | null
          customs_duty: number | null
          evaluation_result: string | null
          exchange_rate: number | null
          factory_delivery_tracking: string | null
          factory_sample_invoice: string | null
          feedback_comments: string | null
          gz_delivery_tracking: string | null
          gz_sample_invoice_number: string | null
          id: string
          improvement_request: string | null
          international_tracking: string | null
          order_id: string
          quality_rating: number | null
          received_at: string | null
          received_confirm: boolean | null
          received_date: string | null
          receiver_name: string | null
          receiver_phone: string | null
          reference_files: Json | null
          requirements: string | null
          research_id: string | null
          sample_items: Json | null
          sample_making_cost: number | null
          sample_photos: Json | null
          sample_receive_address: string | null
          sample_status: string | null
          sample_weight: Json | null
          shipping_cost: number | null
          shipping_method: string | null
          supplier_contact: string | null
          supplier_name: string | null
          supplier_phone: string | null
          total_krw: number | null
          total_sample_cost: number | null
          updated_at: string | null
        }
        Insert: {
          additional_sample_request?: boolean | null
          bulk_order_interest?: boolean | null
          created_at?: string | null
          customs_clearance_number?: string | null
          customs_clearance_type?: string | null
          customs_duty?: number | null
          evaluation_result?: string | null
          exchange_rate?: number | null
          factory_delivery_tracking?: string | null
          factory_sample_invoice?: string | null
          feedback_comments?: string | null
          gz_delivery_tracking?: string | null
          gz_sample_invoice_number?: string | null
          id?: string
          improvement_request?: string | null
          international_tracking?: string | null
          order_id: string
          quality_rating?: number | null
          received_at?: string | null
          received_confirm?: boolean | null
          received_date?: string | null
          receiver_name?: string | null
          receiver_phone?: string | null
          reference_files?: Json | null
          requirements?: string | null
          research_id?: string | null
          sample_items?: Json | null
          sample_making_cost?: number | null
          sample_photos?: Json | null
          sample_receive_address?: string | null
          sample_status?: string | null
          sample_weight?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          supplier_phone?: string | null
          total_krw?: number | null
          total_sample_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          additional_sample_request?: boolean | null
          bulk_order_interest?: boolean | null
          created_at?: string | null
          customs_clearance_number?: string | null
          customs_clearance_type?: string | null
          customs_duty?: number | null
          evaluation_result?: string | null
          exchange_rate?: number | null
          factory_delivery_tracking?: string | null
          factory_sample_invoice?: string | null
          feedback_comments?: string | null
          gz_delivery_tracking?: string | null
          gz_sample_invoice_number?: string | null
          id?: string
          improvement_request?: string | null
          international_tracking?: string | null
          order_id?: string
          quality_rating?: number | null
          received_at?: string | null
          received_confirm?: boolean | null
          received_date?: string | null
          receiver_name?: string | null
          receiver_phone?: string | null
          reference_files?: Json | null
          requirements?: string | null
          research_id?: string | null
          sample_items?: Json | null
          sample_making_cost?: number | null
          sample_photos?: Json | null
          sample_receive_address?: string | null
          sample_status?: string | null
          sample_weight?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          supplier_phone?: string | null
          total_krw?: number | null
          total_sample_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sampling_applications: {
        Row: {
          business_name: string | null
          business_number: string | null
          china_address: string | null
          china_receiver_name: string | null
          china_receiver_phone: string | null
          created_at: string | null
          customs_type: string | null
          id: string
          korea_receiver_name: string | null
          korea_receiver_phone: string | null
          korea_shipping_address: string | null
          market_research_id: string
          paid_at: string | null
          payment_status: string | null
          personal_customs_code: string | null
          personal_name: string | null
          product_name: string
          product_name_chinese: string | null
          request_files: Json | null
          requirements: string | null
          reservation_number: string
          sample_cost: number | null
          sample_quantity: number
          service_fee: number | null
          shipped_at: string | null
          shipping_method: string
          status: string | null
          subtotal: number | null
          total_amount: number | null
          tracking_number: string | null
          updated_at: string | null
          user_id: string
          vat: number | null
        }
        Insert: {
          business_name?: string | null
          business_number?: string | null
          china_address?: string | null
          china_receiver_name?: string | null
          china_receiver_phone?: string | null
          created_at?: string | null
          customs_type?: string | null
          id?: string
          korea_receiver_name?: string | null
          korea_receiver_phone?: string | null
          korea_shipping_address?: string | null
          market_research_id: string
          paid_at?: string | null
          payment_status?: string | null
          personal_customs_code?: string | null
          personal_name?: string | null
          product_name: string
          product_name_chinese?: string | null
          request_files?: Json | null
          requirements?: string | null
          reservation_number: string
          sample_cost?: number | null
          sample_quantity: number
          service_fee?: number | null
          shipped_at?: string | null
          shipping_method: string
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id: string
          vat?: number | null
        }
        Update: {
          business_name?: string | null
          business_number?: string | null
          china_address?: string | null
          china_receiver_name?: string | null
          china_receiver_phone?: string | null
          created_at?: string | null
          customs_type?: string | null
          id?: string
          korea_receiver_name?: string | null
          korea_receiver_phone?: string | null
          korea_shipping_address?: string | null
          market_research_id?: string
          paid_at?: string | null
          payment_status?: string | null
          personal_customs_code?: string | null
          personal_name?: string | null
          product_name?: string
          product_name_chinese?: string | null
          request_files?: Json | null
          requirements?: string | null
          reservation_number?: string
          sample_cost?: number | null
          sample_quantity?: number
          service_fee?: number | null
          shipped_at?: string | null
          shipping_method?: string
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string
          vat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sampling_applications_market_research_id_fkey"
            columns: ["market_research_id"]
            isOneToOne: false
            referencedRelation: "market_research_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_agency_orders: {
        Row: {
          consolidated_boxes: number | null
          consolidation_date: string | null
          consolidation_request: boolean | null
          created_at: string | null
          customer_code: string
          customs_number: string | null
          delivery_memo: string | null
          expected_packages: number
          id: string
          order_id: string
          received_packages: number | null
          shipping_number: string | null
          shipping_status: string | null
          storage_end_date: string | null
          storage_location: string | null
          storage_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          consolidated_boxes?: number | null
          consolidation_date?: string | null
          consolidation_request?: boolean | null
          created_at?: string | null
          customer_code: string
          customs_number?: string | null
          delivery_memo?: string | null
          expected_packages: number
          id?: string
          order_id: string
          received_packages?: number | null
          shipping_number?: string | null
          shipping_status?: string | null
          storage_end_date?: string | null
          storage_location?: string | null
          storage_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          consolidated_boxes?: number | null
          consolidation_date?: string | null
          consolidation_request?: boolean | null
          created_at?: string | null
          customer_code?: string
          customs_number?: string | null
          delivery_memo?: string | null
          expected_packages?: number
          id?: string
          order_id?: string
          received_packages?: number | null
          shipping_number?: string | null
          shipping_status?: string | null
          storage_end_date?: string | null
          storage_location?: string | null
          storage_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_agency_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_items: {
        Row: {
          created_at: string | null
          dimensions: string | null
          id: string
          notes: string | null
          package_condition: string | null
          product_name: string
          quantity: number
          received_at: string | null
          shipping_order_id: string
          tracking_number: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          dimensions?: string | null
          id?: string
          notes?: string | null
          package_condition?: string | null
          product_name: string
          quantity: number
          received_at?: string | null
          shipping_order_id: string
          tracking_number?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          dimensions?: string | null
          id?: string
          notes?: string | null
          package_condition?: string | null
          product_name?: string
          quantity?: number
          received_at?: string | null
          shipping_order_id?: string
          tracking_number?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_items_shipping_order_id_fkey"
            columns: ["shipping_order_id"]
            isOneToOne: false
            referencedRelation: "shipping_agency_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          file_path: string
          file_size: number
          file_type: string | null
          file_url: string | null
          id: string
          is_deleted: boolean | null
          metadata: Json | null
          mime_type: string | null
          order_id: string | null
          original_filename: string
          reservation_number: string | null
          upload_category: string | null
          upload_purpose: string
          upload_status: string | null
          upload_type: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          file_path: string
          file_size: number
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          order_id?: string | null
          original_filename: string
          reservation_number?: string | null
          upload_category?: string | null
          upload_purpose: string
          upload_status?: string | null
          upload_type?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          file_path?: string
          file_size?: number
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          order_id?: string | null
          original_filename?: string
          reservation_number?: string | null
          upload_category?: string | null
          upload_purpose?: string
          upload_status?: string | null
          upload_type?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          business_number: string | null
          company_name: string | null
          company_name_chinese: string | null
          contact_person: string | null
          created_at: string | null
          customer_type: string | null
          customs_type: string | null
          default_receiver_name: string | null
          default_receiver_phone: string | null
          default_shipping_address: string | null
          department: string | null
          full_name: string | null
          language_preference: string | null
          marketing_accepted_at: string | null
          notification_enabled: boolean | null
          personal_customs_code: string | null
          phone: string | null
          position: string | null
          privacy_accepted_at: string | null
          provider: string | null
          provider_id: string | null
          role: string
          terms_accepted_at: string | null
          updated_at: string | null
          user_id: string
          virtual_account: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          business_number?: string | null
          company_name?: string | null
          company_name_chinese?: string | null
          contact_person?: string | null
          created_at?: string | null
          customer_type?: string | null
          customs_type?: string | null
          default_receiver_name?: string | null
          default_receiver_phone?: string | null
          default_shipping_address?: string | null
          department?: string | null
          full_name?: string | null
          language_preference?: string | null
          marketing_accepted_at?: string | null
          notification_enabled?: boolean | null
          personal_customs_code?: string | null
          phone?: string | null
          position?: string | null
          privacy_accepted_at?: string | null
          provider?: string | null
          provider_id?: string | null
          role: string
          terms_accepted_at?: string | null
          updated_at?: string | null
          user_id: string
          virtual_account?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          business_number?: string | null
          company_name?: string | null
          company_name_chinese?: string | null
          contact_person?: string | null
          created_at?: string | null
          customer_type?: string | null
          customs_type?: string | null
          default_receiver_name?: string | null
          default_receiver_phone?: string | null
          default_shipping_address?: string | null
          department?: string | null
          full_name?: string | null
          language_preference?: string | null
          marketing_accepted_at?: string | null
          notification_enabled?: boolean | null
          personal_customs_code?: string | null
          phone?: string | null
          position?: string | null
          privacy_accepted_at?: string | null
          provider?: string | null
          provider_id?: string | null
          role?: string
          terms_accepted_at?: string | null
          updated_at?: string | null
          user_id?: string
          virtual_account?: string | null
        }
        Relationships: []
      }
      user_shipping_addresses: {
        Row: {
          address_name: string
          business_name: string | null
          business_number: string | null
          created_at: string | null
          customs_type: string
          id: string
          is_default: boolean | null
          personal_customs_code: string | null
          personal_name: string | null
          receiver_name: string
          receiver_phone: string
          shipping_address: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_name: string
          business_name?: string | null
          business_number?: string | null
          created_at?: string | null
          customs_type: string
          id?: string
          is_default?: boolean | null
          personal_customs_code?: string | null
          personal_name?: string | null
          receiver_name: string
          receiver_phone: string
          shipping_address: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_name?: string
          business_name?: string | null
          business_number?: string | null
          created_at?: string | null
          customs_type?: string
          id?: string
          is_default?: boolean | null
          personal_customs_code?: string | null
          personal_name?: string | null
          receiver_name?: string
          receiver_phone?: string
          shipping_address?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workflow_events: {
        Row: {
          actions_taken: Json | null
          completed_at: string | null
          context: Json | null
          created_at: string | null
          error_message: string | null
          event_name: string
          event_type: string
          executed_at: string | null
          from_state: string | null
          id: string
          order_id: string
          retry_count: number | null
          service_type: string
          status: string | null
          to_state: string | null
          triggered_at: string | null
          triggered_by: string | null
        }
        Insert: {
          actions_taken?: Json | null
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          error_message?: string | null
          event_name: string
          event_type: string
          executed_at?: string | null
          from_state?: string | null
          id?: string
          order_id: string
          retry_count?: number | null
          service_type: string
          status?: string | null
          to_state?: string | null
          triggered_at?: string | null
          triggered_by?: string | null
        }
        Update: {
          actions_taken?: Json | null
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          error_message?: string | null
          event_name?: string
          event_type?: string
          executed_at?: string | null
          from_state?: string | null
          id?: string
          order_id?: string
          retry_count?: number | null
          service_type?: string
          status?: string | null
          to_state?: string | null
          triggered_at?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_guest_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_translations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_guest_token: {
        Args: {
          p_order_id: string
          p_role: string
          p_guest_name?: string
          p_guest_email?: string
          p_expires_hours?: number
        }
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_reservation_number: {
        Args: { prefix: string }
        Returns: string
      }
      generate_simple_reservation_number: {
        Args: { service_prefix?: string }
        Returns: string
      }
      get_auth_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          role: string
          company_name: string
          contact_person: string
          phone: string
          provider: string
          avatar_url: string
          full_name: string
          approval_status: string
          language_preference: string
        }[]
      }
      get_user_role_cached: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_korean_team_cached: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_staff_cached: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_default_shipping_address: {
        Args: { p_user_id: string; p_address_id: string }
        Returns: Json
      }
      update_user_profile_from_sampling: {
        Args: {
          p_user_id: string
          p_shipping_method: string
          p_customs_type?: string
          p_business_name?: string
          p_business_number?: string
          p_korea_shipping_address?: string
          p_korea_receiver_name?: string
          p_korea_receiver_phone?: string
          p_personal_name?: string
          p_personal_customs_code?: string
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; name: string; owner: string; metadata: Json }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_level: {
        Args: { name: string }
        Returns: number
      }
      get_prefix: {
        Args: { name: string }
        Returns: string
      }
      get_prefixes: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_legacy_v1: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v1_optimised: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v2: {
        Args: {
          prefix: string
          bucket_name: string
          limits?: number
          levels?: number
          start_after?: string
        }
        Returns: {
          key: string
          name: string
          id: string
          updated_at: string
          created_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
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
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
} as const
