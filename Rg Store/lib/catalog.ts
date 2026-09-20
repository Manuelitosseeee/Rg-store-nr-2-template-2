import { EXTRAS } from "@/lib/extras";

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  src: string;
  /**
   * Colore di fondo della sezione quando questo capo è in vetrina.
   * È "prevalentemente" il colore del capo: le bande e la lastra centrale
   * vengono ricavate da questo tono in CSS (senza sfondi piatti).
   */
  bg: string;
  /**
   * Colore del dettaglio principale del capo: è la luce del "faretto"
   * che illumina il fumo sotto il prodotto.
   */
  accentHex: string;
}

export interface VariantOption {
  value: string;
  multiplier: number;
  scale: number;
}

export interface CategoryConfig {
  id: string;
  label: string;
  watermark: string;
  centerScale: number;
  boxW: number;
  boxH: number;
  mobileBoxW: number;
  mobileBoxH: number;
  variantLabel: string;
  variants: VariantOption[];
  priceLabel: (v: string) => string;
  products: Product[];
}

const img = (file: string) => `/vintage/${file}.png`;

const maglie: Product[] = [
  {
    id: "maglia-1",
    name: "Maglia 1",
    subtitle: "Rosso",
    description:
      "Maglia rossa dal taglio vintage: colore pieno e finiture a contrasto.",
    price: 39.9,
    src: img("maglia-1"),
    bg: "#5e1622",
    accentHex: "#d9414f",
  },
  {
    id: "maglia-2",
    name: "Maglia 2",
    subtitle: "Nero",
    description:
      "Maglia scura essenziale: base nera, taglio pulito, stile da club.",
    price: 39.9,
    src: img("maglia-2"),
    bg: "#33333c",
    accentHex: "#a8b0c0",
  },
  {
    id: "maglia-3",
    name: "Maglia 3",
    subtitle: "Blu",
    description: "Maglia blu profondo, ispirata alle casacche vintage.",
    price: 39.9,
    src: img("maglia-3"),
    bg: "#0f3f8c",
    accentHex: "#3878e0",
  },
  {
    id: "maglia-4",
    name: "Maglia 4",
    subtitle: "Verde petrolio",
    description:
      "Maglia verde petrolio, tinta piena e dettagli ridotti all'essenziale.",
    price: 39.9,
    src: img("maglia-4"),
    bg: "#0f564f",
    accentHex: "#1fae97",
  },
];

const completi: Product[] = [
  {
    id: "completo-1",
    name: "Completo 1",
    subtitle: "Chiaro",
    description:
      "Completo chiaro con dettagli rossi: maglia e pantalone abbinati.",
    price: 89.9,
    src: img("completo-1"),
    bg: "#b9b1bf",
    accentHex: "#cf4759",
  },
  {
    id: "completo-2",
    name: "Completo 2",
    subtitle: "Blu & Giallo",
    description:
      "Completo blu con dettagli gialli, il classico da trasferta.",
    price: 89.9,
    src: img("completo-2"),
    bg: "#1c3e68",
    accentHex: "#d8c24f",
  },
  {
    id: "completo-3",
    name: "Completo 3",
    subtitle: "Viola",
    description: "Completo viola intenso, maglia e pantalone coordinati.",
    price: 89.9,
    src: img("completo-3"),
    bg: "#463065",
    accentHex: "#9061d6",
  },
  {
    id: "completo-4",
    name: "Completo 4",
    subtitle: "Nero",
    description: "Completo nero con dettagli rosa antico.",
    price: 89.9,
    src: img("completo-4"),
    bg: "#26212a",
    accentHex: "#bb7d95",
  },
];

const pantaloni: Product[] = [
  {
    id: "pantalone-1",
    name: "Pantalone 1",
    subtitle: "Rosso",
    description: "Pantalone rosso dal taglio vintage.",
    price: 44.9,
    src: img("pantalone-1"),
    bg: "#5a1019",
    accentHex: "#d9414f",
  },
  {
    id: "pantalone-2",
    name: "Pantalone 2",
    subtitle: "Antracite",
    description: "Pantalone antracite, essenziale e senza tempo.",
    price: 44.9,
    src: img("pantalone-2"),
    bg: "#2b2530",
    accentHex: "#a4596a",
  },
  {
    id: "pantalone-3",
    name: "Pantalone 3",
    subtitle: "Blu navy",
    description: "Pantalone blu navy con dettagli rossi.",
    price: 44.9,
    src: img("pantalone-3"),
    bg: "#1f2644",
    accentHex: "#bc4150",
  },
  {
    id: "pantalone-4",
    name: "Pantalone 4",
    subtitle: "Chiaro",
    description: "Pantalone chiaro, da abbinare alla maglia.",
    price: 44.9,
    src: img("pantalone-4"),
    bg: "#b4acb8",
    accentHex: "#c84a5c",
  },
];

const sizeVariants = (values: string[]): VariantOption[] =>
  values.map((v) => ({ value: v, multiplier: 1, scale: 1 }));

const TAGLIE = ["S", "M", "L", "XL"];

export const CATALOG: CategoryConfig[] = [
  {
    id: "maglie",
    label: "Maglie",
    watermark: "VINTAGE",
    centerScale: 1.6,
    boxW: 320,
    boxH: 380,
    mobileBoxW: 250,
    mobileBoxH: 300,
    variantLabel: "Taglia",
    variants: sizeVariants(TAGLIE),
    priceLabel: (v) => `Taglia ${v}`,
    products: maglie,
  },
  {
    id: "completi",
    label: "Completi",
    watermark: "VINTAGE",
    centerScale: 1.5,
    boxW: 340,
    boxH: 420,
    mobileBoxW: 260,
    mobileBoxH: 330,
    variantLabel: "Taglia",
    variants: sizeVariants(TAGLIE),
    priceLabel: (v) => `Taglia ${v}`,
    products: completi,
  },
  {
    id: "pantaloni",
    label: "Pantaloni",
    watermark: "VINTAGE",
    centerScale: 1.6,
    boxW: 300,
    boxH: 420,
    mobileBoxW: 240,
    mobileBoxH: 330,
    variantLabel: "Taglia",
    variants: sizeVariants(TAGLIE),
    priceLabel: (v) => `Taglia ${v}`,
    products: pantaloni,
  },
];

// Voci di navigazione nell'ordine delle sezioni della pagina.
// "Catalogo Classico" è una sezione TEMPORANEA: compare solo quando
// EXTRAS.catalogoClassico è attivo (lib/extras.ts). Gli indici sono
// calcolati dall'ordine, così aggiungere/togliere la voce non richiede
// altri ritocchi.
const NAV_ENTRIES: { id: string; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "maglie", label: "Maglie" },
  { id: "completi", label: "Completi" },
  { id: "pantaloni", label: "Pantaloni" },
  ...(EXTRAS.catalogoClassico
    ? [{ id: "catalogo", label: "Catalogo Classico" }]
    : []),
  { id: "contatti", label: "Contatti" },
];

export const NAV_ITEMS: { id: string; label: string; index: number }[] =
  NAV_ENTRIES.map((entry, index) => ({ ...entry, index }));

/** Indice della sezione Contatti (sempre l'ultima voce). */
export const CONTATTI_INDEX = NAV_ITEMS.length - 1;

/** Indice della sezione Catalogo Classico, oppure -1 se disattivata. */
export const CATALOGO_INDEX = NAV_ITEMS.findIndex((n) => n.id === "catalogo");

export const CONTATTI_BG = "#101216";
export const HOME_BG = "#0d0f12";

export interface HomeCategory {
  id: string;
  label: string;
  src: string;
  targetIndex: number;
  // true = ritaglia i lati vuoti del canvas, così l'oggetto si vede grande.
  crop: boolean;
}

// Le tre categorie mostrate nella sezione Home:
// centrale (COMPLETI) più grande, laterali (MAGLIE / PANTALONI) più piccole.
export const HOME_CATEGORIES: HomeCategory[] = [
  {
    id: "maglie",
    label: "MAGLIE",
    src: img("maglia-1"),
    targetIndex: 1,
    crop: false,
  },
  {
    id: "completi",
    label: "COMPLETI",
    src: img("completo-2"),
    targetIndex: 2,
    crop: false,
  },
  {
    id: "pantaloni",
    label: "PANTALONI",
    src: img("pantalone-4"),
    targetIndex: 3,
    crop: false,
  },
];

export const getUnitPrice = (
  product: Product,
  cat: CategoryConfig,
  variant: string
) => {
  const opt =
    cat.variants.find((v) => v.value === variant) ?? cat.variants[0];
  return Math.round(product.price * opt.multiplier * 100) / 100;
};
