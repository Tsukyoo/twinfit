# ARCHITECTURE.md — Architecture technique

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router avec HashRouter
- IndexedDB via `idb` ou wrapper maison
- Recharts ou charts SVG maison
- GitHub Pages

## Structure cible

```txt
/src
  /app
    App.tsx
    router.tsx
    layout.tsx

  /components
    Button.tsx
    Card.tsx
    ProgressBar.tsx
    Timer.tsx
    StatCard.tsx
    EmptyState.tsx
    BottomNav.tsx

  /features
    /profiles
      ProfileSelectPage.tsx
      profileService.ts

    /dashboard
      DashboardPage.tsx
      TodayWorkoutCard.tsx

    /workout
      WorkoutPage.tsx
      WorkoutExerciseStep.tsx
      SetLogger.tsx
      RestTimer.tsx
      WorkoutRecapPage.tsx

    /nutrition
      NutritionPage.tsx
      NutritionForm.tsx
      NutritionSummary.tsx

    /progress
      ProgressPage.tsx
      ExerciseDetailPage.tsx
      charts.tsx

    /leaderboard
      LeaderboardPage.tsx

    /settings
      SettingsPage.tsx
      ImportExportPanel.tsx

  /data
    profiles.ts
    exercises.ts
    workoutPlans.ts

  /db
    indexedDb.ts
    repositories.ts
    seed.ts

  /logic
    progression.ts
    nutritionRules.ts
    scoring.ts
    weeklyCheckin.ts
    stats.ts

  /types
    index.ts

  /utils
    dates.ts
    math.ts
    format.ts
    storage.ts

  /styles
    globals.css
```

## Routing

Utiliser `HashRouter`.

Routes :

```txt
#/                  ProfileSelectPage
#/dashboard         DashboardPage
#/planning          PlanningPage
#/workout/start     WorkoutPage
#/workout/:id       WorkoutPage
#/workout/:id/recap WorkoutRecapPage
#/exercises         ExercisesPage
#/exercise/:id      ExerciseDetailPage
#/progress          ProgressPage
#/nutrition         NutritionPage
#/weekly-checkin    WeeklyCheckinPage
#/leaderboard       LeaderboardPage
#/settings          SettingsPage
```

## Data flow

1. Données statiques depuis `/src/data`
2. Données utilisateur depuis IndexedDB
3. Services/repositories pour lecture-écriture
4. Logique métier dans `/src/logic`
5. UI consomme des fonctions propres

## IndexedDB

Fichier principal : `/src/db/indexedDb.ts`

Responsabilités :

- ouvrir DB
- gérer version
- créer object stores
- créer indexes

Fichier repositories : `/src/db/repositories.ts`

Responsabilités :

- CRUD sessions
- CRUD set logs
- CRUD nutrition
- CRUD body logs
- CRUD checkins
- CRUD scores
- export/import

## GitHub Pages

Contraintes :

- utiliser HashRouter
- config `base` dans Vite si repo non root
- pas de routes serveur
- assets relatifs
- build statique

## Séparation obligatoire

Interdit :

- calculer points dans les composants
- calculer progression dans l'UI
- écrire IndexedDB directement depuis toutes les pages
- dupliquer les données programmes dans plusieurs fichiers

Obligatoire :

- `/data` pour seed statique
- `/logic` pour règles
- `/db` pour persistance
- `/features` pour écrans métier
- `/components` pour UI réutilisable

## Gestion erreurs

Prévoir :

- IndexedDB indisponible
- import JSON invalide
- session active interrompue
- refresh pendant séance
- données manquantes
- aucune séance aujourd'hui

## Sauvegarde auto

Après chaque série validée :

1. créer `SetLog`
2. sauvegarder IndexedDB
3. recalculer points temporaires
4. mettre à jour UI
5. démarrer timer repos

