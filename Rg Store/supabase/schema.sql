-- ============================================================
-- VINTAGE CLUB STUDIO — Setup database + dati iniziali
-- Esegui tutto in un colpo solo: SQL Editor -> New query -> Run
-- ============================================================

-- 1) CATEGORIE PRODOTTO (sezioni: maglie, completi, pantaloni)
create table if not exists public.categories (
  id text primary key,
  label text not null,
  sort_order int not null default 0
);

-- 2) CARD DELLA HOME (titolo + immagine, modificabili da admin)
create table if not exists public.home_cards (
  id text primary key,
  title text not null,
  image_url text not null default '',
  target_category text references public.categories(id) on delete cascade,
  sort_order int not null default 0
);

-- 3) PRODOTTI
create table if not exists public.products (
  id text primary key,
  category text not null references public.categories(id) on delete cascade,
  name text not null,
  subtitle text not null default '',
  description text not null default '',
  price numeric not null default 0,
  image_url text not null default '',
  bg_color text not null default '#141414',
  accent_color text not null default '#ffffff',
  discount_percent numeric not null default 0,
  available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 4) TAGLIE / FORMATI
create table if not exists public.variants (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  label text not null,
  multiplier numeric not null default 1,
  available boolean not null default true,
  sort_order int not null default 0
);

-- 5) CONTATTI (una sola riga con tutti i testi)
create table if not exists public.contacts (
  id int primary key default 1,
  title text not null default '',
  description text not null default '',
  email text not null default '',
  whatsapp_number text not null default '',
  whatsapp_display text not null default '',
  instagram text not null default '',
  address text not null default '',
  maps_embed_url text not null default '',
  cta_label text not null default ''
);

-- ============================================================
-- AGGIORNAMENTO: colonna sconto per prodotto (0 = nessuno)
-- ============================================================
alter table public.products add column if not exists discount_percent numeric not null default 0;

-- ============================================================
-- SICUREZZA: tutti possono LEGGERE, solo l'admin (loggato) scrive
-- ============================================================
alter table public.categories enable row level security;
alter table public.home_cards enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.contacts enable row level security;

drop policy if exists "categories_lettura_pubblica" on public.categories;
create policy "categories_lettura_pubblica" on public.categories for select using (true);
drop policy if exists "categories_scrittura_admin" on public.categories;
create policy "categories_scrittura_admin" on public.categories for all to authenticated using (true) with check (true);

drop policy if exists "home_cards_lettura_pubblica" on public.home_cards;
create policy "home_cards_lettura_pubblica" on public.home_cards for select using (true);
drop policy if exists "home_cards_scrittura_admin" on public.home_cards;
create policy "home_cards_scrittura_admin" on public.home_cards for all to authenticated using (true) with check (true);

drop policy if exists "products_lettura_pubblica" on public.products;
create policy "products_lettura_pubblica" on public.products for select using (true);
drop policy if exists "products_scrittura_admin" on public.products;
create policy "products_scrittura_admin" on public.products for all to authenticated using (true) with check (true);

drop policy if exists "variants_lettura_pubblica" on public.variants;
create policy "variants_lettura_pubblica" on public.variants for select using (true);
drop policy if exists "variants_scrittura_admin" on public.variants;
create policy "variants_scrittura_admin" on public.variants for all to authenticated using (true) with check (true);

drop policy if exists "contacts_lettura_pubblica" on public.contacts;
create policy "contacts_lettura_pubblica" on public.contacts for select using (true);
drop policy if exists "contacts_scrittura_admin" on public.contacts;
create policy "contacts_scrittura_admin" on public.contacts for all to authenticated using (true) with check (true);

-- ============================================================
-- ARCHIVIO IMMAGINI (bucket pubblico "store")
-- ============================================================
insert into storage.buckets (id, name, public)
values ('store', 'store', true)
on conflict (id) do nothing;

drop policy if exists "store_lettura_pubblica" on storage.objects;
create policy "store_lettura_pubblica" on storage.objects for select using (bucket_id = 'store');
drop policy if exists "store_caricamento_admin" on storage.objects;
create policy "store_caricamento_admin" on storage.objects for insert to authenticated with check (bucket_id = 'store');
drop policy if exists "store_aggiornamento_admin" on storage.objects;
create policy "store_aggiornamento_admin" on storage.objects for update to authenticated using (bucket_id = 'store');
drop policy if exists "store_eliminazione_admin" on storage.objects;
create policy "store_eliminazione_admin" on storage.objects for delete to authenticated using (bucket_id = 'store');

-- ============================================================
-- DATI INIZIALI (il catalogo attuale del sito)
-- ============================================================
insert into public.categories (id, label, sort_order) values
  ('maglie', 'Maglie', 1),
  ('completi', 'Completi', 2),
  ('pantaloni', 'Pantaloni', 3)
on conflict (id) do nothing;

insert into public.home_cards (id, title, image_url, target_category, sort_order) values
  ('home-maglie',    'MAGLIE',    '/vintage/maglia-1.png',    'maglie',    1),
  ('home-completi',  'COMPLETI',  '/vintage/completo-2.png',  'completi',  2),
  ('home-pantaloni', 'PANTALONI', '/vintage/pantalone-4.png', 'pantaloni', 3)
on conflict (id) do nothing;

insert into public.products (id, category, name, subtitle, description, price, image_url, bg_color, accent_color, discount_percent, sort_order) values
  ('maglia-1',      'maglie',    'Maglia 1',      'Rosso',           'Maglia rossa dal taglio vintage: colore pieno e finiture a contrasto.',        39.9, '/vintage/maglia-1.png',     '#5e1622', '#d9414f', 0, 1),
  ('maglia-2',      'maglie',    'Maglia 2',      'Nero',            'Maglia scura essenziale: base nera, taglio pulito, stile da club.',            39.9, '/vintage/maglia-2.png',     '#33333c', '#a8b0c0', 0, 2),
  ('maglia-3',      'maglie',    'Maglia 3',      'Blu',             'Maglia blu profondo, ispirata alle casacche vintage.',                         39.9, '/vintage/maglia-3.png',     '#0f3f8c', '#3878e0', 0, 3),
  ('maglia-4',      'maglie',    'Maglia 4',      'Verde petrolio',  'Maglia verde petrolio, tinta piena e dettagli ridotti all''essenziale.',        39.9, '/vintage/maglia-4.png',     '#0f564f', '#1fae97', 0, 4),

  ('completo-1',    'completi',  'Completo 1',    'Chiaro',          'Completo chiaro con dettagli rossi: maglia e pantalone abbinati.',             89.9, '/vintage/completo-1.png',   '#ddd6df', '#cf4759', 0, 1),
  ('completo-2',    'completi',  'Completo 2',    'Blu & Giallo',    'Completo blu con dettagli gialli, il classico da trasferta.',                  89.9, '/vintage/completo-2.png',   '#1c3e68', '#d8c24f', 0, 2),
  ('completo-3',    'completi',  'Completo 3',    'Viola',           'Completo viola intenso, maglia e pantalone coordinati.',                       89.9, '/vintage/completo-3.png',   '#463065', '#9061d6', 0, 3),
  ('completo-4',    'completi',  'Completo 4',    'Nero',            'Completo nero con dettagli rosa antico.',                                      89.9, '/vintage/completo-4.png',   '#26212a', '#bb7d95', 0, 4),

  ('pantalone-1',   'pantaloni', 'Pantalone 1',   'Rosso',           'Pantalone rosso dal taglio vintage.',                                          44.9, '/vintage/pantalone-1.png',  '#5a1019', '#d9414f', 0, 1),
  ('pantalone-2',   'pantaloni', 'Pantalone 2',   'Antracite',       'Pantalone antracite, essenziale e senza tempo.',                               44.9, '/vintage/pantalone-2.png',  '#2b2530', '#a4596a', 0, 2),
  ('pantalone-3',   'pantaloni', 'Pantalone 3',   'Blu navy',        'Pantalone blu navy con dettagli rossi.',                                       44.9, '/vintage/pantalone-3.png',  '#1f2644', '#bc4150', 0, 3),
  ('pantalone-4',   'pantaloni', 'Pantalone 4',   'Chiaro',          'Pantalone chiaro, da abbinare alla maglia.',                                   44.9, '/vintage/pantalone-4.png',  '#d9d2dd', '#c84a5c', 0, 4)
on conflict (id) do nothing;

-- Taglie S / M / L / XL generate per ogni capo del catalogo
insert into public.variants (id, product_id, label, multiplier, sort_order)
select p.id || '-' || lower(t.label), p.id, t.label, 1, t.sort_order
from public.products p
cross join (values ('S', 1), ('M', 2), ('L', 3), ('XL', 4)) as t(label, sort_order)
where p.category in ('maglie', 'completi', 'pantaloni')
on conflict (id) do nothing;

insert into public.contacts (id, title, description, email, whatsapp_number, whatsapp_display, instagram, address, maps_embed_url, cta_label) values
  (1,
   'Parliamo del tuo ordine.',
   'Domande su taglie, disponibilità o spedizioni? Scrivici: rispondiamo entro 24 ore, dal lunedì al sabato.',
   'info@vintageclubstudio.it',
   '393450000000',
   '+39 345 000 0000',
   '@vintageclubstudio',
   'Showroom · Milano, Italia',
   'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2798.118670876798!2d9.19154381555894!3d45.46944367910103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c6b4fa7bfa77%3A0xb35e67046e7f2231!2sVia%20Monte%20Napoleone%2C%2020121%20Milano%20MI!5e0!3m2!1sit!2sit!4v1659000000000!5m2!1sit!2sit',
   'Scrivici su WhatsApp')
on conflict (id) do nothing;

-- ============================================================
-- PULIZIA DEL VECCHIO CATALOGO (RG Store: cinture, scarpe, profumi)
-- Cancella solo le sezioni del vecchio store: prodotti, taglie e card
-- della home collegate vengono rimossi in automatico (ON DELETE CASCADE).
-- Commenta questo blocco se preferisci conservare i dati precedenti.
-- ============================================================
delete from public.categories where id in ('cinture', 'scarpe', 'profumi');

-- I contatti già presenti vengono riallineati al nuovo brand
update public.contacts
   set email = 'info@vintageclubstudio.it',
       instagram = '@vintageclubstudio'
 where id = 1;

-- ============================================================
-- IMMAGINI DEI CAPI
-- Le immagini del nuovo store sono servite dai file statici del sito
-- (/public/vintage): maglia-1..4, completo-1..4, pantalone-1..4.
-- Per gestirle dal pannello Admin basta caricarle nel bucket "store"
-- e aggiornare il campo image_url del prodotto.
-- ============================================================
