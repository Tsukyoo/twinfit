# TwinFit — README_EXERCISE_MEDIA.md

## Objectif

Ce fichier est la source de vérité pour les previews médias des exercices TwinFit.

Il définit :
- le nom exact de chaque exercice
- l’id technique de chaque exercice
- le fichier GIF attendu
- les fichiers volontairement partagés
- la structure de dossier attendue
- les règles de fallback si un média est absent

Aucune logique de preview ne doit inventer un chemin média.
La source de vérité doit rester `src/data/exercises.ts`, alignée avec ce README.

---

## Structure obligatoire des médias

Tous les GIF doivent être placés dans :

```txt
/public/media/exercises/
```

Les chemins utilisés dans l’app doivent donc être :

```txt
/media/exercises/nom-du-fichier.gif
```

Exemple :

```txt
/media/exercises/incline-db-press.gif
```

---

## Convention de nommage

Tous les fichiers doivent respecter :

- anglais
- kebab-case
- descriptif
- extension `.gif`
- pas d’accents
- pas d’espaces
- pas de noms vagues

Exemples corrects :

```txt
incline-db-press.gif
seated-cable-row.gif
machine-hip-thrust.gif
```

Exemples interdits :

```txt
row.gif
chest.gif
exo1.gif
lateral.gif
machine.gif
```

---

## Mapping complet exercices → GIF

| ID exercice | Nom exercice | Fichier GIF attendu | Chemin app |
|---|---|---|---|
| `db-incline-press` | Développé incliné haltères | `incline-db-press.gif` | `/media/exercises/incline-db-press.gif` |
| `lat-pulldown-neutral` | Tirage vertical prise neutre | `neutral-lat-pulldown.gif` | `/media/exercises/neutral-lat-pulldown.gif` |
| `chest-supported-row` | Rowing poitrine appuyée | `chest-supported-row.gif` | `/media/exercises/chest-supported-row.gif` |
| `shoulder-press-machine` | Shoulder Press machine | `machine-shoulder-press.gif` | `/media/exercises/machine-shoulder-press.gif` |
| `shoulder-press-db` | Shoulder Press haltères assis | `seated-db-shoulder-press.gif` | `/media/exercises/seated-db-shoulder-press.gif` |
| `lateral-raises-db` | Élévations latérales haltères | `db-lateral-raise.gif` | `/media/exercises/db-lateral-raise.gif` |
| `lateral-raises-cable` | Élévations latérales poulie | `cable-lateral-raise.gif` | `/media/exercises/cable-lateral-raise.gif` |
| `lateral-raises-cable-uni` | Élévations latérales poulie unilatérale | `cable-lateral-raise.gif` | `/media/exercises/cable-lateral-raise.gif` |
| `reverse-pec-deck` | Reverse Pec Deck | `reverse-pec-deck.gif` | `/media/exercises/reverse-pec-deck.gif` |
| `curl-incline-db` | Curl incliné haltères | `incline-db-curl.gif` | `/media/exercises/incline-db-curl.gif` |
| `curl-hammer-db` | Curl marteau haltères | `hammer-db-curl.gif` | `/media/exercises/hammer-db-curl.gif` |
| `ez-bar-curl` | Curl barre EZ | `ez-bar-curl.gif` | `/media/exercises/ez-bar-curl.gif` |
| `triceps-rope` | Triceps corde | `rope-tricep-pushdown.gif` | `/media/exercises/rope-tricep-pushdown.gif` |
| `triceps-overhead-rope` | Extension triceps au-dessus tête | `overhead-rope-tricep-extension.gif` | `/media/exercises/overhead-rope-tricep-extension.gif` |
| `face-pull` | Face Pull | `face-pull.gif` | `/media/exercises/face-pull.gif` |
| `seated-cable-row` | Rowing poulie basse | `seated-cable-row.gif` | `/media/exercises/seated-cable-row.gif` |
| `incline-chest-press-machine` | Incline Chest Press machine | `incline-machine-chest-press.gif` | `/media/exercises/incline-machine-chest-press.gif` |
| `cable-crossover-high` | Écartés poulie basse vers haut | `low-to-high-cable-fly.gif` | `/media/exercises/low-to-high-cable-fly.gif` |
| `assisted-pullup` | Tractions assistées | `assisted-pull-up.gif` | `/media/exercises/assisted-pull-up.gif` |
| `assisted-dip` | Dips assistés | `assisted-dips.gif` | `/media/exercises/assisted-dips.gif` |
| `leg-press` | Presse à cuisses | `leg-press.gif` | `/media/exercises/leg-press.gif` |
| `romanian-deadlift` | Romanian Deadlift | `romanian-deadlift.gif` | `/media/exercises/romanian-deadlift.gif` |
| `bulgarian-split-squat` | Bulgarian Split Squat | `bulgarian-split-squat.gif` | `/media/exercises/bulgarian-split-squat.gif` |
| `leg-curl` | Leg Curl | `leg-curl.gif` | `/media/exercises/leg-curl.gif` |
| `leg-extension` | Leg Extension | `leg-extension.gif` | `/media/exercises/leg-extension.gif` |
| `calf-press` | Mollets presse | `calf-press.gif` | `/media/exercises/calf-press.gif` |
| `hack-squat` | Hack Squat | `hack-squat.gif` | `/media/exercises/hack-squat.gif` |
| `hip-thrust` | Hip Thrust machine | `machine-hip-thrust.gif` | `/media/exercises/machine-hip-thrust.gif` |
| `crunch-cable` | Crunch câble | `cable-crunch.gif` | `/media/exercises/cable-crunch.gif` |
| `hanging-knee-raise` | Relevés de genoux | `hanging-knee-raise.gif` | `/media/exercises/hanging-knee-raise.gif` |
| `plank` | Gainage planche | `plank.gif` | `/media/exercises/plank.gif` |
| `treadmill-incline` | Tapis incliné | `incline-treadmill.gif` | `/media/exercises/incline-treadmill.gif` |

---

## GIF partagé volontairement

Un seul fichier GIF est volontairement partagé :

```txt
cable-lateral-raise.gif
```

Utilisé par :

| Exercice | ID |
|---|---|
| Élévations latérales poulie | `lateral-raises-cable` |
| Élévations latérales poulie unilatérale | `lateral-raises-cable-uni` |

Raison :
Le mouvement est suffisamment proche visuellement pour partager une preview V1.

Tous les autres exercices doivent avoir leur propre fichier GIF.

---

## Liste complète des fichiers GIF uniques à fournir

```txt
incline-db-press.gif
neutral-lat-pulldown.gif
chest-supported-row.gif
machine-shoulder-press.gif
seated-db-shoulder-press.gif
db-lateral-raise.gif
cable-lateral-raise.gif
reverse-pec-deck.gif
incline-db-curl.gif
hammer-db-curl.gif
ez-bar-curl.gif
rope-tricep-pushdown.gif
overhead-rope-tricep-extension.gif
face-pull.gif
seated-cable-row.gif
incline-machine-chest-press.gif
low-to-high-cable-fly.gif
assisted-pull-up.gif
assisted-dips.gif
leg-press.gif
romanian-deadlift.gif
bulgarian-split-squat.gif
leg-curl.gif
leg-extension.gif
calf-press.gif
hack-squat.gif
machine-hip-thrust.gif
cable-crunch.gif
hanging-knee-raise.gif
plank.gif
incline-treadmill.gif
```

Total : **31 fichiers GIF uniques**.

---

## Champs attendus dans `exercises.ts`

Chaque exercice doit avoir au minimum :

```ts
{
  id: string;
  name: string;
  machineName: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  imageUrl: string;
  videoUrl: string;
}
```

Exemple :

```ts
{
  id: 'db-incline-press',
  name: 'Développé incliné haltères',
  machineName: 'Banc incliné + haltères',
  primaryMuscles: ['Pectoraux haut', 'Épaules avant'],
  secondaryMuscles: ['Triceps'],
  imageUrl: '/media/exercises/incline-db-press.gif',
  videoUrl: '/media/exercises/incline-db-press.gif'
}
```

---

## Règles de fallback

Si le fichier GIF n’existe pas ou ne charge pas :

Afficher un placeholder premium avec :
- fond gris clair / gradient Apple Fitness
- icône `Dumbbell`
- nom de l’exercice
- nom de la machine
- muscles ciblés

Ne jamais afficher :
- image cassée
- bloc vide
- écran noir
- alt vide

---

## Règles UI preview

Les previews doivent respecter :

```txt
aspect-video
rounded-[28px] ou rounded-[32px]
overflow-hidden
object-cover
bg-[#f5f5f7]
```

La preview doit être visible :
- dans le mode “En séance”
- dans la fiche exercice
- au clic sur un exercice depuis Séances / Planning

---

## Interdictions

- ne pas modifier les IDs exercices
- ne pas modifier les programmes d’entraînement
- ne pas hardcoder les chemins médias dans les composants
- ne pas créer plusieurs sources de vérité
- ne pas utiliser un GIF incohérent pour un autre exercice
- ne pas casser l’affichage si le média est absent