# Bibliotech — Frontend

Interface Next.js 14 (App Router) de la bibliothèque scolaire Bibliotech.
Voir le [README racine](../README.md) pour la documentation complète du projet.

## Démarrage

```bash
yarn install
cp .env-example .env        # puis ajuster NEXT_PUBLIC_BACKEND_BASE_URL
yarn dev                    # http://localhost:3000
```

| Script | Rôle |
|---|---|
| `yarn dev` | Serveur de développement |
| `yarn build` | Build de production |
| `yarn start` | Sert le build de production |
| `yarn lint` | ESLint (config `next/core-web-vitals`) |

## Variable d'environnement

`NEXT_PUBLIC_BACKEND_BASE_URL` — base de l'API **sans** le suffixe `/apps`, que
`src/lib/network/api.ts` ajoute lui-même. Exemple : `http://localhost:8000/api`.

## Routes

| Route | Rôle |
|---|---|
| `/` | Catalogue : recherche, filtres, grille de livres |
| `/favorites` | Livres mis en favori |
| `/offline` | Livres disponibles hors ligne |
| `/login` | Connexion |
| `/logout` | Révoque la session puis redirige vers `/login` |

## Organisation

```
src/
├── app/                    # Routes App Router
├── components/
│   ├── book/               # Couverture, vignette, grille, filtres, fiche, lecteur
│   ├── layout/AppShell     # Barre latérale, en-tête, tiroir mobile
│   ├── pages/              # Assemblages de page (LibraryView, Login)
│   ├── search-bar/
│   └── ui/                 # Primitives : Button, IconButton, Chip, Spinner…
└── lib/
    ├── hooks/              # authentification, useBook, useBookPage, useFavori,
    │                       # useDownloads, useIndexedDB, useInView, useTheme
    ├── network/api.ts      # Instance Axios + rafraîchissement JWT
    ├── shared/             # Store Redux, helper cookies
    └── ui/cn.ts            # Concaténation de classes
```

## Points d'architecture

- **Hors ligne d'abord.** Le catalogue, les couvertures, les pages et les favoris
  sont stockés dans IndexedDB (base `AscitechBibliotech`, **version 3**). Les
  écrans lisent le cache puis rafraîchissent en arrière-plan : une coupure réseau
  n'efface jamais ce qui est déjà là.
- **Ajout d'un magasin IndexedDB** → incrémenter `DB_VERSION` dans
  `src/lib/hooks/useIndexedDB/index.ts`, sinon `onupgradeneeded` ne se déclenche
  pas chez les utilisateurs existants.
- **Thème.** Les couleurs sont des variables CSS (`globals.css`) exposées à
  Tailwind ; le mode sombre s'active via la classe `dark` sur `<html>`, appliquée
  avant le premier rendu par un script inline pour éviter tout flash.
- **Animations.** framer-motion, avec respect de `prefers-reduced-motion`.
- **Couvertures.** Chargées à l'entrée dans le viewport (IntersectionObserver) et
  demandées en vignette (`?width=`). Un livre sans fichier de page reçoit une
  couverture générée localement — aucune dépendance à un service externe.
