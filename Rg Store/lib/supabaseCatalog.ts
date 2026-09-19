import { CATALOG, HOME_CATEGORIES } from "@/lib/catalog";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  CategoryRow,
  ContactRow,
  HomeCardRow,
  ProductRow,
  VariantRow,
} from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/* Tipi "runtime" usati dalla vetrina                                  */
/* ------------------------------------------------------------------ */
export interface RuntimeVariant {
  value: string;
  multiplier: number;
  scale: number;
  available: boolean;
}

export interface RuntimeProduct {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  src: string;
  bg: string;
  accentHex: string;
  available: boolean;
  variants: RuntimeVariant[];
}

export interface RuntimeCategory {
  id: string;
  label: string;
  watermark: string;
  centerScale: number;
  boxW: number;
  boxH: number;
  mobileBoxW: number;
  mobileBoxH: number;
  priceLabel: (v: string) => string;
  products: RuntimeProduct[];
}

export interface RuntimeHomeCard {
  id: string;
  title: string;
  src: string;
  targetIndex: number;
  crop: boolean;
}

export interface CatalogData {
  categories: CategoryRow[];
  homeCards: HomeCardRow[];
  products: ProductRow[];
  variants: VariantRow[];
  contacts: ContactRow | null;
}

export interface BuiltCatalog {
  categories: RuntimeCategory[];
  homeCards: RuntimeHomeCard[];
  contacts: ContactRow | null;
}

/* ------------------------------------------------------------------ */
/* Dati predefiniti sezione Contatti (usati anche come fallback)       */
/* ------------------------------------------------------------------ */
export const CONTACT_DEFAULTS: ContactRow = {
  id: 1,
  title: "Parliamo del tuo ordine.",
  description:
    "Domande su taglie, disponibilità o spedizioni? Scrivici: rispondiamo entro 24 ore, dal lunedì al sabato.",
  email: "info@rgstore.it",
  whatsapp_number: "393450000000",
  whatsapp_display: "+39 345 000 0000",
  instagram: "@rg.store",
  address: "Showroom · Milano, Italia",
  maps_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2798.118670876798!2d9.19154381555894!3d45.46944367910103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c6b4fa7bfa77%3A0xb35e67046e7f2231!2sVia%20Monte%20Napoleone%2C%2020121%20Milano%20MI!5e0!3m2!1sit!2sit!4v1659000000000!5m2!1sit!2sit",
  cta_label: "Scrivici su WhatsApp",
};

/* ------------------------------------------------------------------ */
/* Layout per categoria (costanti di design, non nel database)         */
/* ------------------------------------------------------------------ */
const LAYOUT: Record<
  string,
  { centerScale: number; boxW: number; boxH: number; mobileBoxW: number; mobileBoxH: number }
> = {
  cinture: { centerScale: 1.75, boxW: 340, boxH: 260, mobileBoxW: 230, mobileBoxH: 200 },
  scarpe: { centerScale: 1.9, boxW: 320, boxH: 360, mobileBoxW: 250, mobileBoxH: 280 },
  profumi: { centerScale: 2.8, boxW: 280, boxH: 460, mobileBoxW: 230, mobileBoxH: 330 },
};

const CATEGORY_INDEX: Record<string, number> = {
  cinture: 1,
  scarpe: 2,
  profumi: 3,
};

const priceLabelFor = (catId: string) => (v: string) =>
  catId === "profumi"
    ? `Flacone ${v}ml`
    : catId === "cinture"
      ? `Taglia ${v} cm`
      : `Taglia ${v}`;

// Scala animazione profumi: deriva dal moltiplicatore prezzo
// (1 → 1, 1.8 → 1.08, 2.8 → 1.18), come nel vecchio catalogo statico.
const scaleFromMultiplier = (m: number) => 1 + (m - 1) * 0.1;

const toRuntimeVariant = (v: VariantRow): RuntimeVariant => ({
  value: v.label,
  multiplier: Number(v.multiplier),
  scale: scaleFromMultiplier(Number(v.multiplier)),
  available: v.available,
});

const toRuntimeProduct = (
  p: ProductRow,
  variants: VariantRow[]
): RuntimeProduct => ({
  id: p.id,
  name: p.name,
  subtitle: p.subtitle,
  description: p.description,
  price: Number(p.price),
  src: p.image_url,
  bg: p.bg_color,
  accentHex: p.accent_color,
  available: p.available,
  variants: variants
    .filter((v) => v.product_id === p.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toRuntimeVariant),
});

/* ------------------------------------------------------------------ */
/* Caricamento dal database                                            */
/* ------------------------------------------------------------------ */
export async function fetchCatalog(): Promise<CatalogData | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const [categories, homeCards, products, variants, contacts] =
      await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("home_cards").select("*").order("sort_order"),
        supabase.from("products").select("*").order("sort_order"),
        supabase.from("variants").select("*").order("sort_order"),
        supabase.from("contacts").select("*").limit(1),
      ]);
    for (const res of [categories, homeCards, products, variants, contacts]) {
      if (res.error) throw res.error;
    }
    return {
      categories: (categories.data ?? []) as CategoryRow[],
      homeCards: (homeCards.data ?? []) as HomeCardRow[],
      products: (products.data ?? []) as ProductRow[],
      variants: (variants.data ?? []) as VariantRow[],
      contacts: (contacts.data?.[0] ?? null) as ContactRow | null,
    };
  } catch (e) {
    console.error("Errore caricamento catalogo dal database:", e);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Mappa i dati del database nelle strutture usate dalla vetrina       */
/* ------------------------------------------------------------------ */
export function buildCatalog(data: CatalogData): BuiltCatalog {
  const categories: RuntimeCategory[] = [...data.categories]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((cat) => {
      const layout = LAYOUT[cat.id] ?? LAYOUT.scarpe;
      return {
        id: cat.id,
        label: cat.label,
        watermark: "RG STORE",
        ...layout,
        priceLabel: priceLabelFor(cat.id),
        products: data.products
          .filter((p) => p.category === cat.id)
          .map((p) => toRuntimeProduct(p, data.variants)),
      };
    });

  const homeCards: RuntimeHomeCard[] = [...data.homeCards]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({
      id: c.id,
      title: c.title,
      src: c.image_url,
      targetIndex: c.target_category
        ? CATEGORY_INDEX[c.target_category] ?? 1
        : 0,
      crop: c.target_category === "profumi",
    }));

  return { categories, homeCards, contacts: data.contacts };
}

/* ------------------------------------------------------------------ */
/* Fallback: catalogo statico (nessuna chiave configurata)             */
/* ------------------------------------------------------------------ */
export function buildStaticCatalog(): BuiltCatalog {
  const categories: RuntimeCategory[] = CATALOG.map((cat) => ({
    id: cat.id,
    label: cat.label,
    watermark: "RG STORE",
    centerScale: cat.centerScale,
    boxW: cat.boxW,
    boxH: cat.boxH,
    mobileBoxW: cat.mobileBoxW,
    mobileBoxH: cat.mobileBoxH,
    priceLabel: cat.priceLabel,
    products: cat.products.map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      price: p.price,
      src: p.src,
      bg: p.bg,
      accentHex: p.accentHex,
      available: true,
      variants: cat.variants.map((v) => ({
        value: v.value,
        multiplier: v.multiplier,
        scale: v.scale,
        available: true,
      })),
    })),
  }));

  const homeCards: RuntimeHomeCard[] = HOME_CATEGORIES.map((c) => ({
    id: c.id,
    title: c.label,
    src: c.src,
    targetIndex: c.targetIndex,
    crop: c.crop,
  }));

  return { categories, homeCards, contacts: CONTACT_DEFAULTS };
}

/* ------------------------------------------------------------------ */
/* Prezzo di una variante (prezzo base × moltiplicatore)               */
/* ------------------------------------------------------------------ */
export const getUnitPrice = (product: RuntimeProduct, variantValue: string) => {
  const opt =
    product.variants.find((v) => v.value === variantValue) ??
    product.variants[0];
  if (!opt) return product.price;
  return Math.round(product.price * opt.multiplier * 100) / 100;
};