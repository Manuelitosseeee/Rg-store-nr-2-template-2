export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  src: string;
  bg: string;
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

const img = (file: string) => `/store/${file}.png`;

const scarpe: Product[] = [
  {
    id: "aj4-black-cat",
    name: "Air Jordan 4 «Black Cat»",
    subtitle: "Stealth Leather",
    description:
      "Total black in pelle. Il look stealth, al massimo della pulizia.",
    price: 130,
    src: img("Air_Jordan_4_Black_Cat-removebg-preview"),
    bg: "#17171a",
    accentHex: "#8a8f98",
  },
  {
    id: "aj4-bred",
    name: "Air Jordan 4 «Bred»",
    subtitle: "Classic Black & Red",
    description:
      "Il classico black & red che ha scritto la storia delle Jordan.",
    price: 120,
    src: img("Air_Jordan_4_Bred-removebg-preview"),
    bg: "#3a1016",
    accentHex: "#e63946",
  },
  {
    id: "aj4-military-blue",
    name: "Air Jordan 4 «Military Blue»",
    subtitle: "Heritage Retro",
    description:
      "Blu militare su tomaia bianca: il ritorno di una leggenda del 1989.",
    price: 125,
    src: img("Air_Jordan_4_Military_Blue-removebg-preview"),
    bg: "#14263d",
    accentHex: "#457b9d",
  },
  {
    id: "aj4-lightning",
    name: "Air Jordan 4 «Retro Lightning»",
    subtitle: "Electric Yellow",
    description:
      "Giallo elettrico e dettagli neri: energia pura, da collezione.",
    price: 135,
    src: img("Air_Jordan_4_Retro_Lightning-removebg-preview"),
    bg: "#3d310f",
    accentHex: "#f4d03f",
  },
  {
    id: "aj4-white-cement",
    name: "Air Jordan 4 «White Cement»",
    subtitle: "OG 1989",
    description:
      "L'originale del 1989. Bianco, cemento e dettagli senza tempo.",
    price: 140,
    src: img("Air_Jordan_4_White_Cement-removebg-preview"),
    bg: "#23252b",
    accentHex: "#e8e6e1",
  },
];

const profumi: Product[] = [
  {
    id: "creed-aventus",
    name: "Creed Aventus",
    subtitle: "Eau de Parfum",
    description:
      "Ambra, muschio e bergamotto. Il profumo del successo.",
    price: 60,
    src: img("Creed_Aventus-removebg-preview"),
    bg: "#142b22",
    accentHex: "#2a9d8f",
  },
  {
    id: "gucci-guilty",
    name: "Gucci Guilty",
    subtitle: "Eau de Parfum",
    description: "Rosa, lavanda e cedro: audace e sensuale.",
    price: 65,
    src: img("Gucci_Guilty-removebg-preview"),
    bg: "#2b1526",
    accentHex: "#e76f51",
  },
  {
    id: "jpg-le-male-elixir",
    name: "Jean Paul Gaultier Le Male Elixir",
    subtitle: "Elixir Intense",
    description: "Vaniglia, miele e lavanda: magnetico e intenso.",
    price: 70,
    src: img("Jean_Paul_Gaultier_le_male_elixir-removebg-preview"),
    bg: "#1b2740",
    accentHex: "#6ba8d6",
  },
  {
    id: "tom-ford",
    name: "Tom Ford",
    subtitle: "Eau de Parfum",
    description: "Legni pregiati e note orientali: pura eleganza.",
    price: 75,
    src: img("Tom_Ford-removebg-preview"),
    bg: "#20160c",
    accentHex: "#c9a25e",
  },
  {
    id: "one-million",
    name: "One Million",
    subtitle: "Eau de Toilette",
    description: "Cuoio, cannella e ambra: ricco e inconfondibile.",
    price: 80,
    src: img("One_Million-removebg-preview"),
    bg: "#2e1d12",
    accentHex: "#d4af37",
  },
];

const cinture: Product[] = [
  {
    id: "lv-monogram",
    name: "Louis Vuitton Monogram",
    subtitle: "Monogram Canvas",
    description:
      "Tela monogram iconica e fibbia in metallo dorato.",
    price: 70,
    src: img("Louis_Vuitton_Monogram-removebg-preview"),
    bg: "#2b2413",
    accentHex: "#d4af37",
  },
  {
    id: "ferragamo-gancini",
    name: "Ferragamo Gancini",
    subtitle: "Gancini Leather",
    description:
      "Pelle pregiata e fibbia Gancini, il simbolo della maison.",
    price: 75,
    src: img("Ferragamo_Gancini-removebg-preview"),
    bg: "#261c12",
    accentHex: "#b08d57",
  },
  {
    id: "hermes-h",
    name: "Hermès H",
    subtitle: "H Buckle",
    description:
      "La fibbia «H» in metallo: sobria, elegante, eterna.",
    price: 80,
    src: img("Hermes_H-removebg-preview"),
    bg: "#1d2b21",
    accentHex: "#e07a5f",
  },
  {
    id: "versace-medusa",
    name: "Versace Medusa",
    subtitle: "Medusa Metal",
    description: "Medusa in rilievo: audacia e carattere.",
    price: 85,
    src: img("Versace_Medusa-removebg-preview"),
    bg: "#1f1424",
    accentHex: "#c0b283",
  },
  {
    id: "dior-oblique",
    name: "Dior Oblique",
    subtitle: "Oblique Jacquard",
    description:
      "Motivo Oblique ricamato: lusso discreto, stile puro.",
    price: 90,
    src: img("Dior_Oblique-removebg-preview"),
    bg: "#101926",
    accentHex: "#7f8ea3",
  },
];

const ML_VARIANTS: VariantOption[] = [
  { value: "15", multiplier: 1, scale: 1 },
  { value: "30", multiplier: 1.8, scale: 1.08 },
  { value: "50", multiplier: 2.8, scale: 1.18 },
];

const sizeVariants = (values: string[]): VariantOption[] =>
  values.map((v) => ({ value: v, multiplier: 1, scale: 1 }));

export const CATALOG: CategoryConfig[] = [
  {
    id: "cinture",
    label: "Cinture",
    watermark: "RG STORE",
    centerScale: 1.75,
    boxW: 340,
    boxH: 260,
    mobileBoxW: 230,
    mobileBoxH: 200,
    variantLabel: "Taglia (cm)",
    variants: sizeVariants(["85", "90", "95", "100", "105"]),
    priceLabel: (v) => `Taglia ${v} cm`,
    products: cinture,
  },
  {
    id: "scarpe",
    label: "Scarpe",
    watermark: "RG STORE",
    centerScale: 1.9,
    boxW: 320,
    boxH: 360,
    mobileBoxW: 250,
    mobileBoxH: 280,
    variantLabel: "Taglia",
    variants: sizeVariants(["40", "41", "42", "43", "44", "45"]),
    priceLabel: (v) => `Taglia ${v}`,
    products: scarpe,
  },
  {
    id: "profumi",
    label: "Profumi",
    watermark: "RG STORE",
    centerScale: 2.8,
    boxW: 280,
    boxH: 460,
    mobileBoxW: 230,
    mobileBoxH: 330,
    variantLabel: "Formato",
    variants: ML_VARIANTS,
    priceLabel: (v) => `Flacone ${v}ml`,
    products: profumi,
  },
];

export const NAV_ITEMS: { id: string; label: string; index: number }[] = [
  { id: "home", label: "Home", index: 0 },
  { id: "cinture", label: "Cinture", index: 1 },
  { id: "scarpe", label: "Scarpe", index: 2 },
  { id: "profumi", label: "Profumi", index: 3 },
  { id: "contatti", label: "Contatti", index: 4 },
];

export const CONTATTI_BG = "#101216";
export const HOME_BG = "#0d0f12";

export interface HomeCategory {
  id: string;
  label: string;
  src: string;
  targetIndex: number;
  // true = ritaglia i lati vuoti del canvas (profumi: bottiglia al centro
  // su canvas orizzontale molto largo), così l'oggetto si vede grande.
  crop: boolean;
}

// Le tre categorie mostrate nella sezione Home:
// centrale (SCARPE) più grande, laterali (CINTURE / PROFUMI) più piccole.
export const HOME_CATEGORIES: HomeCategory[] = [
  {
    id: "cinture",
    label: "CINTURE",
    src: img("Louis_Vuitton_Monogram-removebg-preview"),
    targetIndex: 1,
    crop: false,
  },
  {
    id: "scarpe",
    label: "SCARPE",
    src: img("Air_Jordan_4_White_Cement-removebg-preview"),
    targetIndex: 2,
    crop: false,
  },
  {
    id: "profumi",
    label: "PROFUMI",
    src: img("Creed_Aventus-removebg-preview"),
    targetIndex: 3,
    crop: true,
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