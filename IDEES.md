# Idées pour rendre l'expérience plus immersive

Feuille de route par release. ✅ = livré, 🔜 = à venir.

## Release 1 ✅

| # | Idée | Notes |
|---|------|-------|
| 1 | **Cérémonie de déverrouillage** : le sceau se brise, puis le poème apparaît vers par vers, au rythme d'une respiration (bouton « tout afficher » pour les impatientes) | automatique |
| 3 | **Constellation finale** : quand les onze portes sont ouvertes, les étoiles se relient en cœur et le prénom de Lathiri s'écrit dans le ciel | automatique |
| 7 | **Une porte par jour** : chaque porte ne s'ouvre qu'à partir de son jour | activer `dailyFrom` dans `content/config.mjs` |
| 8 | **Compte à rebours** avant l'ouverture du recueil entier | activer `opensAt` dans `content/config.mjs` |
| 9 | Le site **s'adresse à elle** : « bonsoir, Lathiri… » | `beloved` dans `content/config.mjs` |
| 10 | **PWA installable** : icône sur son téléphone, plein écran, fonctionne hors ligne | automatique |
| 11 | **Vibration** douce à l'ouverture d'une porte + texture papier et lettrine dorée sur les poèmes | automatique |
| 12 | **Le vrai ciel du soir de votre rencontre** : position réelle des étoiles brillantes selon la date et le lieu | régler `sky` (date, lat, lon) dans `content/config.mjs` |

## À venir 🔜

| # | Idée | Notes |
|---|------|-------|
| 2 | **Ta voix** : enregistrer les poèmes (le chant wolof surtout), audio chiffré comme les textes, déverrouillé avec eux | il faudra tes enregistrements |
| 4 | **Carte vivante+** : étoiles filantes, parallaxe, lune qui avance avec la progression | |
| 5 | **La douzième porte** : à la fin, une révélation ultime — une lettre, ou un lieu et une heure dans le monde réel | |
| 6 | **Sa réponse** : un espace « à ton tour » à la fin (lien WhatsApp/mail pré-rempli) | |

## Remarques

- Les verrous temporels (7 et 8) se vérifient sur l'appareil de la lectrice :
  c'est du romanesque, pas de la sécurité — les textes, eux, restent chiffrés
  et exigent toujours la bonne réponse.
- Toutes les idées restent réalisables en site statique (GitHub Pages).
