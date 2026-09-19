-- ============================================================
-- RG STORE — Setup database + dati iniziali
-- Esegui tutto in un colpo solo: SQL Editor -> New query -> Run
-- ============================================================

-- 1) CATEGORIE PRODOTTO (sezioni: cinture, scarpe, profumi)
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
  ('cinture', 'Cinture', 1),
  ('scarpe', 'Scarpe', 2),
  ('profumi', 'Profumi', 3)
on conflict (id) do nothing;

insert into public.home_cards (id, title, image_url, target_category, sort_order) values
  ('home-cinture',  'CINTURE',  '/store/Louis_Vuitton_Monogram-removebg-preview.png',  'cinture',  1),
  ('home-scarpe',   'SCARPE',   '/store/Air_Jordan_4_White_Cement-removebg-preview.png', 'scarpe',   2),
  ('home-profumi',  'PROFUMI',  '/store/Creed_Aventus-removebg-preview.png',             'profumi',  3)
on conflict (id) do nothing;

insert into public.products (id, category, name, subtitle, description, price, image_url, bg_color, accent_color, sort_order) values
  ('aj4-black-cat',       'scarpe',  'Air Jordan 4 «Black Cat»',       'Stealth Leather',      'Total black in pelle. Il look stealth, al massimo della pulizia.',            130, '/store/Air_Jordan_4_Black_Cat-removebg-preview.png',        '#17171a', '#8a8f98', 1),
  ('aj4-bred',            'scarpe',  'Air Jordan 4 «Bred»',            'Classic Black & Red',  'Il classico black & red che ha scritto la storia delle Jordan.',            120, '/store/Air_Jordan_4_Bred-removebg-preview.png',             '#3a1016', '#e63946', 2),
  ('aj4-military-blue',   'scarpe',  'Air Jordan 4 «Military Blue»',   'Heritage Retro',       'Blu militare su tomaia bianca: il ritorno di una leggenda del 1989.',        125, '/store/Air_Jordan_4_Military_Blue-removebg-preview.png',    '#14263d', '#457b9d', 3),
  ('aj4-lightning',       'scarpe',  'Air Jordan 4 «Retro Lightning»', 'Electric Yellow',      'Giallo elettrico e dettagli neri: energia pura, da collezione.',             135, '/store/Air_Jordan_4_Retro_Lightning-removebg-preview.png',  '#3d310f', '#f4d03f', 4),
  ('aj4-white-cement',    'scarpe',  'Air Jordan 4 «White Cement»',    'OG 1989',              'L''originale del 1989. Bianco, cemento e dettagli senza tempo.',             140, '/store/Air_Jordan_4_White_Cement-removebg-preview.png',     '#23252b', '#e8e6e1', 5),

  ('creed-aventus',       'profumi', 'Creed Aventus',                  'Eau de Parfum',        'Ambra, muschio e bergamotto. Il profumo del successo.',                      60, '/store/Creed_Aventus-removebg-preview.png',                 '#142b22', '#2a9d8f', 1),
  ('gucci-guilty',        'profumi', 'Gucci Guilty',                   'Eau de Parfum',        'Rosa, lavanda e cedro: audace e sensuale.',                                  65, '/store/Gucci_Guilty-removebg-preview.png',                  '#2b1526', '#e76f51', 2),
  ('jpg-le-male-elixir',  'profumi', 'Jean Paul Gaultier Le Male Elixir', 'Elixir Intense',   'Vaniglia, miele e lavanda: magnetico e intenso.',                            70, '/store/Jean_Paul_Gaultier_le_male_elixir-removebg-preview.png', '#1b2740', '#6ba8d6', 3),
  ('tom-ford',            'profumi', 'Tom Ford',                       'Eau de Parfum',        'Legni pregiati e note orientali: pura eleganza.',                            75, '/store/Tom_Ford-removebg-preview.png',                      '#20160c', '#c9a25e', 4),
  ('one-million',         'profumi', 'One Million',                    'Eau de Toilette',      'Cuoio, cannella e ambra: ricco e inconfondibile.',                           80, '/store/One_Million-removebg-preview.png',                   '#2e1d12', '#d4af37', 5),

  ('lv-monogram',         'cinture', 'Louis Vuitton Monogram',         'Monogram Canvas',      'Tela monogram iconica e fibbia in metallo dorato.',                          70, '/store/Louis_Vuitton_Monogram-removebg-preview.png',        '#2b2413', '#d4af37', 1),
  ('ferragamo-gancini',   'cinture', 'Ferragamo Gancini',              'Gancini Leather',      'Pelle pregiata e fibbia Gancini, il simbolo della maison.',                  75, '/store/Ferragamo_Gancini-removebg-preview.png',             '#261c12', '#b08d57', 2),
  ('hermes-h',            'cinture', 'Hermès H',                       'H Buckle',             'La fibbia «H» in metallo: sobria, elegante, eterna.',                        80, '/store/Hermes_H-removebg-preview.png',                      '#1d2b21', '#e07a5f', 3),
  ('versace-medusa',      'cinture', 'Versace Medusa',                 'Medusa Metal',         'Medusa in rilievo: audacia e carattere.',                                   85, '/store/Versace_Medusa-removebg-preview.png',                '#1f1424', '#c0b283', 4),
  ('dior-oblique',        'cinture', 'Dior Oblique',                   'Oblique Jacquard',     'Motivo Oblique ricamato: lusso discreto, stile puro.',                      90, '/store/Dior_Oblique-removebg-preview.png',                  '#101926', '#7f8ea3', 5)
on conflict (id) do nothing;

insert into public.variants (id, product_id, label, multiplier, sort_order) values
  -- Scarpe (taglie)
  ('aj4-black-cat-40',      'aj4-black-cat',      '40', 1, 1),
  ('aj4-black-cat-41',      'aj4-black-cat',      '41', 1, 2),
  ('aj4-black-cat-42',      'aj4-black-cat',      '42', 1, 3),
  ('aj4-black-cat-43',      'aj4-black-cat',      '43', 1, 4),
  ('aj4-black-cat-44',      'aj4-black-cat',      '44', 1, 5),
  ('aj4-black-cat-45',      'aj4-black-cat',      '45', 1, 6),
  ('aj4-bred-40',           'aj4-bred',           '40', 1, 1),
  ('aj4-bred-41',           'aj4-bred',           '41', 1, 2),
  ('aj4-bred-42',           'aj4-bred',           '42', 1, 3),
  ('aj4-bred-43',           'aj4-bred',           '43', 1, 4),
  ('aj4-bred-44',           'aj4-bred',           '44', 1, 5),
  ('aj4-bred-45',           'aj4-bred',           '45', 1, 6),
  ('aj4-military-blue-40',  'aj4-military-blue',  '40', 1, 1),
  ('aj4-military-blue-41',  'aj4-military-blue',  '41', 1, 2),
  ('aj4-military-blue-42',  'aj4-military-blue',  '42', 1, 3),
  ('aj4-military-blue-43',  'aj4-military-blue',  '43', 1, 4),
  ('aj4-military-blue-44',  'aj4-military-blue',  '44', 1, 5),
  ('aj4-military-blue-45',  'aj4-military-blue',  '45', 1, 6),
  ('aj4-lightning-40',      'aj4-lightning',      '40', 1, 1),
  ('aj4-lightning-41',      'aj4-lightning',      '41', 1, 2),
  ('aj4-lightning-42',      'aj4-lightning',      '42', 1, 3),
  ('aj4-lightning-43',      'aj4-lightning',      '43', 1, 4),
  ('aj4-lightning-44',      'aj4-lightning',      '44', 1, 5),
  ('aj4-lightning-45',      'aj4-lightning',      '45', 1, 6),
  ('aj4-white-cement-40',   'aj4-white-cement',   '40', 1, 1),
  ('aj4-white-cement-41',   'aj4-white-cement',   '41', 1, 2),
  ('aj4-white-cement-42',   'aj4-white-cement',   '42', 1, 3),
  ('aj4-white-cement-43',   'aj4-white-cement',   '43', 1, 4),
  ('aj4-white-cement-44',   'aj4-white-cement',   '44', 1, 5),
  ('aj4-white-cement-45',   'aj4-white-cement',   '45', 1, 6),
  -- Cinture (taglie)
  ('lv-monogram-85',        'lv-monogram',        '85',  1, 1),
  ('lv-monogram-90',        'lv-monogram',        '90',  1, 2),
  ('lv-monogram-95',        'lv-monogram',        '95',  1, 3),
  ('lv-monogram-100',       'lv-monogram',        '100', 1, 4),
  ('lv-monogram-105',       'lv-monogram',        '105', 1, 5),
  ('ferragamo-gancini-85',  'ferragamo-gancini',  '85',  1, 1),
  ('ferragamo-gancini-90',  'ferragamo-gancini',  '90',  1, 2),
  ('ferragamo-gancini-95',  'ferragamo-gancini',  '95',  1, 3),
  ('ferragamo-gancini-100', 'ferragamo-gancini',  '100', 1, 4),
  ('ferragamo-gancini-105', 'ferragamo-gancini',  '105', 1, 5),
  ('hermes-h-85',           'hermes-h',           '85',  1, 1),
  ('hermes-h-90',           'hermes-h',           '90',  1, 2),
  ('hermes-h-95',           'hermes-h',           '95',  1, 3),
  ('hermes-h-100',          'hermes-h',           '100', 1, 4),
  ('hermes-h-105',          'hermes-h',           '105', 1, 5),
  ('versace-medusa-85',     'versace-medusa',     '85',  1, 1),
  ('versace-medusa-90',     'versace-medusa',     '90',  1, 2),
  ('versace-medusa-95',     'versace-medusa',     '95',  1, 3),
  ('versace-medusa-100',    'versace-medusa',     '100', 1, 4),
  ('versace-medusa-105',    'versace-medusa',     '105', 1, 5),
  ('dior-oblique-85',       'dior-oblique',       '85',  1, 1),
  ('dior-oblique-90',       'dior-oblique',       '90',  1, 2),
  ('dior-oblique-95',       'dior-oblique',       '95',  1, 3),
  ('dior-oblique-100',      'dior-oblique',       '100', 1, 4),
  ('dior-oblique-105',      'dior-oblique',       '105', 1, 5),
  -- Profumi (formati)
  ('creed-aventus-15',      'creed-aventus',      '15', 1,   1),
  ('creed-aventus-30',      'creed-aventus',      '30', 1.8, 2),
  ('creed-aventus-50',      'creed-aventus',      '50', 2.8, 3),
  ('gucci-guilty-15',       'gucci-guilty',       '15', 1,   1),
  ('gucci-guilty-30',       'gucci-guilty',       '30', 1.8, 2),
  ('gucci-guilty-50',       'gucci-guilty',       '50', 2.8, 3),
  ('jpg-le-male-elixir-15', 'jpg-le-male-elixir', '15', 1,   1),
  ('jpg-le-male-elixir-30', 'jpg-le-male-elixir', '30', 1.8, 2),
  ('jpg-le-male-elixir-50', 'jpg-le-male-elixir', '50', 2.8, 3),
  ('tom-ford-15',           'tom-ford',           '15', 1,   1),
  ('tom-ford-30',           'tom-ford',           '30', 1.8, 2),
  ('tom-ford-50',           'tom-ford',           '50', 2.8, 3),
  ('one-million-15',        'one-million',        '15', 1,   1),
  ('one-million-30',        'one-million',        '30', 1.8, 2),
  ('one-million-50',        'one-million',        '50', 2.8, 3)
on conflict (id) do nothing;

insert into public.contacts (id, title, description, email, whatsapp_number, whatsapp_display, instagram, address, maps_embed_url, cta_label) values
  (1,
   'Parliamo del tuo ordine.',
   'Domande su taglie, disponibilità o spedizioni? Scrivici: rispondiamo entro 24 ore, dal lunedì al sabato.',
   'info@rgstore.it',
   '393450000000',
   '+39 345 000 0000',
   '@rg.store',
   'Showroom · Milano, Italia',
   'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2798.118670876798!2d9.19154381555894!3d45.46944367910103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c6b4fa7bfa77%3A0xb35e67046e7f2231!2sVia%20Monte%20Napoleone%2C%2020121%20Milano%20MI!5e0!3m2!1sit!2sit!4v1659000000000!5m2!1sit!2sit',
   'Scrivici su WhatsApp')
on conflict (id) do nothing;