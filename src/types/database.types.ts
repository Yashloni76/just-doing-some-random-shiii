export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          owner_id: string
          business_name: string
          owner_name: string
          gstin: string | null
          city: string
          slug: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id?: string
          business_name: string
          owner_name: string
          gstin?: string | null
          city: string
          slug?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          business_name?: string
          owner_name?: string
          gstin?: string | null
          city?: string
          slug?: string | null
          created_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          business_id: string
          customer_name: string
          customer_phone: string
          start_date: string
          end_date: string
          status: string
          total_amount: number
          payment_status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_name: string
          customer_phone: string
          start_date: string
          end_date: string
          status?: string
          total_amount?: number
          payment_status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_name?: string
          customer_phone?: string
          start_date?: string
          end_date?: string
          status?: string
          total_amount?: number
          payment_status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          payment_method: string
          payment_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          payment_method: string
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          payment_method?: string
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      booking_items: {
        Row: {
          id: string
          booking_id: string
          inventory_item_id: string
          quantity_booked: number
        }
        Insert: {
          id?: string
          booking_id: string
          inventory_item_id: string
          quantity_booked: number
        }
        Update: {
          id?: string
          booking_id?: string
          inventory_item_id?: string
          quantity_booked?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_items: {
        Row: {
          id: string
          business_id: string
          name: string
          category: string
          total_quantity: number
          price_per_day: number
          gst_rate: number
          hsn_code: string
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          category: string
          total_quantity?: number
          price_per_day?: number
          gst_rate?: number
          hsn_code?: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          category?: string
          total_quantity?: number
          price_per_day?: number
          gst_rate?: number
          hsn_code?: string
          created_at?: string
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
