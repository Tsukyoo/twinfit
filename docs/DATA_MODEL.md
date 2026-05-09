# DATA_MODEL.md — Modèle de données

## Principes

- Les données utilisateur sont stockées en IndexedDB.
- Les données initiales statiques sont dans `/src/data`.
- localStorage ne stocke que les préférences UI.
- Tous les modèles doivent être typés TypeScript.
- Les entités doivent être exportables/importables en JSON lisible.

## Types principaux

```ts
type ProfileId = 'teoman' | 'denizhan';

type WorkoutDay = 'monday' | 'wednesday' | 'friday' | 'saturday';

type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'full_body';
```

## Profile

```ts
interface Profile {
  id: ProfileId;
  name: string;
  age: number;
  heightCm: number;
  initialWeightKg: number;
  goal: string;
  color: string;
  nutritionTargets: NutritionTargets;
  trainingDays: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}
```

## NutritionTargets

```ts
interface NutritionTargets {
  calories: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
  waterMl: number;
}
```

## Exercise

```ts
interface Exercise {
  id: string;
  name: string;
  machineName: string;
  category: ExerciseCategory;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  imageUrl?: string;
  videoUrl?: string;
  localVideoPath?: string;
  instructions: string[];
  commonMistakes: string[];
  progressionTip: string;
  alternatives: string[];
}
```

## WorkoutPlan

```ts
interface WorkoutPlan {
  id: string;
  profileId: ProfileId;
  day: WorkoutDay;
  name: string;
  exercises: WorkoutPlanExercise[];
}
```

## WorkoutPlanExercise

```ts
interface WorkoutPlanExercise {
  exerciseId: string;
  order: number;
  targetSets: number;
  minReps: number;
  maxReps: number;
  restSeconds: number;
  notes?: string;
}
```

## WorkoutSession

```ts
interface WorkoutSession {
  id: string;
  profileId: ProfileId;
  workoutPlanId: string;
  name: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  totalVolumeKg?: number;
  totalSets?: number;
  pointsEarned?: number;
}
```

## SetLog

```ts
interface SetLog {
  id: string;
  sessionId: string;
  profileId: ProfileId;
  exerciseId: string;
  workoutPlanId: string;
  setIndex: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  notes?: string;
  pain?: boolean;
  createdAt: string;
}
```

## NutritionLog

```ts
interface NutritionLog {
  id: string;
  profileId: ProfileId;
  date: string;
  calories: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
  waterMl: number;
  planRespected: boolean;
  hungerLevel?: number;
  energyLevel?: number;
  sleepHours?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## BodyLog

```ts
interface BodyLog {
  id: string;
  profileId: ProfileId;
  date: string;
  weightKg: number;
  waistCm?: number;
  notes?: string;
  createdAt: string;
}
```

## WeeklyCheckin

```ts
interface WeeklyCheckin {
  id: string;
  profileId: ProfileId;
  weekStartDate: string;
  weekEndDate: string;
  averageWeightKg?: number;
  waistCm?: number;
  workoutsCompleted: number;
  averageCalories?: number;
  averageProteinG?: number;
  averageSleepHours?: number;
  averageEnergy?: number;
  verdict: string;
  recommendation: string;
  pointsEarned: number;
  createdAt: string;
}
```

## LeaderboardScore

```ts
interface LeaderboardScore {
  id: string;
  profileId: ProfileId;
  weekStartDate: string;
  weeklyPoints: number;
  totalPoints: number;
  workoutStreak: number;
  nutritionStreak: number;
  badges: string[];
  updatedAt: string;
}
```

## Settings

```ts
interface Settings {
  selectedProfileId?: ProfileId;
  theme: 'dark';
  restTimerSound: boolean;
  reducedMotion: boolean;
  units: 'metric';
}
```

## Structure IndexedDB

Database name : `fitness_private_pwa`
Version initiale : `1`

Stores :

- `workoutSessions`
- `setLogs`
- `nutritionLogs`
- `bodyLogs`
- `weeklyCheckins`
- `leaderboardScores`
- `backups`

## Indexes recommandés

### workoutSessions

- `profileId`
- `workoutPlanId`
- `startedAt`
- `status`

### setLogs

- `sessionId`
- `profileId`
- `exerciseId`
- `createdAt`

### nutritionLogs

- `profileId`
- `date`

### bodyLogs

- `profileId`
- `date`

### weeklyCheckins

- `profileId`
- `weekStartDate`

### leaderboardScores

- `profileId`
- `weekStartDate`

## Export JSON

Format attendu :

```json
{
  "version": 1,
  "exportedAt": "2026-05-08T12:00:00.000Z",
  "profiles": [],
  "workoutSessions": [],
  "setLogs": [],
  "nutritionLogs": [],
  "bodyLogs": [],
  "weeklyCheckins": [],
  "leaderboardScores": [],
  "settings": {}
}
```

## Règles import

- Vérifier `version`.
- Vérifier que le JSON est valide.
- Ne jamais écraser sans confirmation.
- Proposer mode merge ou replace.
- Refuser un import dont les données critiques sont invalides.

