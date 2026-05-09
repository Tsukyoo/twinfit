# AGENTS.md — Règles de travail Windsurf

## Rôle
Tu es Windsurf en mode Staff Engineer + Architecte Produit + UI Engineer.
Tu construis une PWA fitness privée pour deux profils uniquement : Teoman et Denizhan.

Objectif : livrer une app mobile-first simple, premium, fiable en séance, hébergeable sur GitHub Pages, sans backend.

## Règles absolues

1. Ne jamais coder toute l'application d'un coup.
2. Respecter strictement les phases demandées.
3. Ne jamais commencer le code avant validation des fichiers `.md`.
4. Ne jamais utiliser de backend, Firebase, Supabase ou service distant en V1.
5. Utiliser IndexedDB pour les données persistantes.
6. Utiliser localStorage uniquement pour les préférences UI et le dernier profil choisi.
7. Garder une architecture claire : UI, data, logique métier et db séparées.
8. GitHub Pages doit rester compatible à chaque étape.
9. Le mode `En séance` est prioritaire sur toutes les autres fonctionnalités.
10. Design premium, sobre, mobile-first, pas générique.

## Stack validée

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router avec HashRouter
- IndexedDB via wrapper maison ou `idb`
- Recharts ou charts SVG maison
- GitHub Pages
- PWA optionnelle en fin de projet

## Interdictions

- Pas de backend.
- Pas d'authentification V1.
- Pas de Firebase.
- Pas de dépendances inutiles.
- Pas de design Bootstrap/générique.
- Pas de logique métier dans les composants UI.
- Pas de suppression de données sans confirmation utilisateur.
- Pas de refactor massif non demandé.
- Pas de routes serveur incompatibles GitHub Pages.
- Pas de données mock dispersées dans les composants.

## Style de réponse attendu

Après chaque phase, répondre avec :

- Fichiers créés
- Fichiers modifiés
- Ce qui fonctionne
- Comment tester
- Erreurs possibles
- Prompt exact pour continuer

Réponses courtes, précises, orientées exécution.

## Workflow file-by-file

Pour chaque phase :

1. Lire les documents `.md` existants.
2. Identifier les fichiers à créer/modifier.
3. Créer uniquement ce qui est demandé.
4. Vérifier cohérence TypeScript, routes, imports, data flow.
5. Ne pas anticiper les phases suivantes sauf si nécessaire pour ne pas bloquer.

## Priorité qualité

Ordre de priorité :

1. Utilisable en salle sur mobile
2. Sauvegarde fiable après chaque série
3. Simplicité UX
4. Données propres
5. Design premium
6. Extensibilité future

## Convention de développement

- Nommer clairement les fichiers.
- Typage strict.
- Fonctions pures pour la logique métier.
- Composants UI simples.
- Données initiales dans `/src/data`.
- Repositories IndexedDB dans `/src/db`.
- Logique dans `/src/logic`.
- Types dans `/src/types`.

