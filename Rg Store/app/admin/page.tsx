"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  CategoryRow,
  ContactRow,
  HomeCardRow,
  ProductRow,
  VariantRow,
} from "@/lib/supabase";

type Tab = "home" | "cinture" | "scarpe" | "profumi" | "contatti";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "cinture", label: "Cinture" },
  { id: "scarpe", label: "Scarpe" },
  { id: "profumi", label: "Profumi" },
  { id: "contatti", label: "Contatti" },
];

const EMPTY_CONTACT: ContactRow = {
  id: 1,
  title: "",
  description: "",
  email: "",
  whatsapp_number: "",
  whatsapp_display: "",
  instagram: "",
  address: "",
  maps_embed_url: "",
  cta_label: "",
};

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/* ------------------------------------------------------------------ */
/* Piccoli componenti riutilizzabili                                   */
/* ------------------------------------------------------------------ */

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  placeholder = "",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
}) {
  const cls =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-300/60 transition-colors";
  return (
    <label className="block space-y-1.5">
      <span className="block text-[11px] uppercase tracking-widest text-white/50">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${cls} resize-y`}
        />
      ) : (
        <input
          type={type}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
  folder,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleFile = async (file: File | null) => {
    if (!file || !supabase) return;
    setUploading(true);
    setMsg("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("store")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("store").getPublicUrl(path);
      onChange(data.publicUrl);
      setMsg("Immagine caricata ✓");
    } catch (err) {
      setMsg(
        `Errore upload: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-[11px] uppercase tracking-widest text-white/50">
        {label}
      </span>
      {value && (
        <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <img src={value} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      )}
      <div className="flex gap-2">
        <label className="clickable inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors">
          {uploading ? "Caricamento…" : "Carica immagine"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…oppure incolla un URL"
          className="w-full min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-300/60 transition-colors"
        />
      </div>
      {msg && <p className="text-[11px] text-white/60">{msg}</p>}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`clickable flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs transition-colors ${
        checked
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          : "border-red-400/40 bg-red-400/10 text-red-300"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          checked ? "bg-emerald-400" : "bg-red-400"
        }`}
      />
      {label}: {checked ? "Disponibile" : "Esaurito"}
    </button>
  );
}

function SaveBar({
  saving,
  msg,
  onSave,
  onCancel,
  saveLabel = "Salva",
}: {
  saving: boolean;
  msg: string;
  onSave: () => void;
  onCancel?: () => void;
  saveLabel?: string;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        onClick={onSave}
        disabled={saving}
        className="clickable rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-amber-300 transition-colors disabled:opacity-50"
      >
        {saving ? "Salvataggio…" : saveLabel}
      </button>
      {onCancel && (
        <button
          onClick={onCancel}
          className="clickable rounded-full border border-white/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white hover:border-white/50 transition-colors"
        >
          Annulla
        </button>
      )}
      {msg && <p className="text-xs text-white/60">{msg}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) setError(error.message);
    else onLoggedIn();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] px-6">
      <form
        onSubmit={login}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8"
      >
        <div className="text-center">
          <h1 className="font-anton text-3xl uppercase tracking-wide text-white">
            Rg Store
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/40">
            Pannello Admin
          </p>
        </div>
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          type="email"
          placeholder="admin@rgstore.it"
        />
        <Field
          label="Password"
          value={password}
          onChange={setPassword}
          type="password"
          placeholder="••••••••"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          disabled={busy}
          className="clickable w-full rounded-full bg-white py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-amber-300 transition-colors disabled:opacity-50"
        >
          {busy ? "Accesso…" : "Entra"}
        </button>
        <a
          href="/"
          className="block text-center text-xs text-white/40 hover:text-white transition-colors"
        >
          ← Torna al sito
        </a>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home — card della landing (titolo + immagine)                       */
/* ------------------------------------------------------------------ */

function HomeTab({
  cards,
  categories,
  onChanged,
  onEditingChange,
}: {
  cards: HomeCardRow[];
  categories: CategoryRow[];
  onChanged: () => void;
  onEditingChange: (editing: boolean) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<HomeCardRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Blocca il cambio sezione mentre un editor è aperto
  useEffect(() => {
    onEditingChange(editingId !== null);
  }, [editingId, onEditingChange]);

  const startNew = () => {
    setDraft({
      id: newId("home"),
      title: "",
      image_url: "",
      target_category: categories[0]?.id ?? null,
      sort_order: cards.length + 1,
    });
    setEditingId("new");
  };

  const startEdit = (c: HomeCardRow) => {
    setDraft({ ...c });
    setEditingId(c.id);
  };

  const cancel = () => {
    setEditingId(null);
    setDraft(null);
    setMsg("");
  };

  const save = async () => {
    if (!draft || !supabase) return;
    setSaving(true);
    setMsg("");
    try {
      const { error } = await supabase.from("home_cards").upsert({
        ...draft,
        title: draft.title.trim() || "Categoria",
      });
      if (error) throw error;
      setMsg("Card salvata ✓");
      cancel();
      onChanged();
    } catch (err) {
      setMsg(
        `Errore: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: HomeCardRow) => {
    if (!supabase || !confirm(`Eliminare la card "${c.title}" dalla Home?`))
      return;
    const { error } = await supabase.from("home_cards").delete().eq("id", c.id);
    if (!error) onChanged();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-anton text-xl uppercase tracking-wide text-white">
          Card della Home
        </h2>
        <button
          onClick={startNew}
          disabled={editingId !== null}
          className="clickable rounded-full bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-amber-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Aggiungi card
        </button>
      </div>
      <p className="text-xs text-white/40">
        Ogni card mostra una categoria nella Home: al centro quella in mezzo
        alla lista (in origine SCARPE), le altre ai lati. L&apos;ordine si
        imposta con il campo &quot;Posizione&quot;.
      </p>

      {editingId && draft && (
        <div className="space-y-4 rounded-2xl border border-amber-300/20 bg-white/[0.03] p-5">
          <Field
            label="Titolo della card"
            value={draft.title}
            onChange={(v) => setDraft({ ...draft, title: v })}
            placeholder="Es. SCARPE"
          />
          <ImageField
            label="Immagine"
            value={draft.image_url}
            onChange={(v) => setDraft({ ...draft, image_url: v })}
            folder="home"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="block text-[11px] uppercase tracking-widest text-white/50">
                Porta alla categoria
              </span>
              <select
                value={draft.target_category ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    target_category: e.target.value || null,
                  })
                }
                className="w-full rounded-xl border border-white/15 bg-[#121216] px-4 py-2.5 text-sm text-white outline-none focus:border-amber-300/60"
              >
                <option value="">— nessuna (resta su Home) —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Posizione (ordinamento)"
              value={draft.sort_order}
              onChange={(v) =>
                setDraft({ ...draft, sort_order: Number(v) || 0 })
              }
              type="number"
            />
          </div>
          <SaveBar
            saving={saving}
            msg={msg}
            onSave={save}
            onCancel={cancel}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
          >
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg bg-black/40">
              {c.image_url ? (
                <img
                  src={c.image_url}
                  alt={c.title}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[10px] uppercase tracking-widest text-white/30">
                  Nessuna immagine
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-anton text-lg uppercase text-white">
                  {c.title}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-white/40">
                  Posizione {c.sort_order}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(c)}
                  disabled={editingId !== null}
                  className="clickable rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Modifica
                </button>
                <button
                  onClick={() => remove(c)}
                  disabled={editingId !== null}
                  className="clickable rounded-full border border-red-400/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-red-300 hover:bg-red-400/10 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="text-sm text-white/40">
            Nessuna card: aggiungine una per riempire la Home.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Prodotti di una categoria (nome, prezzo, immagine, taglie/formati)  */
/* ------------------------------------------------------------------ */

function ProductsTab({
  category,
  products,
  variants,
  onChanged,
  onEditingChange,
}: {
  category: CategoryRow;
  products: ProductRow[];
  variants: VariantRow[];
  onChanged: () => void;
  onEditingChange: (editing: boolean) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductRow | null>(null);
  const [draftVariants, setDraftVariants] = useState<VariantRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Blocca il cambio sezione mentre l'editor è aperto
  useEffect(() => {
    onEditingChange(editingId !== null);
  }, [editingId, onEditingChange]);

  const isPerfume = category.id === "profumi";
  const defaultVariants = (): VariantRow[] =>
    isPerfume
      ? [
          { id: newId("v"), product_id: "", label: "15", multiplier: 1, available: true, sort_order: 1 },
          { id: newId("v"), product_id: "", label: "30", multiplier: 1.8, available: true, sort_order: 2 },
          { id: newId("v"), product_id: "", label: "50", multiplier: 2.8, available: true, sort_order: 3 },
        ]
      : (category.id === "cinture"
          ? ["85", "90", "95", "100", "105"]
          : ["40", "41", "42", "43", "44", "45"]
        ).map((s, i) => ({
          id: newId("v"),
          product_id: "",
          label: s,
          multiplier: 1,
          available: true,
          sort_order: i + 1,
        }));

  const startNew = () => {
    setDraft({
      id: newId("p"),
      category: category.id,
      name: "",
      subtitle: "",
      description: "",
      price: 0,
      image_url: "",
      bg_color: "#141414",
      accent_color: "#ffffff",
      available: true,
      sort_order: products.length + 1,
    });
    setDraftVariants(defaultVariants());
    setEditingId("new");
  };

  const startEdit = (p: ProductRow) => {
    setDraft({ ...p });
    setDraftVariants(
      variants
        .filter((v) => v.product_id === p.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((v) => ({ ...v }))
    );
    setEditingId(p.id);
  };

  const cancel = () => {
    setEditingId(null);
    setDraft(null);
    setDraftVariants([]);
    setMsg("");
  };

  const setVariant = (i: number, patch: Partial<VariantRow>) =>
    setDraftVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v))
    );

  const addVariant = () =>
    setDraftVariants((prev) => [
      ...prev,
      {
        id: newId("v"),
        product_id: draft?.id ?? "",
        label: "",
        multiplier: 1,
        available: true,
        sort_order: prev.length + 1,
      },
    ]);

  const save = async () => {
    if (!draft || !supabase) return;
    setSaving(true);
    setMsg("");
    try {
      const id = draft.id;
      const { error } = await supabase.from("products").upsert({
        ...draft,
        name: draft.name.trim() || "Prodotto senza nome",
        price: Number(draft.price) || 0,
      });
      if (error) throw error;

      // Salva le taglie/formati (upsert) ed elimina quelle rimosse
      const dbIds = new Set(
        variants.filter((v) => v.product_id === id).map((v) => v.id)
      );
      for (const v of draftVariants) {
        const row = {
          ...v,
          product_id: id,
          label: String(v.label).trim() || "—",
          multiplier: Number(v.multiplier) || 1,
          available: v.available,
        };
        const { error: verr } = await supabase.from("variants").upsert(row);
        if (verr) throw verr;
      }
      const keepIds = new Set(draftVariants.map((v) => v.id));
      const toDelete = variants.filter(
        (v) => v.product_id === id && dbIds.has(v.id) && !keepIds.has(v.id)
      );
      for (const v of toDelete) {
        const { error: derr } = await supabase
          .from("variants")
          .delete()
          .eq("id", v.id);
        if (derr) throw derr;
      }

      setMsg("Prodotto salvato ✓");
      cancel();
      onChanged();
    } catch (err) {
      setMsg(`Errore: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: ProductRow) => {
    if (!supabase || !confirm(`Eliminare il prodotto "${p.name}"?`)) return;
    await supabase.from("variants").delete().eq("product_id", p.id);
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (!error) onChanged();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-anton text-xl uppercase tracking-wide text-white">
          {category.label}
        </h2>
        <button
          onClick={startNew}
          disabled={editingId !== null}
          className="clickable rounded-full bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-amber-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Aggiungi prodotto
        </button>
      </div>

      {editingId && draft && (
        <div className="space-y-5 rounded-2xl border border-amber-300/20 bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-200">
            {editingId === "new" ? "Nuovo prodotto" : "Modifica prodotto"}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nome"
              value={draft.name}
              onChange={(v) => setDraft({ ...draft, name: v })}
              placeholder="Es. Air Jordan 4 «Bred»"
            />
            <Field
              label="Sottotitolo"
              value={draft.subtitle}
              onChange={(v) => setDraft({ ...draft, subtitle: v })}
              placeholder="Es. Classic Black & Red"
            />
            <Field
              label="Prezzo base (€)"
              value={draft.price}
              onChange={(v) => setDraft({ ...draft, price: Number(v) || 0 })}
              type="number"
            />
            <Field
              label="Posizione (ordinamento)"
              value={draft.sort_order}
              onChange={(v) =>
                setDraft({ ...draft, sort_order: Number(v) || 0 })
              }
              type="number"
            />
            <Field
              label="Colore sfondo (hex)"
              value={draft.bg_color}
              onChange={(v) => setDraft({ ...draft, bg_color: v })}
              placeholder="#141414"
            />
            <Field
              label="Colore accento (hex)"
              value={draft.accent_color}
              onChange={(v) => setDraft({ ...draft, accent_color: v })}
              placeholder="#ffffff"
            />
            <div className="md:col-span-2">
              <Field
                label="Descrizione"
                value={draft.description}
                onChange={(v) => setDraft({ ...draft, description: v })}
                textarea
                placeholder="Breve descrizione mostrata nel carosello"
              />
            </div>
            <div className="md:col-span-2">
              <ImageField
                label="Immagine prodotto (PNG con sfondo trasparente consigliato)"
                value={draft.image_url}
                onChange={(v) => setDraft({ ...draft, image_url: v })}
                folder={category.id}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Toggle
              label="Prodotto"
              checked={draft.available}
              onChange={(v) => setDraft({ ...draft, available: v })}
            />
          </div>

          {/* Taglie / formati */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] uppercase tracking-widest text-white/50">
                {isPerfume ? "Formati (ml)" : "Taglie"} — esaurite diventano più
                chiare sul sito
              </h4>
              <button
                onClick={addVariant}
                className="clickable rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/70 hover:bg-white/10 transition-colors"
              >
                + Aggiungi {isPerfume ? "formato" : "taglia"}
              </button>
            </div>
            <p className="text-[10px] leading-relaxed text-white/35">
              Il campo &quot;Prezzo ×&quot;: 1 = prezzo pieno · sopra 1 = formato
              più grande · <span className="text-white/60">sotto 1 (es. 0.9) =
              sconto</span>: sul sito si vedrà il prezzo originale barrato
              accanto a quello scontato.
            </p>
            {draftVariants.map((v, i) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3"
              >
                <input
                  type="text"
                  value={v.label}
                  onChange={(e) => setVariant(i, { label: e.target.value })}
                  placeholder={isPerfume ? "Es. 30" : "Es. 42"}
                  className="w-20 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-sm text-white outline-none focus:border-amber-300/60"
                />
                <label className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50">
                  Prezzo ×
                  <input
                    type="number"
                    step="0.1"
                    value={v.multiplier}
                    onChange={(e) =>
                      setVariant(i, { multiplier: Number(e.target.value) || 1 })
                    }
                    className="w-20 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-sm text-white outline-none focus:border-amber-300/60"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setVariant(i, { available: !v.available })
                  }
                  className={`clickable rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                    v.available
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                      : "border-red-400/40 bg-red-400/10 text-red-300"
                  }`}
                >
                  {v.available ? "Disponibile" : "Esaurito"}
                </button>
                <button
                  onClick={() =>
                    setDraftVariants((prev) =>
                      prev.filter((x) => x.id !== v.id)
                    )
                  }
                  className="clickable ml-auto rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/50 hover:text-red-300 hover:border-red-400/40 transition-colors"
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>

          <SaveBar saving={saving} msg={msg} onSave={save} onCancel={cancel} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const pv = variants
            .filter((v) => v.product_id === p.id)
            .sort((a, b) => a.sort_order - b.sort_order);
          const soldOut = pv.length > 0 && pv.every((v) => !v.available);
          return (
            <div
              key={p.id}
              className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-black/40">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-white/30">
                    Nessuna immagine
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{p.name}</p>
                <p className="text-xs text-white/50">
                  €{Number(p.price).toFixed(2)}
                  {soldOut && (
                    <span className="ml-2 rounded-full bg-red-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-300">
                      Esaurito
                    </span>
                  )}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-white/35">
                  {pv.length} {isPerfume ? "formati" : "taglie"} · {pv.filter((v) => v.available).length} disponibili
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(p)}
                  disabled={editingId !== null}
                  className="clickable flex-1 rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Modifica
                </button>
                <button
                  onClick={() => remove(p)}
                  disabled={editingId !== null}
                  className="clickable rounded-full border border-red-400/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-red-300 hover:bg-red-400/10 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Elimina
                </button>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <p className="text-sm text-white/40">
            Nessun prodotto in questa categoria.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Contatti                                                            */
/* ------------------------------------------------------------------ */

function ContactsTab({
  contact,
  onChanged,
  onEditingChange,
}: {
  contact: ContactRow | null;
  onChanged: () => void;
  onEditingChange: (editing: boolean) => void;
}) {
  const [draft, setDraft] = useState<ContactRow>(contact ?? EMPTY_CONTACT);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [snap, setSnap] = useState(
    JSON.stringify(contact ?? EMPTY_CONTACT)
  );

  useEffect(() => {
    if (!loaded) {
      setDraft(contact ?? EMPTY_CONTACT);
      setLoaded(true);
      setSnap(JSON.stringify(contact ?? EMPTY_CONTACT));
    }
  }, [contact, loaded]);

  // Rileva modifiche non salvate e blocca il cambio sezione
  useEffect(() => {
    setDirty(JSON.stringify(draft) !== snap);
  }, [draft, snap]);

  useEffect(() => {
    onEditingChange(dirty);
  }, [dirty, onEditingChange]);

  const cancel = () => {
    setDraft(contact ?? EMPTY_CONTACT);
    setMsg("");
  };

  const save = async () => {
    if (!supabase) return;
    setSaving(true);
    setMsg("");
    try {
      const { error } = await supabase.from("contacts").upsert({ ...draft, id: 1 });
      if (error) throw error;
      setMsg("Contatti salvati ✓");
      setSnap(JSON.stringify(draft));
      onChanged();
    } catch (err) {
      setMsg(`Errore: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-anton text-xl uppercase tracking-wide text-white">
        Contatti
      </h2>
      <p className="text-xs text-white/40">
        Tutti i testi della sezione Contatti del sito: titolo, descrizione,
        email, WhatsApp, Instagram, indirizzo, mappa e pulsante.
      </p>
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2">
        <Field
          label="Titolo"
          value={draft.title}
          onChange={(v) => setDraft({ ...draft, title: v })}
          placeholder="Es. Parliamo del tuo ordine."
        />
        <div className="md:col-span-2">
          <Field
            label="Descrizione"
            value={draft.description}
            onChange={(v) => setDraft({ ...draft, description: v })}
            textarea
          />
        </div>
        <Field
          label="Email"
          value={draft.email}
          onChange={(v) => setDraft({ ...draft, email: v })}
          placeholder="info@rgstore.it"
        />
        <Field
          label="Numero WhatsApp (solo cifre, con prefisso, senza +)"
          value={draft.whatsapp_number}
          onChange={(v) => setDraft({ ...draft, whatsapp_number: v })}
          placeholder="Es. 393450000000"
        />
        <Field
          label="WhatsApp (come si vede sul sito)"
          value={draft.whatsapp_display}
          onChange={(v) => setDraft({ ...draft, whatsapp_display: v })}
          placeholder="Es. +39 345 000 0000"
        />
        <Field
          label="Instagram (con @)"
          value={draft.instagram}
          onChange={(v) => setDraft({ ...draft, instagram: v })}
          placeholder="@rg.store"
        />
        <Field
          label="Indirizzo / Showroom"
          value={draft.address}
          onChange={(v) => setDraft({ ...draft, address: v })}
          placeholder="Showroom · Milano, Italia"
        />
        <Field
          label="Testo del pulsante WhatsApp"
          value={draft.cta_label}
          onChange={(v) => setDraft({ ...draft, cta_label: v })}
          placeholder="Scrivici su WhatsApp"
        />
        <div className="md:col-span-2">
          <Field
            label="Link Google Maps (embed URL)"
            value={draft.maps_embed_url}
            onChange={(v) => setDraft({ ...draft, maps_embed_url: v })}
            textarea
            placeholder="https://www.google.com/maps/embed?pb=…"
          />
        </div>
      </div>
      <SaveBar
        saving={saving}
        msg={msg}
        onSave={save}
        onCancel={cancel}
        saveLabel="Salva contatti"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagina admin                                                        */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [navLocked, setNavLocked] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [cards, setCards] = useState<HomeCardRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [contact, setContact] = useState<ContactRow | null>(null);

  const loadAll = async () => {
    if (!supabase) return;
    const [catRes, homeRes, prodRes, varRes, conRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("home_cards").select("*").order("sort_order"),
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("variants").select("*").order("sort_order"),
      supabase.from("contacts").select("*").limit(1),
    ]);
    if (!catRes.error) setCategories((catRes.data ?? []) as CategoryRow[]);
    if (!homeRes.error) setCards((homeRes.data ?? []) as HomeCardRow[]);
    if (!prodRes.error) setProducts((prodRes.data ?? []) as ProductRow[]);
    if (!varRes.error) setVariants((varRes.data ?? []) as VariantRow[]);
    if (!conRes.error)
      setContact((conRes.data?.[0] ?? null) as ContactRow | null);
  };

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session);
        setChecking(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) loadAll();
    });
    return () => {
      cancelled = true;
      sub?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-anton text-3xl uppercase tracking-wide text-white">
            Rg Store Admin
          </h1>
          <p className="text-sm text-white/60">
            Il pannello admin non è ancora collegato a Supabase.
          </p>
          <p className="text-xs text-white/40">
            Aggiungi le chiavi <code className="text-amber-200">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
            <code className="text-amber-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> nel pannello
            Keys / API keys del progetto, poi ricarica questa pagina.
          </p>
          <a
            href="/"
            className="inline-block rounded-full border border-white/20 px-6 py-2.5 text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors"
          >
            ← Torna al sito
          </a>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <p className="text-xs uppercase tracking-widest text-white/40">
          Caricamento…
        </p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onLoggedIn={() => loadAll()} />;
  }

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const categoryTab = tab === "cinture" || tab === "scarpe" || tab === "profumi";
  const currentCategory = categories.find((c) => c.id === tab) ?? null;

  // Cambia sezione (bloccato se c'è una modifica non salvata) e torna in cima
  const goTab = (t: Tab) => {
    if (navLocked && t !== tab) return;
    setTab(t);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div
      ref={scrollRef}
      className="h-dvh select-text overflow-y-auto overscroll-contain bg-[#0a0a0c] text-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0c]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="clickable flex items-center gap-3">
            <img
              src="/store/logo%20rg.jpeg"
              alt="Rg Store"
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <p className="font-anton text-lg uppercase leading-none tracking-wide">
                Rg Store
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                Admin
              </p>
            </div>
          </a>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => goTab("home")}
              disabled={navLocked}
              title="Torna alla Home del pannello"
              className="clickable rounded-full border border-amber-300/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-amber-200 hover:bg-amber-300/10 hover:border-amber-300/70 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              Home Pannello
            </button>
            <a
              href="/"
              className="clickable hidden rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors sm:inline-block"
            >
              Vedi il sito
            </a>
            <button
              onClick={logout}
              className="clickable rounded-full bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-black hover:bg-amber-300 transition-colors"
            >
              Esci
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="mx-auto max-w-6xl px-5 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
              const isCurrent = tab === t.id;
              const locked = navLocked && !isCurrent;
              return (
                <button
                  key={t.id}
                  onClick={() => goTab(t.id)}
                  disabled={locked}
                  className={`clickable whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                    isCurrent
                      ? "bg-white text-black"
                      : locked
                        ? "cursor-not-allowed border border-white/10 text-white/25"
                        : "text-white/60 hover:text-white border border-white/15"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          {navLocked && (
            <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-widest text-amber-300/90">
              ⚠ Stai modificando: salva o annulla per cambiare sezione.
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {tab === "home" && (
          <HomeTab
            cards={cards}
            categories={categories}
            onChanged={loadAll}
            onEditingChange={setNavLocked}
          />
        )}
        {categoryTab && currentCategory && (
          <ProductsTab
            category={currentCategory}
            products={products.filter((p) => p.category === tab)}
            variants={variants}
            onChanged={loadAll}
            onEditingChange={setNavLocked}
          />
        )}
        {tab === "contatti" && (
          <ContactsTab
            contact={contact}
            onChanged={loadAll}
            onEditingChange={setNavLocked}
          />
        )}
      </main>
    </div>
  );
}