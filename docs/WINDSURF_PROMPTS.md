# WINDSURF_PROMPTS.md — Prompts phase par phase

## GO PHASE 2 — SETUP

```txt
GO PHASE 2 — SETUP

Lis tous les fichiers .md du projet avant d'agir.
Crée uniquement le setup technique de base :

- Vite React TypeScript
- Tailwind CSS
- React Router avec HashRouter
- layout global
- navigation mobile bottom nav
- thème dark premium Apple Fitness / Liquid Glass
- config GitHub Pages compatible

Contraintes :
- pas encore de IndexedDB
- pas encore de vraies données programmes
- pas de logique fitness
- pas de dashboard complet
- pas de mode séance
- design propre mais minimal

À la fin, réponds avec :
- fichiers créés
- fichiers modifiés
- ce qui fonctionne
- comment tester
- erreurs possibles
- prompt exact pour Phase 3
```

## GO PHASE 3 — DATA

```txt
GO PHASE 3 — DATA

Crée la couche data complète :

- types TypeScript
- profils Teoman et Denizhan
- exercices avec machine, muscles, instructions, erreurs, alternatives
- programmes complets
- IndexedDB
- repositories
- seed initial

Contraintes :
- ne pas créer encore le mode séance complet
- pas de logique UI complexe
- respecter DATA_MODEL.md et PROGRAMMES.md
- localStorage uniquement pour selectedProfileId/settings

Tests :
- profils importables
- programmes cohérents
- IndexedDB s'ouvre
- repositories basiques fonctionnent
```

## GO PHASE 4 — DASHBOARD

```txt
GO PHASE 4 — DASHBOARD

Crée :

- sélection profil
- sauvegarde dernier profil choisi
- dashboard personnalisé
- séance du jour
- prochaine séance
- stats rapides nutrition/poids/points/streak

Contraintes :
- mobile-first
- design Liquid Glass
- pas encore de mode séance avancé
- données via services/repositories

Tests :
- choisir Teoman
- choisir Denizhan
- refresh conserve profil
- séance du jour correcte
```

## GO PHASE 5 — MODE EN SÉANCE

```txt
GO PHASE 5 — MODE EN SÉANCE

Crée la fonctionnalité centrale :

- lancer séance du jour
- créer WorkoutSession
- afficher exercice actuel
- média placeholder vidéo/image
- machine Basic Fit
- muscles ciblés
- instructions courtes
- erreurs fréquentes
- inputs poids/reps/RPE/notes
- ajouter/modifier série
- valider série
- sauvegarde auto après chaque série
- timer repos automatique
- pause/skip timer
- exercice suivant/précédent
- finir séance
- recap fin séance

Contraintes :
- UX ultra rapide en salle
- gros boutons
- sauvegarde fiable
- logique métier séparée

Tests :
- faire une séance complète
- refresh après série ne perd pas le set
- timer démarre après validation
- recap calcule volume/séries/durée/points
```

## GO PHASE 6 — PROGRESSION

```txt
GO PHASE 6 — PROGRESSION

Crée :

- historique séances
- historique par exercice
- page détail exercice #/exercise/:id
- PR poids/volume/série
- graphiques poids corporel et volume semaine
- suggestions prochaine charge

Contraintes :
- respecter FITNESS_LOGIC.md
- recommandations non obligatoires
- gérer douleur/RPE élevé

Tests :
- PR détecté
- suggestion charge cohérente
- historique exercice filtré correctement
```

## GO PHASE 7 — NUTRITION

```txt
GO PHASE 7 — NUTRITION

Crée :

- page Nutrition
- log quotidien calories/protéines/glucides/lipides/eau
- faim, énergie, sommeil, note libre
- respect plan oui/non
- calories restantes
- protéines restantes
- eau restante
- barres progression
- tips personnalisés Teoman/Denizhan

Contraintes :
- simple à remplir
- mobile-first
- scoring nutrition appliqué

Tests :
- créer log du jour
- modifier log du jour
- calculs restants corrects
- points nutrition/eau cohérents
```

## GO PHASE 8 — CHECK HEBDO + CLASSEMENT

```txt
GO PHASE 8 — CHECK HEBDO + CLASSEMENT

Crée :

- check hebdomadaire
- calcul poids moyen
- séances faites
- calories/protéines/sommeil/énergie moyens
- verdict automatique
- recommandations Teoman/Denizhan
- leaderboard
- points semaine/total
- streaks
- badges sobres

Contraintes :
- pas de gamification enfantine
- design premium
- règles FITNESS_LOGIC.md strictes

Tests :
- verdict Teoman correct
- verdict Denizhan correct
- points semaine corrects
- leaderboard compare les deux profils
```

## GO PHASE 9 — EXPORT/IMPORT + POLISH

```txt
GO PHASE 9 — EXPORT/IMPORT + POLISH

Crée :

- export JSON complet
- import JSON
- reset profil avec confirmation
- backup local
- polish responsive
- états vides
- erreurs propres
- PWA optionnelle
- final GitHub Pages check

Contraintes :
- ne jamais écraser sans confirmation
- JSON lisible
- données validées avant import
- build final propre

Tests :
- export contient toutes les stores
- JSON valide
- import restaure les données
- reset profil fonctionne avec confirmation
- npm run build OK
```

