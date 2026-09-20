# Funzioni temporanee (come tornare indietro)

Queste cose sono **di prova** e isolate dal resto dello store: se non ti
piacciono si spengono o si cancellano senza toccare nient'altro.

## 1. Spegnere tutto in 5 secondi

Apri `lib/extras.ts` e metti a `false` quello che non vuoi:

```ts
export const EXTRAS = {
  catalogoClassico: true,     // sezione "Catalogo Classico"
};
```

- `catalogoClassico: false` → la voce sparisce dal menu e la pagina si
  ricompone da sola (gli indici delle sezioni sono calcolati, non scritti a
  mano).

## 2. Cancellare del tutto i file

Oltre a spegnere gli interruttori:

1. cancella `app/extras.tsx`, `app/extras.css`, `lib/extras.ts`;
2. in `app/page.tsx` togli i pezzi segnati `TEMPORANEO` / `CATALOGO CLASSICO`
   (gli import da `@/lib/extras` e `./extras` e la sezione
   `<CatalogoClassicoView …>`);
3. in `lib/catalog.ts` rimetti la lista fissa delle voci di navigazione
   (`NAV_ITEMS`) senza il blocco `...(EXTRAS.catalogoClassico ? … : [])`.

Lo store torna esattamente allo stato precedente: prodotti, carrello,
prezzi, fumo e animazioni non dipendono da questi file.

## 3. Cosa c'è adesso

| Cosa | Dove | Note |
| --- | --- | --- |
| Sezione **Catalogo Classico** | `app/extras.tsx` → `CatalogoClassicoView` | Griglia classica in stile **Noir Éditorial** (nero, serif, cornici sottili): 12 prodotti × 3 = **36 schede** (originale + "copia 2" + "copia 3"), con Aggiungi al carrello. Le copie sono voci di carrello separate. |
| **Scheda ingrandita** | `app/extras.tsx` → `CatalogModal` | Clic (o Invio) sull'immagine di una scheda: si apre la vista grande con nome, descrizione, prezzo e **Aggiungi al carrello**. Si chiude con la X, cliccando fuori o con Esc. |
| **Fumo** | `app/extras.css` → `[data-smoke]` | Un solo tipo, il **Vortice** (denso, luminoso, che sale dal centro). Gli altri 4 e il tasto di scelta sono stati rimossi. |
| **Sfondo** | `app/globals.css` → `.bg-marble` / `.bg-vein` | La lastra con le venature storica. Il tasto di scelta dei 5 sfondi è stato rimosso: gli altri 4 stili non esistono più. |

### Il design del catalogo è fisso

Prima si entrava in una schermata di scelta fra 10 design. Ora il catalogo
usa sempre **Noir Éditorial** (design 2): i token stanno in cima a
`app/extras.css` nel blocco `.ct-root`. Il titolo della pagina è
**"Catalogo Classico"**: non mostra più il nome del design né quello del
font.

## 4. Lo sfondo

È tornato quello storico: la lastra di marmo con le venature
(`app/globals.css` → `.bg-marble` / `.bg-vein`). Il tasto temporaneo per
provare gli altri 4 stili (fulmini, griglia, aurora, raggi) è stato tolto
insieme al loro CSS, così non c'è più nessun livello decorativo in più da
disegnare durante la navigazione.

## 5. Cosa è stato alleggerito (prestazioni)

Il sito laggava su scroll, aggiunte al carrello e cambio categoria. Le
cause erano tre, tutte risolte:

1. **Il cursore personalizzato** scriveva due variabili di stato ad ogni
   movimento del mouse: ridisegnava l'intera pagina (catalogo compreso) ad
   ogni pixel. Ora si sposta scrivendo direttamente nel DOM.
2. **Il catalogo si ridisegnava per qualsiasi motivo**: è memoizzato
   (`memo`), il tasto Aggiungi del carrello ha un'identità stabile
   (`useCallback` con ref per quantità e taglia) e la pagina non tocca più
   le 36 schede quando cambia qualcos'altro.
3. **Il colore dello sfondo era una variabile su tutta la pagina**:
   cambiando capo, il browser ricalcolava gli stili di ogni elemento per
   ogni frame dell'animazione. Ora `--bg-c` e `--bg-accent` sono impostate
   solo sugli elementi che le leggono (vedi `app/page.tsx` e `app/extras.css`).

In più: il velo del carrello prende il `backdrop-filter` solo da aperto, e
l'immagine grande / le schede usano `decoding="async"`.
