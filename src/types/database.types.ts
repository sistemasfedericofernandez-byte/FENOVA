/**
 * Tipos de la base de datos. En un proyecto real esto se regenera con:
 *   supabase gen types typescript --project-id <id> > src/types/database.types.ts
 * Se escribe a mano aquí, reflejando el esquema de supabase/migrations,
 * como punto de partida hasta tener un proyecto Supabase provisionado.
 */

export type UserRole =
  | "super_admin"
  | "inmobiliaria"
  | "hotel"
  | "dueno_directo"
  | "afiliado";

export type ProfileStatus = "activo" | "suspendido" | "pendiente_validacion";

export type VerificationStatus =
  | "no_iniciado"
  | "pendiente"
  | "aprobado"
  | "rechazado";

export type SubscriptionStatus = "activa" | "pausada" | "vencida" | "cancelada";

export type PaymentStatus = "aprobado" | "rechazado" | "pendiente" | "reembolsado";

export type OperationType = "venta" | "alquiler" | "alquiler_temporal";

export type PropertyType =
  | "casa"
  | "departamento"
  | "terreno"
  | "local"
  | "oficina"
  | "galpon"
  | "quinta"
  | "otro";

export type PriceCurrency = "ARS" | "USD";

export type PropertyStatus =
  | "borrador"
  | "publicada"
  | "oculta"
  | "pausada_por_impago";

export type BulkUploadStatus =
  | "procesando"
  | "completado"
  | "completado_con_errores"
  | "fallido";

export type PropertyEventType = "view" | "whatsapp_click";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          whatsapp_number: string | null;
          avatar_url: string | null;
          status: ProfileStatus;
          referred_by_affiliate_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          role: UserRole;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      agencies: {
        Row: {
          id: string;
          profile_id: string;
          business_name: string;
          cuit: string | null;
          city: string;
          logo_url: string | null;
          whatsapp_number: string | null;
          is_verified_owner: boolean;
          verification_doc_url: string | null;
          verification_status: VerificationStatus;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["agencies"]["Row"]> & {
          profile_id: string;
          business_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["agencies"]["Row"]>;
        Relationships: [];
      };
      affiliates: {
        Row: {
          id: string;
          profile_id: string | null;
          full_name: string;
          referral_code: string;
          commission_percent: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["affiliates"]["Row"]> & {
          full_name: string;
          referral_code: string;
          commission_percent: number;
        };
        Update: Partial<Database["public"]["Tables"]["affiliates"]["Row"]>;
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price_ars: number;
          max_active_listings: number;
          allows_csv_bulk_upload: boolean;
          allows_advanced_stats: boolean;
          mercadopago_plan_id: string | null;
          active: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["subscription_plans"]["Row"]> & {
          name: string;
          slug: string;
          price_ars: number;
          max_active_listings: number;
        };
        Update: Partial<Database["public"]["Tables"]["subscription_plans"]["Row"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          agency_id: string;
          plan_id: string;
          status: SubscriptionStatus;
          mercadopago_subscription_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          agency_id: string;
          plan_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          subscription_id: string;
          mercadopago_payment_id: string;
          status: PaymentStatus;
          amount_ars: number;
          paid_at: string | null;
          raw_webhook_payload: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          subscription_id: string;
          mercadopago_payment_id: string;
          status: PaymentStatus;
          amount_ars: number;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      neighborhoods: {
        Row: {
          id: string;
          name: string;
          city: string;
          active: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["neighborhoods"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["neighborhoods"]["Row"]>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          agency_id: string;
          title: string;
          slug: string;
          description: string | null;
          operation_type: OperationType;
          property_type: PropertyType;
          neighborhood_id: string | null;
          address_text: string | null;
          lat: number | null;
          lng: number | null;
          price_amount: number;
          price_currency: PriceCurrency;
          expenses_amount: number | null;
          surface_total_m2: number | null;
          surface_covered_m2: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          features: Record<string, unknown> | null;
          status: PropertyStatus;
          views_count: number;
          whatsapp_clicks_count: number;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["properties"]["Row"]> & {
          agency_id: string;
          title: string;
          slug: string;
          operation_type: OperationType;
          property_type: PropertyType;
          price_amount: number;
          price_currency: PriceCurrency;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Row"]>;
        Relationships: [];
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          cloudinary_public_id: string;
          url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["property_images"]["Row"]> & {
          property_id: string;
          cloudinary_public_id: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_images"]["Row"]>;
        Relationships: [];
      };
      bulk_upload_jobs: {
        Row: {
          id: string;
          agency_id: string;
          file_url: string;
          status: BulkUploadStatus;
          total_rows: number;
          success_rows: number;
          error_rows: number;
          error_log: Record<string, unknown> | unknown[] | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bulk_upload_jobs"]["Row"]> & {
          agency_id: string;
          file_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["bulk_upload_jobs"]["Row"]>;
        Relationships: [];
      };
      search_alerts: {
        Row: {
          id: string;
          email: string;
          operation_type: OperationType | null;
          property_type: PropertyType | null;
          neighborhood_id: string | null;
          price_max: number | null;
          raw_query_text: string | null;
          active: boolean;
          last_notified_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["search_alerts"]["Row"]> & {
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["search_alerts"]["Row"]>;
        Relationships: [];
      };
      property_events: {
        Row: {
          id: string;
          property_id: string;
          event_type: PropertyEventType;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["property_events"]["Row"]> & {
          property_id: string;
          event_type: PropertyEventType;
        };
        Update: Partial<Database["public"]["Tables"]["property_events"]["Row"]>;
        Relationships: [];
      };
      tenants_registry: {
        Row: {
          id: string;
          dni: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tenants_registry"]["Row"]> & {
          dni: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants_registry"]["Row"]>;
        Relationships: [];
      };
      tenant_ratings: {
        Row: {
          id: string;
          tenant_id: string;
          rated_by_agency_id: string;
          score: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tenant_ratings"]["Row"]> & {
          tenant_id: string;
          rated_by_agency_id: string;
          score: number;
        };
        Update: Partial<Database["public"]["Tables"]["tenant_ratings"]["Row"]>;
        Relationships: [];
      };
      tenant_lookup_audit: {
        Row: {
          id: string;
          dni_queried: string;
          queried_by_agency_id: string;
          queried_by_profile_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tenant_lookup_audit"]["Row"]> & {
          dni_queried: string;
          queried_by_agency_id: string;
          queried_by_profile_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenant_lookup_audit"]["Row"]>;
        Relationships: [];
      };
      neighborhood_roi_snapshot: {
        Row: {
          id: string;
          neighborhood_id: string;
          avg_sale_price_m2: number | null;
          avg_rent_price: number | null;
          estimated_roi_percent: number | null;
          sample_size_sale: number;
          sample_size_rent: number;
          calculated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["neighborhood_roi_snapshot"]["Row"]
        > & {
          neighborhood_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["neighborhood_roi_snapshot"]["Row"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      lookup_tenant_by_dni: {
        Args: { p_dni: string };
        Returns: {
          tenant_id: string;
          full_name: string | null;
          score: number;
          comment: string | null;
          rated_by_agency_id: string;
          created_at: string;
        }[];
      };
      rate_tenant_by_dni: {
        Args: {
          p_dni: string;
          p_full_name: string | null;
          p_score: number;
          p_comment: string | null;
        };
        Returns: string;
      };
      increment_property_counter: {
        Args: { p_property_id: string; p_column: string };
        Returns: undefined;
      };
    };
  };
}
