# Psaumes 💌

Un recueil de textes d'amour sous forme de voyage : une **carte** raconte
l'histoire — un chemin d'étoiles qui serpente, une étape par poème — et
chaque poème a **sa propre page** (`poeme.html?p=n`), gardée par une
devinette. Chaque bonne réponse déverrouille le texte ; le chemin doré
s'allume au fur et à mesure sur la carte.

Les poèmes sont **chiffrés** (AES-256-GCM, clé dérivée de la réponse) :
même en ouvrant le code source de la page, impossible de les lire sans
connaître les réponses.

## Structure

```
content/config.mjs      ← LES TEXTES + LES DEVINETTES (c'est ici qu'on édite)
tools/build.mjs         ← chiffre les textes → docs/assets/data.js
docs/                   ← le site publié (ne contient que du chiffré)
```

## Personnaliser les devinettes (obligatoire !)

Les devinettes actuelles sont des **exemples** (les réponses contiennent
`EXEMPLE`). Le site ne doit pas être offert tel quel.

1. Ouvre `content/config.mjs`
2. Pour chaque chapitre, remplace `riddle` (la question), `hint` (l'indice)
   et `answers` (la ou les réponses acceptées). Tu peux aussi ajuster
   `stage` (le nom de l'étape sur la carte) et `mapNote` (la petite phrase
   sous l'étape — c'est elle qui raconte votre histoire sur la carte)
3. Regénère les fichiers chiffrés :

   ```bash
   node tools/build.mjs
   ```

4. Commit et push.

Les réponses sont tolérantes : majuscules, accents, espaces, tirets et
ponctuation sont ignorés (`Saint-Louis` = `saint louis` = `SAINTLOUIS`).
On peut accepter plusieurs réponses : `answers: ["14 février", "14/02"]`.

Dans `settings` :

- `beloved` : son prénom — le site s'adresse à elle (« bonsoir, Lathiri… »)
  et le signe dans la constellation finale
- `sequential: true` impose l'ordre (un vrai voyage) ; `false` laisse
  toutes les portes accessibles d'emblée
- `opensAt` : date/heure d'ouverture du recueil — avant, un compte à
  rebours (`null` = ouvert tout de suite)
- `dailyFrom` : une porte par jour à partir de cette date (`null` = pas
  de rythme quotidien)
- `sky` : `{ date, lat, lon }` du soir de votre rencontre — les étoiles
  brillantes sont dessinées à leur **vraie** position dans le ciel de ce
  soir-là (`null` = ciel décoratif). ⚠️ L'exemple actuel pointe sur Dakar
  à une date arbitraire : mets votre soir.

Le site est aussi une **PWA** : sur son téléphone, « Ajouter à l'écran
d'accueil » installe Psaumes comme une app (plein écran, hors ligne).

La liste des idées et la feuille de route par release : voir `IDEES.md`.

## Tester en local

```bash
node tools/build.mjs
npx serve docs        # ou : python3 -m http.server -d docs 8000
```

Puis ouvrir http://localhost:3000 (le déchiffrement exige `localhost` ou HTTPS).

## Publier

**GitHub Pages** : Settings → Pages → *Deploy from a branch* →
branche principale, dossier `/docs`. Le site sera sur
`https://<utilisateur>.github.io/psaumes/`.

⚠️ **Si le dépôt est public**, les textes en clair restent visibles dans
`content/config.mjs` pour qui trouve le dépôt GitHub (pas via le site, qui
ne sert que `docs/`). Deux options :

- garder le dépôt **privé** et publier sur Netlify / Vercel (gratuits avec
  dépôt privé, dossier de publication : `docs`) ;
- ou sortir `content/` du git (`echo "content/" >> .gitignore`) et garder
  une copie du fichier en lieu sûr.

## Elle a oublié où elle en était ?

La progression est mémorisée dans le navigateur (localStorage). Le lien
« recommencer le voyage » en bas de page reverrouille tout.
