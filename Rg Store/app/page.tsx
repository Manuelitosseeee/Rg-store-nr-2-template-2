"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CATALOGO_INDEX,
  CONTATTI_BG,
  CONTATTI_INDEX,
  HOME_BG,
  NAV_ITEMS,
} from "@/lib/catalog";
import { CATALOGO_BG, EXTRAS } from "@/lib/extras";
import { CatalogoClassicoView } from "./extras";
import {
  CONTACT_DEFAULTS,
  buildCatalog,
  buildStaticCatalog,
  fetchCatalog,
  getUnitPrice,
} from "@/lib/supabaseCatalog";
import type { CatalogData } from "@/lib/supabaseCatalog";
import type {
  RuntimeCategory,
  RuntimeHomeCard,
  RuntimeProduct,
} from "@/lib/supabaseCatalog";

const GRAIN_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E`;

interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  src: string;
  variant: string;
  price: number;
  qty: number;
}

interface FlyState {
  src: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  active: boolean;
}

/* ------------------------------------------------------------------ */
/* Carosello 3D — layout identico per ogni categoria (come Nailuxe)    */
/* ------------------------------------------------------------------ */
interface ProductViewProps {
  cat: RuntimeCategory;
  activeIndex: number;
  getStyle: (index: number) => React.CSSProperties;
  animScale: number;
  /** Solo la sezione in vetrina monta il fumo: le altre restano senza,
   *  così il browser non anima 9 volute sfocate contemporaneamente. */
  showSmoke: boolean;
  selectedVariant: string;
  current: RuntimeProduct;
  displayPrice: number;
  oldPrice: number | null;
  height: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectVariant: (v: string) => void;
  qty: number;
  onChangeQty: (d: number) => void;
  onAdd: () => void;
}

function ProductView({
  cat,
  activeIndex,
  getStyle,
  animScale,
  showSmoke,
  selectedVariant,
  current,
  displayPrice,
  oldPrice,
  height,
  onPrev,
  onNext,
  onSelectVariant,
  qty,
  onChangeQty,
  onAdd,
}: ProductViewProps) {  const variantLabel = (v: string) => v;

  // I capi occupano un canvas quadrato già scontornato: nessun ritaglio,
  // resta solo la scala legata alla variante selezionata.
  const imgWrapperStyle = (index: number): React.CSSProperties => ({
    transform: index === activeIndex ? `scale(${animScale})` : "scale(1)",
    transformOrigin: "center center",
    transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
  });

  // Niente swipe su mobile: la selezione può cambiare SOLO con le frecce,
  // così nessun gesto accidentale (dito che scivola, tap storto) può
  // spostare l'oggetto da solo. Ogni tap su freccia = esattamente un passo.

  return (
    <div
      className="w-full relative flex items-center overflow-hidden"
      data-smoke="vortice"
      style={{ height }}
    >
      {/* Fumo sotto il capo: nebbia neutra illuminata dalla luce del
          dettaglio del prodotto (app/extras.css, selettori [data-smoke]).
          Vive solo nella sezione visibile. */}
      {showSmoke && (
        <div
          className="smoke"
          style={
            {
              "--smoke-c": current.accentHex,
              "--bg-c": current.bg,
            } as React.CSSProperties
          }
        >
          <div className="smoke-light" />
          <div className="smoke-core" />
          <div className="smoke-puff" />
          <div className="smoke-puff smoke-puff-2" />
          <div className="smoke-puff smoke-puff-3" />
        </div>
      )}

      {/* MOBILE */}
      <div className="md:hidden w-full h-full flex flex-col items-center relative z-40 px-5 pt-20 pb-20">
        {/* Altezza fissa: se il nome va a capo (1 o 2 righe) l'area del
            carosello NON si ridimensiona, altrimenti la selezione salta
            su/giù ad ogni cambio prodotto. */}
        <div className="h-[66px] w-full flex items-center justify-center">
          <h1 className="text-3xl font-black uppercase tracking-tight text-center font-anton leading-[1.05] line-clamp-2">
            {current.name}
          </h1>
        </div>

        <div className="relative w-full flex-1 min-h-[170px] flex items-center justify-center">
          {/* Watermark del brand dietro gli oggetti anche su mobile */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[26vw] font-black uppercase tracking-tighter font-anton text-white opacity-[0.05] leading-none">
              {cat.watermark}
            </span>
          </div>
          <div className="absolute inset-0 z-30 pointer-events-none">
            {cat.products.map((item, index) => (
              <div key={`m-${cat.id}-${item.id}`} style={getStyle(index)}>
                <div
                  className="w-full h-full relative"
                  style={imgWrapperStyle(index)}
                >
                  <img
                    src={item.src}
                    alt={item.name}
                    className={`w-full h-full object-contain ${
                      index === activeIndex && current.available === false
                        ? "opacity-35"
                        : ""
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-40">
            <button
              onClick={onPrev}
              aria-label="Precedente"
              className="clickable w-11 h-11 rounded-full border border-white/30 bg-black/20 backdrop-blur-md flex items-center justify-center"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-40">
            <button
              onClick={onNext}
              aria-label="Successivo"
              className="clickable w-11 h-11 rounded-full border border-white/30 bg-black/20 backdrop-blur-md flex items-center justify-center"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
          {current.available === false && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[35] flex items-center gap-2 rounded-full border border-white/25 bg-black/60 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              Esaurito
            </div>
          )}
        </div>

        <div className="relative z-40 w-full flex flex-col items-center gap-1">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {current.variants.map((opt) => {
              const unavailable = opt.available === false;
              return (
                <button
                  key={opt.value}
                  onClick={() => onSelectVariant(opt.value)}
                  disabled={unavailable}
                  title={unavailable ? "Esaurito" : undefined}
                  className={`clickable px-3.5 py-2 rounded-full border text-[11px] font-semibold uppercase tracking-wider transition-all ${
                    unavailable
                      ? "border-white/10 text-white/30 line-through decoration-white/30 opacity-60 cursor-not-allowed"
                      : selectedVariant === opt.value
                        ? "bg-white text-black border-white"
                        : "border-white/30 text-white/70 hover:text-white hover:border-white/60"
                  }`}
                >
                  {variantLabel(opt.value)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 border border-white/20 rounded-full px-3.5 py-1">
            <button
              onClick={() => onChangeQty(-1)}
              className="clickable text-white/70 hover:text-white text-xl leading-none"
            >
              -
            </button>
            <span className="text-base font-medium min-w-[22px] text-center">
              {qty}
            </span>
            <button
              onClick={() => onChangeQty(1)}
              className="clickable text-white/70 hover:text-white text-xl leading-none"
            >
              +
            </button>
          </div>

          <div className="text-center">
            <span className="flex items-baseline justify-center gap-2.5">
              {oldPrice !== null && (
                <span className="text-base sm:text-lg font-light text-white/45 line-through decoration-white/45">
                  €{oldPrice.toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-light">
                €{displayPrice.toFixed(2)}
              </span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/60">
              {cat.priceLabel(selectedVariant)}
            </span>
          </div>

          <button
            onClick={onAdd}
            className="clickable bg-white text-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 hover:bg-gray-100 transition-all shadow-xl flex items-center gap-3"
          >
            Aggiungi{" "}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:contents">
        <div className="absolute inset-x-0 top-[18%] flex justify-center pointer-events-none opacity-[0.06]">
          <span
            className="text-[18vw] font-black uppercase tracking-tighter font-anton"
            style={{ lineHeight: 1 }}
          >
            {cat.watermark}
          </span>
        </div>

        <div className="absolute inset-0 z-30 pointer-events-none">
          {cat.products.map((item, index) => (
            <div key={`d-${cat.id}-${item.id}`} style={getStyle(index)}>
              <div
                className="w-full h-full relative"
                style={imgWrapperStyle(index)}
              >
                <img
                  src={item.src}
                  alt={item.name}
                  className={`w-full h-full object-contain ${
                    index === activeIndex && current.available === false
                      ? "opacity-35"
                      : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="absolute left-6 sm:left-16 top-1/2 -translate-y-1/2 max-w-[240px] sm:max-w-[320px] z-40 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: current.accentHex }}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
              {current.subtitle}
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase leading-[0.9] mb-5 tracking-tight font-anton">
            {current.name}
          </h1>
          <div className="flex items-center gap-2.5 mb-8">
            {current.available === false ? (
              <>
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-red-400/40 bg-red-400/10">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#f87171"
                    strokeWidth="3.5"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-300/90">
                  Esaurito
                </span>
              </>
            ) : (
              <>
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                  Disponibile
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onPrev}
              aria-label="Precedente"
              className="clickable w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition backdrop-blur-md"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={onNext}
              aria-label="Successivo"
              className="clickable w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition backdrop-blur-md"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="absolute right-6 sm:right-16 bottom-10 sm:top-1/2 sm:-translate-y-1/2 flex flex-col items-end gap-5 z-40 text-white">
          <div className="flex items-center gap-2">
            {current.variants.map((opt) => {
              const unavailable = opt.available === false;
              return (
                <button
                  key={opt.value}
                  onClick={() => onSelectVariant(opt.value)}
                  disabled={unavailable}
                  title={unavailable ? "Esaurito" : undefined}
                  className={`clickable px-3 py-2 rounded-full border text-[10px] sm:text-xs font-semibold uppercase tracking-widest transition-all ${
                    unavailable
                      ? "border-white/10 text-white/30 line-through decoration-white/30 opacity-60 cursor-not-allowed"
                      : selectedVariant === opt.value
                        ? "bg-white text-black border-white"
                        : "border-white/30 text-white/70 hover:text-white hover:border-white/60"
                  }`}
                >
                  {variantLabel(opt.value)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 border border-white/20 rounded-full px-3 py-1.5">
            <button
              onClick={() => onChangeQty(-1)}
              className="clickable text-white/70 hover:text-white text-lg leading-none"
            >
              -
            </button>
            <span className="text-sm font-medium min-w-[20px] text-center">
              {qty}
            </span>
            <button
              onClick={() => onChangeQty(1)}
              className="clickable text-white/70 hover:text-white text-lg leading-none"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <span className="flex items-baseline justify-end gap-2.5">
              {oldPrice !== null && (
                <span className="text-2xl font-light text-white/45 line-through decoration-white/45">
                  €{oldPrice.toFixed(2)}
                </span>
              )}
              <span className="text-3xl sm:text-4xl font-light">
                €{displayPrice.toFixed(2)}
              </span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/60">
              {cat.priceLabel(selectedVariant)}
            </span>
          </div>

          <button
            onClick={onAdd}
            className="clickable bg-white text-black px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 hover:bg-gray-100 transition-all shadow-xl flex items-center gap-3"
          >
            Aggiungi{" "}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          {current.available === false && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[45] flex items-center gap-2 rounded-full border border-white/25 bg-black/60 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              Esaurito
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home — landing page: logo del brand nello sfondo + le 3 categorie    */
/* ------------------------------------------------------------------ */
function HomeCard({
  cat,
  size,
  onSelect,
}: {
  cat: RuntimeHomeCard;
  size: "center" | "side";
  onSelect: (index: number) => void;
}) {
  const isCenter = size === "center";
  return (
    <button
      onClick={() => onSelect(cat.targetIndex)}
      aria-label={`Vai alla categoria ${cat.title}`}
      className="clickable group flex flex-col items-center gap-2 md:gap-5 transition-transform duration-300 active:scale-95"
    >
      {/* Immagine: hover = l'oggetto si allarga, click = press come i tasti.
          Su mobile la selezione è verticale, su desktop orizzontale e
          MOLTO grande (quasi tutta l'altezza dello schermo). */}
      <div
        className={`relative flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1.5 ${
          isCenter
            ? "w-[min(90vw,430px)] h-[clamp(110px,22vh,210px)] md:w-[clamp(330px,38vw,700px)] md:h-[clamp(220px,50vh,540px)]"
            : "w-[min(64vw,300px)] h-[clamp(88px,16vh,150px)] md:w-[clamp(220px,24vw,460px)] md:h-[clamp(220px,44vh,480px)]"
        }`}
      >
        {cat.crop ? (
          // Profumi: canvas orizzontale con la bottiglia al centro →
          // riempiamo l'altezza e tagliamo i lati vuoti (come nel carosello).
          <img
            src={cat.src}
            alt={cat.title}
            className="absolute left-1/2 top-1/2 h-full w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        ) : (
          <img
            src={cat.src}
            alt={cat.title}
            className="h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
          />
        )}
      </div>
      {/* Nome categoria: hover = la scritta si schiarisce */}
      <span
        className={`font-anton uppercase tracking-wide leading-none transition-colors duration-300 ${
          isCenter
            ? "text-white/75 group-hover:text-white text-2xl md:text-7xl"
            : "text-white/50 group-hover:text-white text-lg md:text-4xl"
        }`}
      >
        {cat.title}
      </span>
    </button>
  );
}

function HomeView({
  height,
  cards,
  onSelect,
}: {
  height: number;
  cards: RuntimeHomeCard[];
  onSelect: (index: number) => void;
}) {
  // La card centrale è quella in mezzo alla lista ordinata dall'admin
  // (in origine: SCARPE). Le altre diventano le card laterali.
  const centerId = cards[Math.floor(cards.length / 2)]?.id;
  return (
    <div
      className="w-full relative flex flex-col items-center justify-center overflow-hidden"
      style={{ height }}
    >
      {/* Logo Vintage Club Studio nello sfondo, stesso font della scritta
          dietro i prodotti */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
        <span
          className="font-anton font-black uppercase tracking-tighter text-white leading-none opacity-[0.07] text-center"
          style={{ fontSize: "clamp(34px, 11vw, 132px)" }}
        >
          Vintage Club
          <br />
          Studio
        </span>
      </div>

      {/* MOBILE — selezione verticale: la card centrale sta in mezzo,
          le altre sopra e sotto (l'ordine è quello impostato dall'admin) */}
      <div className="md:hidden relative z-30 flex flex-col items-center justify-center gap-[clamp(8px,1.6vh,18px)] w-full px-6">
        {cards.map((cat) => (
          <HomeCard
            key={cat.id}
            cat={cat}
            size={cat.id === centerId ? "center" : "side"}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* DESKTOP — una centrale più grande, due laterali della STESSA
          larghezza: così la selezione resta perfettamente centrata */}
      <div className="hidden md:flex relative z-30 items-end justify-center md:gap-[clamp(16px,3vw,70px)] px-6 md:px-8">
        {cards.map((cat) => (
          <HomeCard
            key={cat.id}
            cat={cat}
            size={cat.id === centerId ? "center" : "side"}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Contatti — sotto al centro, con bordo leggero da pulsante */}
      <button
        onClick={() => onSelect(CONTATTI_INDEX)}
        className="clickable group relative z-30 mt-6 md:mt-12 flex items-center gap-3 rounded-full border border-white/25 bg-white/5 px-6 py-2.5 md:px-8 md:py-3 text-white/70 hover:text-white hover:border-white/60 hover:bg-white/10 transition-all duration-300 active:scale-95"
      >
        <span className="text-[11px] sm:text-xs md:text-sm uppercase font-semibold tracking-[0.3em]">
          Contatti
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App principale                                                      */
/* ------------------------------------------------------------------ */
export default function Page() {
  const [viewIndex, setViewIndex] = useState(0); // home all'avvio
  const [activeByCat, setActiveByCat] = useState<Record<string, number>>({
    maglie: 0,
    completi: 0,
    pantaloni: 0,
  });
  const [settledByCat, setSettledByCat] = useState<Record<string, number>>({
    maglie: 0,
    completi: 0,
    pantaloni: 0,
  });
  const [isAnimating, setIsAnimating] = useState(false);
  // Blocco sincrono: impedisce che due navigazioni consecutive partano nello
  // stesso istante (es. swipe + click sintetico sul pulsante) e spostino la
  // selezione di due prodotti invece di uno.
  const animLockRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  // Altezza viewport in px (non dvh): evita i salti quando la barra del
  // browser mobile si apre/chiude durante lo scroll.
  const [viewportH, setViewportH] = useState(800);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartBump, setCartBump] = useState(false);
  const [flyState, setFlyState] = useState<FlyState | null>(null);
  const [checkoutHover, setCheckoutHover] = useState(false);
  const [selectedVar, setSelectedVar] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [animScale, setAnimScale] = useState(1);
  const animTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartIconRef = useRef<HTMLButtonElement>(null);
  // Cursore personalizzato: spostato scrivendo direttamente nel DOM, così
  // il movimento del mouse non ridisegna più tutta la pagina.
  const cursorRef = useRef<HTMLDivElement | null>(null);
  // Quantità e taglia correnti lette da addToCart tramite ref: la funzione
  // resta stabile e il catalogo non si ridisegna ad ogni clic.
  const qtyRef = useRef(qty);
  const selectedVarRef = useRef(selectedVar);
  // Barra di navigazione mobile: con la voce in più del Catalogo le voci
  // non ci stanno tutte, quindi porto in vista quella attiva.
  const mobileNavRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = mobileNavRef.current?.querySelector(
      '[data-nav-active="true"]'
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [viewIndex]);

  useEffect(() => {
    qtyRef.current = qty;
  }, [qty]);

  useEffect(() => {
    selectedVarRef.current = selectedVar;
  }, [selectedVar]);

  // Catalogo: dal database se configurato, altrimenti statico
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCatalog().then((data) => {
      if (!cancelled) setCatalogData(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { categories, homeCards, contacts } = useMemo(() => {
    if (catalogData && catalogData.categories.length > 0) {
      return buildCatalog(catalogData);
    }
    return buildStaticCatalog();
  }, [catalogData]);
  const contact = contacts ?? CONTACT_DEFAULTS;

  // Misura l'altezza PRIMA del primo paint (useLayoutEffect): evita il
  // frame iniziale spostato (default 800px) che si "riassesta" dopo ~1s.
  useLayoutEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 768);
      setViewportH(window.innerHeight);
    };
    update();
    window.scrollTo(0, 0);
    const handleResize = () => update();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Nessuno stato React qui dentro: spostare il cursore costava un
    // re-render completo della pagina ad ogni pixel di movimento.
    const moveCursor = (e: MouseEvent) => {
      const el = cursorRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };
    const handleHover = (e: MouseEvent) => {
      const el = cursorRef.current;
      if (!el) return;
      const target = (e.target as Element).closest(
        'button, a, input, [role="button"], .clickable'
      );
      el.classList.toggle("hovering", !!target);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleHover);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleHover);
    };
  }, []);

  const navigateCarousel = useCallback(
    (catId: string, direction: number) => {
      if (isAnimating || animLockRef.current) return;
      animLockRef.current = true;
      setIsAnimating(true);
      const cat = categories.find((c) => c.id === catId);
      if (!cat) return;
      const cur = activeByCat[catId] ?? 0;
      const next =
        (cur + direction + cat.products.length) % cat.products.length;
      setActiveByCat((prev) => ({ ...prev, [catId]: next }));
      setTimeout(
        () => setSettledByCat((prev) => ({ ...prev, [catId]: next })),
        650
      );
      setTimeout(() => {
        animLockRef.current = false;
        setIsAnimating(false);
      }, 650);
    },
    [isAnimating, activeByCat, categories]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCartOpen) return;
      // Home (0) e Contatti (4) non hanno carosello: le frecce navigano
      // solo nelle sezioni prodotto (1, 2, 3).
      const cat = categories[viewIndex - 1];
      if (!cat) return;
      if (e.key === "ArrowRight") navigateCarousel(cat.id, 1);
      if (e.key === "ArrowLeft") navigateCarousel(cat.id, -1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateCarousel, isCartOpen, viewIndex]);

  const resolveVariant = (product: RuntimeProduct): string => {
    const sel = selectedVar[product.id];
    const match = product.variants.find((v) => v.value === sel);
    if (match && match.available !== false) return match.value;
    return (
      product.variants.find((v) => v.available !== false)?.value ??
      product.variants[0]?.value ??
      ""
    );
  };

  const selectVariant = (productId: string, value: string) => {
    setSelectedVar((prev) => ({ ...prev, [productId]: value }));
    // Profumi: scala di ingrandimento legata al formato scelto
    const product = categories
      .flatMap((c) => c.products)
      .find((p) => p.id === productId);
    if (!product) return;
    const opt = product.variants.find((v) => v.value === value);
    if (!opt) return;
    if (animTimeout.current) clearTimeout(animTimeout.current);
    if (opt.scale === 1) {
      setAnimScale(1);
    } else {
      setAnimScale(opt.scale + 0.12);
      animTimeout.current = setTimeout(() => setAnimScale(opt.scale), 220);
    }
  };

  const changeQty = (delta: number) =>
    setQty((prev) => Math.max(1, prev + delta));

  // Identità stabile (deps vuote): il catalogo memoizzato non si ridisegna
  // quando cambiano quantità, taglia o carrello.
  const addToCart = useCallback((_cat: RuntimeCategory, product: RuntimeProduct) => {
    const cartIcon = cartIconRef.current;
    if (!cartIcon) return;
    const cartRect = cartIcon.getBoundingClientRect();
    const selected = selectedVarRef.current[product.id];
    const match = product.variants.find((v) => v.value === selected);
    const variant =
      match && match.available !== false
        ? match.value
        : product.variants.find((v) => v.available !== false)?.value ??
          product.variants[0]?.value ??
          "";
    const unitPrice = getUnitPrice(product, variant);
    const itemId = `${product.id}-${variant}`;
    const count = qtyRef.current;

    setFlyState({
      src: product.src,
      startX: window.innerWidth / 2,
      startY: window.innerHeight / 2,
      endX: cartRect.left + cartRect.width / 2,
      endY: cartRect.top + cartRect.height / 2,
      active: false,
    });

    setTimeout(
      () => setFlyState((prev) => (prev ? { ...prev, active: true } : null)),
      50
    );

    setTimeout(() => {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === itemId);
        if (existing) {
          return prev.map((item) =>
            item.id === itemId ? { ...item, qty: item.qty + count } : item
          );
        }
        return [
          ...prev,
          {
            id: itemId,
            name: product.name,
            subtitle: product.subtitle,
            src: product.src,
            variant,
            price: unitPrice,
            qty: count,
          },
        ];
      });
      setFlyState(null);
      setCartBump(true);
      setTimeout(() => setCartBump(false), 350);
    }, 650);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((x): x is CartItem => x !== null)
    );
  };

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  // LAYOUT FLUTTUANTE 3D — come Nailuxe
  const getCarouselStyle = (
    cat: RuntimeCategory,
    index: number
  ): React.CSSProperties => {
    const len = cat.products.length;
    const activeIndex = activeByCat[cat.id] ?? 0;
    const settledIndex = settledByCat[cat.id] ?? 0;
    const isCenter = index === activeIndex;
    const isLeft = index === (activeIndex + len - 1) % len;
    const isRight = index === (activeIndex + 1) % len;
    const settledCenter = index === settledIndex;

    const w = isMobile ? cat.mobileBoxW : cat.boxW;
    const h = isMobile ? cat.mobileBoxH : cat.boxH;
    // Mobile: oggetto centrale sempre grande, proporzionato all'altezza
    // disponibile dello schermo (mai in sovrapposizione con i controlli).
    const centerScale = isMobile
      ? Math.max(0.65, Math.min(1.5, (viewportH - 320) / h))
      : cat.centerScale;

    let transform = "translate(-50%, -50%) scale(0.7)";
    let opacity = 0;
    let zIndex = 2;
    let left = "50%";
    let top = "50%";
    let shadow = "drop-shadow(0 10px 15px rgba(0,0,0,0.4))";
    let blur = "blur(10px)";
    let filter: string;

    if (isCenter) {
      transform = `translate(-50%, -50%) scale(${centerScale})`;
      opacity = 1;
      zIndex = 25;
      left = "50%";
      shadow = "drop-shadow(0 35px 50px rgba(0,0,0,0.65))";
      blur = "blur(0px)";
      // Su mobile il centro resta senza filter: i filtri su PNG trasparenti
      // molto ingranditi rendono lo sfondo bianco su WebKit/iOS.
      filter = isMobile ? "none" : `${blur} ${shadow}`;
    } else if (isLeft) {
      transform = isMobile
        ? "translate(-50%, -50%) scale(0.75)"
        : "translate(-50%, -50%) scale(1.0)";
      opacity = isMobile ? 0.45 : 0.85;
      zIndex = 14;
      left = isMobile ? "8%" : "20%";
      shadow = "drop-shadow(0 15px 25px rgba(0,0,0,0.4))";
      blur = settledCenter ? "blur(0px)" : "blur(3.5px)";
      // Su mobile i laterali sono sfocati per non rubare attenzione al centro
      // (senza drop-shadow, evita lo sfondo bianco su WebKit).
      filter = isMobile ? "blur(4px)" : `${blur} ${shadow}`;
    } else if (isRight) {
      transform = isMobile
        ? "translate(-50%, -50%) scale(0.75)"
        : "translate(-50%, -50%) scale(1.0)";
      opacity = isMobile ? 0.45 : 0.85;
      zIndex = 14;
      left = isMobile ? "92%" : "80%";
      shadow = "drop-shadow(0 15px 25px rgba(0,0,0,0.4))";
      blur = settledCenter ? "blur(0px)" : "blur(3.5px)";
      filter = isMobile ? "blur(4px)" : `${blur} ${shadow}`;
    } else {
      filter = isMobile ? "none" : `${blur} ${shadow}`;
    }

    return {
      position: "absolute",
      top,
      left,
      width: `${w}px`,
      height: `${h}px`,
      transform,
      filter,
      opacity,
      zIndex,
      transition:
        "left 650ms cubic-bezier(0.4, 0, 0.2, 1), transform 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 650ms cubic-bezier(0.4, 0, 0.2, 1), filter 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      pointerEvents: "none",
    };
  };

  const currentProduct =
    viewIndex >= 1 && viewIndex <= categories.length
      ? categories[viewIndex - 1].products[
          activeByCat[categories[viewIndex - 1].id] ?? 0
        ]
      : undefined;

  const currentBg =
    viewIndex === CONTATTI_INDEX
      ? CONTATTI_BG
      : viewIndex === 0
        ? HOME_BG
        : viewIndex === CATALOGO_INDEX
          ? CATALOGO_BG
          : currentProduct?.bg ?? HOME_BG;

  return (
    <div
      className="w-full overflow-hidden relative site-enter"
      style={
        {
          backgroundColor: currentBg,
          transition: "background-color 0.8s ease",
          height: viewportH,
        } as React.CSSProperties
      }
    >
      {/* Sfondo del capo: lastra centrale più chiara, venature di marmo e
          velo ai bordi (il fondo cambia con il prodotto e non è mai piatto) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-depth"
        style={{ "--bg-c": currentBg } as React.CSSProperties}
      />
      <div className="bg-marble z-0">
        <span className="bg-vein bg-vein-a" />
        <span className="bg-vein bg-vein-b" />
        <span className="bg-vein bg-vein-c" />
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-scrim" />

      {!isMobile && <div ref={cursorRef} className="custom-cursor" />}

      {flyState && (
        <div
          className="fixed z-[99999] pointer-events-none"
          style={{
            left: flyState.active ? flyState.endX : flyState.startX,
            top: flyState.active ? flyState.endY : flyState.startY,
            transform: flyState.active
              ? "translate(-50%, -50%) scale(0.05) rotate(25deg)"
              : "translate(-50%, -50%) scale(1.8) rotate(0deg)",
            opacity: flyState.active ? 0.3 : 1,
            transition: "all 600ms cubic-bezier(0.5, 0, 0.2, 1)",
          }}
        >
          <img
            src={flyState.src}
            alt=""
            className="w-32 h-48 sm:w-48 sm:h-72 object-contain sm:drop-shadow-2xl"
          />
        </div>
      )}

      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-30"
        style={{ backgroundImage: `url("${GRAIN_SVG}")` }}
      />

      <header className="absolute top-0 left-0 right-0 px-4 sm:px-12 pb-3 pt-safe sm:pb-6 flex items-center justify-between z-50">
        <div
          onClick={() => setViewIndex(0)}
          className="clickable text-white tracking-tight flex items-center gap-3"
        >
          <img
            src="/vintage/logo.jpeg"
            alt="Vintage Club Studio"
            className="h-8 w-8 sm:h-11 sm:w-11 rounded-full object-cover"
          />
          <span
            className="text-base sm:text-2xl font-normal font-playfair"
            style={{ letterSpacing: "-0.02em" }}
          >
            Vintage Club Studio
          </span>
        </div>

        <nav className="flex items-center gap-1.5 sm:gap-6">
          {/* Con la voce extra "Catalogo Classico" il menu può diventare
              lungo: su schermi stretti scorre invece di rompere l'header */}
          <div className="hidden sm:flex items-center max-w-[60vw] overflow-x-auto no-scrollbar bg-black/20 backdrop-blur-md border border-white/10 rounded-full p-1 sm:p-1.5">
            {NAV_ITEMS.map((n) => (
              <button
                key={n.id}
                onClick={() => setViewIndex(n.index)}
                className={`clickable whitespace-nowrap px-1.5 py-2 sm:px-5 sm:py-2 rounded-full text-[8px] sm:text-xs font-semibold uppercase tracking-wide sm:tracking-widest transition-all duration-300 ${
                  viewIndex === n.index
                    ? "bg-white text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>

          <button
            ref={cartIconRef}
            onClick={() => setIsCartOpen(true)}
            className="clickable relative p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all text-white"
            aria-label="Apri carrello"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItems > 0 && (
              <span
                className={`absolute -top-1 -right-1 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                  cartBump
                    ? "scale-[1.6] bg-amber-300 text-black shadow-lg"
                    : "scale-100 bg-white text-black"
                }`}
              >
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </header>

      {/* Navigazione mobile — barra in basso (Home + categorie + Contatti),
          scrollabile se lo schermo è stretto */}
      <div className="sm:hidden fixed bottom-3 left-1/2 z-[60] w-[96vw] max-w-[420px] -translate-x-1/2">
        <div
          ref={mobileNavRef}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-full border border-white/15 bg-black/50 p-1.5 backdrop-blur-md"
        >
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              onClick={() => setViewIndex(n.index)}
              data-nav-active={viewIndex === n.index}
              className={`clickable whitespace-nowrap px-2.5 py-2 rounded-full text-[9px] font-semibold uppercase tracking-wide transition-all duration-300 ${
                viewIndex === n.index
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenitore verticale: Home → categorie → (Catalogo Classico) → Contatti */}
      <div
        className="w-full absolute top-0 left-0 flex flex-col z-20"
        style={{
          height: viewportH * NAV_ITEMS.length,
          transform: `translateY(-${viewIndex * viewportH}px)`,
          transition: "transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)",
        }}
      >
        <HomeView height={viewportH} cards={homeCards} onSelect={setViewIndex} />
        {categories.map((cat, catIndex) => {
          const activeIndex = activeByCat[cat.id] ?? 0;
          const current = cat.products[activeIndex];
          if (!current) return null;
          const variant = resolveVariant(current);
          // Sconto: un moltiplicatore < 1 (es. 0.9) mostra sul sito il prezzo
          // originale (base) barrato accanto al prezzo scontato più grande.
          const opt = current.variants.find((v) => v.value === variant);
          const showOld =
            !!opt && Number(opt.multiplier) < 1 && current.price > 0;
          return (
            <ProductView
              key={cat.id}
              cat={cat}
              activeIndex={activeIndex}
              height={viewportH}
              getStyle={(i) => getCarouselStyle(cat, i)}
              animScale={animScale}
              showSmoke={viewIndex === catIndex + 1}
              selectedVariant={variant}
              current={current}
              displayPrice={getUnitPrice(current, variant)}
              oldPrice={
                showOld ? Math.round(current.price * 100) / 100 : null
              }
              onPrev={() => navigateCarousel(cat.id, -1)}
              onNext={() => navigateCarousel(cat.id, 1)}
              onSelectVariant={(v) => selectVariant(current.id, v)}
              qty={qty}
              onChangeQty={changeQty}
              onAdd={() => addToCart(cat, current)}
            />
          );
        })}

        {/* CATALOGO CLASSICO — sezione temporanea (app/extras.tsx) */}
        {EXTRAS.catalogoClassico && (
          <CatalogoClassicoView
            categories={categories}
            height={viewportH}
            onAdd={addToCart}
          />
        )}

        {/* SEZIONE CONTATTI */}
        <div
          className="w-full relative flex items-start md:items-center justify-center px-6 sm:px-12 pt-24 md:pt-0 pb-28 md:pb-0 z-30 overflow-y-auto md:overflow-hidden"
          style={{ height: viewportH }}
        >
          <div className="max-w-[1000px] w-full flex flex-col md:flex-row items-center gap-5 sm:gap-20">
            <div className="flex-1 text-white space-y-4">
              <h2 className="text-3xl sm:text-5xl font-normal leading-tight font-playfair">
                {contact.title}
              </h2>
              <p className="text-sm text-white/70 font-light leading-relaxed max-w-sm">
                {contact.description}
              </p>
              <div className="pt-2 space-y-2.5">
                {contact.email && (
                  <p className="text-xs uppercase tracking-widest text-white/90">
                    <a
                      href={`mailto:${contact.email}`}
                      className="clickable hover:text-amber-300 transition-colors"
                    >
                      {contact.email}
                    </a>
                  </p>
                )}
                {contact.whatsapp_number && (
                  <p className="text-xs uppercase tracking-widest text-white/90">
                    <a
                      href={`https://wa.me/${contact.whatsapp_number}`}
                      target="_blank"
                      rel="noreferrer"
                      className="clickable hover:text-amber-300 transition-colors"
                    >
                      WhatsApp {contact.whatsapp_display}
                    </a>
                  </p>
                )}
                {contact.instagram && (
                  <p className="text-xs uppercase tracking-widest text-white/90">
                    <a
                      href={`https://instagram.com/${contact.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="clickable hover:text-amber-300 transition-colors"
                    >
                      Instagram {contact.instagram}
                    </a>
                  </p>
                )}
                {contact.address && (
                  <p className="text-xs uppercase tracking-widest text-white/90">
                    {contact.address}
                  </p>
                )}
              </div>
              {contact.whatsapp_number && (
                <a
                  href={`https://wa.me/${contact.whatsapp_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="clickable mt-8 inline-block border-b border-white/40 pb-1 text-xs uppercase tracking-widest hover:text-amber-300 hover:border-amber-300 transition-colors"
                >
                  {contact.cta_label || "Scrivici su WhatsApp"}
                </a>
              )}
            </div>
            <div className="flex-1 w-full h-[180px] sm:h-[450px] relative">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-[#1a1a1a]">
                <iframe
                  src={contact.maps_embed_url}
                  className="w-full h-full border-0 filter saturate-[0.8] opacity-80 hover:opacity-100 transition-opacity"
                  loading="lazy"
                  allowFullScreen
                  title="Vintage Club Studio Mappa"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DRAWER CARRELLO */}
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Il velo prende il blur solo quando è aperto: da chiuso resta
            invisibile senza costare un backdrop-filter a tutto schermo. */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-500 pointer-events-auto ${
            isCartOpen
              ? "opacity-100 backdrop-blur-sm"
              : "opacity-0 !pointer-events-none"
          }`}
          onClick={() => setIsCartOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-[#0a0a0c] border-l border-white/10 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] pointer-events-auto flex flex-col ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
              Carrello ({totalItems})
            </h3>
            <button
              onClick={() => setIsCartOpen(false)}
              className="clickable text-white/50 hover:text-white transition"
              aria-label="Chiudi carrello"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <p className="text-white/40 text-sm font-light text-center mt-10">
                Il tuo carrello è vuoto.
              </p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-white/5 rounded-lg p-2 flex items-center justify-center">
                    <img
                      src={item.src}
                      alt={item.name}
                      className="max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-white">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-white/50 mb-2">
                      {item.subtitle} · {item.variant}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light">
                        €{item.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-3 border border-white/20 rounded-full px-3 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="clickable text-white/60 hover:text-white"
                          aria-label="Diminuisci quantità"
                        >
                          -
                        </button>
                        <span className="text-xs">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="clickable text-white/60 hover:text-white"
                          aria-label="Aumenta quantità"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#0a0a0c]">
              <div className="flex justify-between text-white mb-6">
                <span className="text-sm font-light">Subtotale</span>
                <span className="text-lg font-medium">
                  €{subtotal.toFixed(2)}
                </span>
              </div>
              <button
                onMouseEnter={() => setCheckoutHover(true)}
                onMouseLeave={() => setCheckoutHover(false)}
                onTouchStart={() => setCheckoutHover(true)}
                onTouchEnd={() => setCheckoutHover(false)}
                className={`clickable w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  checkoutHover
                    ? "bg-gray-300 text-black"
                    : "bg-white text-black hover:scale-[1.02]"
                }`}
              >
                {checkoutHover ? "In arrivo" : "Procedi al Checkout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}