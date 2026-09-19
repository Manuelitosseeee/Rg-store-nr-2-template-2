import { createClient } from "@supabase/supabase-js";

// Chiavi pubbliche gestite nel pannello "Keys / API keys" del progetto.
// L'anon key è pubblica di proposito: la lettura del catalogo è aperta,
// mentre le scritture richiedono il login admin (regole RLS su Supabase).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

/* ------------------------------------------------------------------ */
/* Tipi delle tabelle — allineati a supabase/schema.sql                */
/* ------------------------------------------------------------------ */
export interface CategoryRow {
  id: string;
  label: string;
  sort_order: number;
}

export interface HomeCardRow {
  id: string;
  title: string;
  image_url: string;
  target_category: string | null;
  sort_order: number;
}

export interface ProductRow {
  id: string;
  category: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  image_url: string;
  bg_color: string;
  accent_color: string;
  available: boolean;
  sort_order: number;
}

export interface VariantRow {
  id: string;
  product_id: string;
  label: string;
  multiplier: number;
  available: boolean;
  sort_order: number;
}

export interface ContactRow {
  id: number;
  title: string;
  description: string;
  email: string;
  whatsapp_number: string;
  whatsapp_display: string;
  instagram: string;
  address: string;
  maps_embed_url: string;
  cta_label: string;
}