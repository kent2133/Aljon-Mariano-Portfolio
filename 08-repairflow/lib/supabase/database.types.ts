export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole =
  | "owner"
  | "administrator"
  | "service_advisor"
  | "technician"
  | "customer";
export type MembershipStatus = "invited" | "active" | "suspended";
export type TicketStatus =
  | "submitted"
  | "awaiting_diagnosis"
  | "awaiting_approval"
  | "approved"
  | "in_repair"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type QuoteStatus = "draft" | "sent" | "approved" | "declined" | "expired";
export type QuoteItemKind = "part" | "labor" | "fee";
export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "void";
export type AttachmentKind = "customer_upload" | "diagnostic_photo" | "repair_photo" | "document";

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      organizations: Table<
        {
          id: string;
          name: string;
          slug: string;
          email: string | null;
          phone: string | null;
          timezone: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          slug: string;
          email?: string | null;
          phone?: string | null;
          timezone?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          name?: string;
          slug?: string;
          email?: string | null;
          phone?: string | null;
          timezone?: string;
          updated_at?: string;
        }
      >;
      profiles: Table<
        {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          email: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          email?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        }
      >;
      memberships: Table<
        {
          id: string;
          organization_id: string;
          user_id: string;
          role: AppRole;
          status: MembershipStatus;
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: AppRole;
          status?: MembershipStatus;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          role?: AppRole;
          status?: MembershipStatus;
          invited_by?: string | null;
          updated_at?: string;
        }
      >;
      customers: Table<
        {
          id: string;
          organization_id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          address: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          user_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          updated_at?: string;
        }
      >;
      devices: Table<
        {
          id: string;
          organization_id: string;
          customer_id: string;
          category: string;
          brand: string;
          model: string;
          serial_number: string | null;
          color: string | null;
          accessories: string[];
          intake_notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          customer_id: string;
          category: string;
          brand: string;
          model: string;
          serial_number?: string | null;
          color?: string | null;
          accessories?: string[];
          intake_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          customer_id?: string;
          category?: string;
          brand?: string;
          model?: string;
          serial_number?: string | null;
          color?: string | null;
          accessories?: string[];
          intake_notes?: string | null;
          updated_at?: string;
        }
      >;
      repair_tickets: Table<
        {
          id: string;
          organization_id: string;
          customer_id: string;
          device_id: string;
          ticket_number: string;
          title: string;
          problem_description: string;
          diagnosis: string | null;
          resolution: string | null;
          status: TicketStatus;
          priority: TicketPriority;
          assigned_to: string | null;
          opened_by: string;
          estimated_completion_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          customer_id: string;
          device_id: string;
          ticket_number?: string;
          title: string;
          problem_description: string;
          diagnosis?: string | null;
          resolution?: string | null;
          status?: TicketStatus;
          priority?: TicketPriority;
          assigned_to?: string | null;
          opened_by: string;
          estimated_completion_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          title?: string;
          problem_description?: string;
          diagnosis?: string | null;
          resolution?: string | null;
          status?: TicketStatus;
          priority?: TicketPriority;
          assigned_to?: string | null;
          estimated_completion_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        }
      >;
      ticket_history: Table<
        {
          id: string;
          organization_id: string;
          ticket_id: string;
          actor_id: string | null;
          event_type: string;
          from_status: TicketStatus | null;
          to_status: TicketStatus | null;
          message: string | null;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          ticket_id: string;
          actor_id?: string | null;
          event_type: string;
          from_status?: TicketStatus | null;
          to_status?: TicketStatus | null;
          message?: string | null;
          metadata?: Json;
          created_at?: string;
        },
        {
          message?: string | null;
          metadata?: Json;
        }
      >;
      quotes: Table<
        {
          id: string;
          organization_id: string;
          ticket_id: string;
          quote_number: string;
          status: QuoteStatus;
          subtotal: number;
          tax: number;
          discount: number;
          total: number;
          currency: string;
          customer_note: string | null;
          internal_note: string | null;
          valid_until: string | null;
          sent_at: string | null;
          responded_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          ticket_id: string;
          quote_number?: string;
          status?: QuoteStatus;
          subtotal?: number;
          tax?: number;
          discount?: number;
          total?: number;
          currency?: string;
          customer_note?: string | null;
          internal_note?: string | null;
          valid_until?: string | null;
          sent_at?: string | null;
          responded_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          status?: QuoteStatus;
          subtotal?: number;
          tax?: number;
          discount?: number;
          total?: number;
          currency?: string;
          customer_note?: string | null;
          internal_note?: string | null;
          valid_until?: string | null;
          sent_at?: string | null;
          responded_at?: string | null;
          updated_at?: string;
        }
      >;
      quote_items: Table<
        {
          id: string;
          organization_id: string;
          quote_id: string;
          position: number;
          kind: QuoteItemKind;
          description: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          quote_id: string;
          position?: number;
          kind?: QuoteItemKind;
          description: string;
          quantity?: number;
          unit_price: number;
          created_at?: string;
        },
        {
          position?: number;
          kind?: QuoteItemKind;
          description?: string;
          quantity?: number;
          unit_price?: number;
        }
      >;
      attachments: Table<
        {
          id: string;
          organization_id: string;
          ticket_id: string;
          uploaded_by: string;
          bucket_id: string;
          object_path: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number;
          kind: AttachmentKind;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          ticket_id: string;
          uploaded_by: string;
          bucket_id?: string;
          object_path: string;
          file_name: string;
          mime_type?: string | null;
          size_bytes?: number;
          kind?: AttachmentKind;
          created_at?: string;
        },
        {
          file_name?: string;
          kind?: AttachmentKind;
        }
      >;
      comments: Table<
        {
          id: string;
          organization_id: string;
          ticket_id: string;
          author_id: string;
          body: string;
          is_internal: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          ticket_id: string;
          author_id: string;
          body: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          body?: string;
          is_internal?: boolean;
          updated_at?: string;
        }
      >;
      invoices: Table<
        {
          id: string;
          organization_id: string;
          ticket_id: string;
          quote_id: string | null;
          invoice_number: string;
          status: InvoiceStatus;
          subtotal: number;
          tax: number;
          discount: number;
          total: number;
          amount_paid: number;
          currency: string;
          due_at: string | null;
          issued_at: string | null;
          paid_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          ticket_id: string;
          quote_id?: string | null;
          invoice_number?: string;
          status?: InvoiceStatus;
          subtotal?: number;
          tax?: number;
          discount?: number;
          total?: number;
          amount_paid?: number;
          currency?: string;
          due_at?: string | null;
          issued_at?: string | null;
          paid_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          status?: InvoiceStatus;
          amount_paid?: number;
          due_at?: string | null;
          issued_at?: string | null;
          paid_at?: string | null;
          updated_at?: string;
        }
      >;
      audit_events: Table<
        {
          id: string;
          organization_id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        },
        never
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_org_member: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
      has_org_role: {
        Args: { target_organization_id: string; allowed_roles: AppRole[] };
        Returns: boolean;
      };
      can_access_ticket: {
        Args: { target_ticket_id: string };
        Returns: boolean;
      };
      respond_to_quote: {
        Args: { target_quote_id: string; decision: QuoteStatus };
        Returns: Database["public"]["Tables"]["quotes"]["Row"];
      };
      bootstrap_personal_organization: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["organizations"]["Row"];
      };
    };
    Enums: {
      app_role: AppRole;
      membership_status: MembershipStatus;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
      quote_status: QuoteStatus;
      quote_item_kind: QuoteItemKind;
      invoice_status: InvoiceStatus;
      attachment_kind: AttachmentKind;
    };
    CompositeTypes: Record<string, never>;
  };
}
