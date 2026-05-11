export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      donors: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      donations: {
        Row: {
          id: string;
          donor_id: string | null;
          amount_bdt: string;
          payment_method: string;
          reference_note: string | null;
          received_at: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          donor_id?: string | null;
          amount_bdt: string;
          payment_method?: string;
          reference_note?: string | null;
          received_at?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string | null;
          amount_bdt?: string;
          payment_method?: string;
          reference_note?: string | null;
          received_at?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey";
            columns: ["donor_id"];
            isOneToOne: false;
            referencedRelation: "donors";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          category: string;
          amount_bdt: string;
          description: string;
          beneficiary_note: string | null;
          spent_at: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          amount_bdt: string;
          description: string;
          beneficiary_note?: string | null;
          spent_at?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          amount_bdt?: string;
          description?: string;
          beneficiary_note?: string | null;
          spent_at?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      receipts: {
        Row: {
          id: string;
          receipt_no: string;
          donation_id: string;
          extra_payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          receipt_no: string;
          donation_id: string;
          extra_payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          receipt_no?: string;
          donation_id?: string;
          extra_payload?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receipts_donation_id_fkey";
            columns: ["donation_id"];
            isOneToOne: true;
            referencedRelation: "donations";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          diff: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          diff?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          diff?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      transparency_ledger: {
        Row: {
          id: string;
          kind: string;
          occurred_at: string;
          description: string | null;
          amount_in: string | null;
          amount_out: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      transparency_sums: {
        Args: Record<string, never>;
        Returns: {
          total_donations: string;
          total_expenses: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
