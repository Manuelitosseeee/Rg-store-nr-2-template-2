import type { RuntimeCategory, RuntimeProduct } from "@/lib/supabaseCatalog";

/* ------------------------------------------------------------------ */
/* TEMPORANEO — Funzionalità extra                                     */
/*                                                                     */
/* Tutto quello che è "di prova" (la sezione Catalogo Classico) vive   */
/* qui e nei file app/extras.tsx + app/extras.css.                      */
/*                                                                     */
/* Per TORNARE INDIETRO basta mettere a false gli interruttori qui      */
/* sotto: la sezione sparisce dal menu e dalla pagina, senza toccare    */
/* nient'altro. Per rimuovere del tutto i file, vedi                   */
/* EXTRAS-TEMPORANEE.md.                                                */
/* ------------------------------------------------------------------ */
export const EXTRAS = {
  catalogoClassico: true,
};

/** Colore di fondo della sezione Catalogo Classico (l'aspetto vero e
 *  proprio lo decide il design, che ora è fisso: Noir Éditorial). */
export const CATALOGO_BG = "#0a0a0b";

/* ------------------------------------------------------------------ */
/* CATALOGO CLASSICO                                                   */
/* Ogni prodotto viene ripetuto 3 volte: l'originale + 2 copie,        */
/* chiamate "… copia 2" e "… copia 3" come richiesto.                   */
/* ------------------------------------------------------------------ */
export interface CatalogEntry {
  id: string;
  name: string;
  product: RuntimeProduct;
}

export interface CatalogGroup {
  id: string;
  label: string;
  entries: CatalogEntry[];
}

export function buildClassicCatalog(
  categories: RuntimeCategory[],
  copies = 3
): CatalogGroup[] {
  return categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    entries: cat.products.flatMap((product) =>
      Array.from({ length: copies }, (_, i) => ({
        id: i === 0 ? product.id : `${product.id}-copia-${i + 1}`,
        name: i === 0 ? product.name : `${product.name} copia ${i + 1}`,
        product,
      }))
    ),
  }));
}
