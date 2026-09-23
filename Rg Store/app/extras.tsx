"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  buildClassicCatalog,
  type CatalogEntry,
} from "@/lib/extras";
import { getOriginalPrice, getUnitPrice } from "@/lib/supabaseCatalog";
import type { RuntimeCategory, RuntimeProduct } from "@/lib/supabaseCatalog";
import "./extras.css";

/* ==================================================================== */
/* TEMPORANEO — Catalogo Classico (design Noir Éditorial) con scheda     */
/* prodotto ingrandita.                                                  */
/* Per rimuovere tutto: vedi EXTRAS-TEMPORANEE.md                        */
/* ==================================================================== */

const priceOf = (product: RuntimeProduct) =>
  getUnitPrice(product, product.variants[0]?.value ?? "");

// Prezzo pieno (se il prodotto è scontato) da mostrare barrato.
const oldPriceOf = (product: RuntimeProduct) =>
  getOriginalPrice(product, product.variants[0]?.value ?? "");

/* ------------------------------------------------------------------ */
/* Catalogo classico vero e proprio                                    */
/* ------------------------------------------------------------------ */
const CatalogCard = memo(function CatalogCard({
  entry,
  cat,
  onOpen,
  onAdd,
}: {
  entry: CatalogEntry;
  cat: RuntimeCategory | null;
  onOpen: (entry: CatalogEntry, cat: RuntimeCategory | null) => void;
  onAdd: (entry: CatalogEntry, cat: RuntimeCategory | null) => void;
}) {
  return (
    <article className="ct-card">
      {/* L'immagine si clicca: si apre la scheda con descrizione e prezzo */}
      <div
        className="ct-media"
        role="button"
        tabIndex={0}
        aria-label={`Ingrandisci ${entry.name}`}
        onClick={() => onOpen(entry, cat)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(entry, cat);
          }
        }}
      >
        <img src={entry.product.src} alt={entry.name} loading="lazy" decoding="async" />
        <span className="ct-media-hint">Ingrandisci</span>
      </div>
      <div className="ct-body">
        <h4 className="ct-name">{entry.name}</h4>
        {entry.product.subtitle ? (
          <p className="ct-sub">{entry.product.subtitle}</p>
        ) : null}
        <div className="ct-foot">
          <span className="ct-price">
            {oldPriceOf(entry.product) !== null && (
              <s className="ct-price-old">€{oldPriceOf(entry.product)!.toFixed(2)}</s>
            )}
            €{priceOf(entry.product).toFixed(2)}
          </span>
          <button
            type="button"
            className="ct-btn clickable"
            onClick={() => onAdd(entry, cat)}
            aria-label={`Aggiungi ${entry.name} al carrello`}
          >
            Aggiungi
          </button>
        </div>
      </div>
    </article>
  );
});

/* ------------------------------------------------------------------ */
/* Scheda ingrandita: immagine grande, descrizione, prezzo, Aggiungi    */
/* ------------------------------------------------------------------ */
function CatalogModal({
  entry,
  onAdd,
  onClose,
}: {
  entry: CatalogEntry;
  onAdd: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ct-modal" role="dialog" aria-modal="true">
      <div className="ct-modal-bg" onClick={onClose} />
      <div className="ct-modal-card">
        <button
          type="button"
          className="ct-modal-close clickable"
          onClick={onClose}
          aria-label="Chiudi"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="ct-modal-media">
          <img src={entry.product.src} alt={entry.name} />
        </div>

        <div className="ct-modal-info">
          <p className="ct-modal-eyebrow">
            {entry.product.subtitle ? entry.product.subtitle : "Vintage Club Studio"}
          </p>
          <h3 className="ct-modal-name">{entry.name}</h3>
          <p className="ct-modal-desc">
            {entry.product.description ||
              "Capo vintage della selezione Vintage Club Studio."}
          </p>
          <div className="ct-modal-row">
            <span className="ct-modal-price">
              {oldPriceOf(entry.product) !== null && (
                <s className="ct-price-old">€{oldPriceOf(entry.product)!.toFixed(2)}</s>
              )}
              €{priceOf(entry.product).toFixed(2)}
            </span>
            <button
              type="button"
              className="ct-btn clickable"
              onClick={() => {
                onAdd();
                onClose();
              }}
            >
              Aggiungi al carrello
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CatalogoClassicoView = memo(function CatalogoClassicoView({
  categories,
  height,
  onAdd,
}: {
  categories: RuntimeCategory[];
  height: number;
  onAdd: (cat: RuntimeCategory, product: RuntimeProduct) => void;
}) {
  const groups = useMemo(() => buildClassicCatalog(categories), [categories]);
  const [open, setOpen] = useState<{
    entry: CatalogEntry;
    cat: RuntimeCategory | null;
  } | null>(null);

  const openEntry = useCallback(
    (entry: CatalogEntry, cat: RuntimeCategory | null) =>
      setOpen({ entry, cat }),
    []
  );
  const closeEntry = useCallback(() => setOpen(null), []);

  const addEntry = useCallback(
    (entry: CatalogEntry, cat: RuntimeCategory | null) => {
      if (!cat) return;
      onAdd(cat, { ...entry.product, id: entry.id, name: entry.name });
    },
    [onAdd]
  );

  return (
    <div className="ct-root" style={{ height }}>
      <div className="ct-veins">
        <span className="ct-vein ct-vein-a" />
        <span className="ct-vein ct-vein-b" />
        <span className="ct-vein ct-vein-c" />
      </div>

      <div className="ct-shell">
        <header className="ct-top">
          <div>
            <p className="ct-eyebrow">Vintage Club Studio</p>
            <h2 className="ct-heading">Catalogo Classico</h2>
          </div>
          <div className="ct-actions">
            <span className="ct-eyebrow">
              {groups.reduce((n, g) => n + g.entries.length, 0)} capi · tocca un
              capo per ingrandirlo
            </span>
          </div>
        </header>

        <div className="ct-scroll no-scrollbar">
          {groups.map((group) => {
            const cat = categories.find((c) => c.id === group.id) ?? null;
            return (
              <section key={group.id} className="ct-group">
                <h3 className="ct-group-title">{group.label}</h3>
                <div className="ct-grid">
                  {group.entries.map((entry) => (
                    <CatalogCard
                      key={entry.id}
                      entry={entry}
                      cat={cat}
                      onOpen={openEntry}
                      onAdd={addEntry}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {open && (
        <CatalogModal
          entry={open.entry}
          onAdd={() => addEntry(open.entry, open.cat)}
          onClose={closeEntry}
        />
      )}
    </div>
  );
});


