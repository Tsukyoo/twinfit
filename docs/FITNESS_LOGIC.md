# FITNESS_LOGIC.md — Logique fitness, nutrition, points

## Progression surcharge progressive

### Règle principale

Si toutes les séries d'un exercice atteignent le haut de fourchette reps avec RPE <= 8, proposer une augmentation de charge à la prochaine séance.

### Augmentation recommandée

| Type exercice | Progression |
|---|---:|
| Haltères | +1 à +2 kg |
| Machine standard | +2,5 à +5 kg |
| Presse / Hack Squat | +5 à +10 kg |
| Assisted Pull-Up / Dips | réduire assistance de 5 kg |

### Si RPE > 9

Recommandation :

- garder la charge
- améliorer la technique
- augmenter le repos
- ne pas monter la charge à la prochaine séance

### Si reps chutent fortement

Recommandation :

- garder la charge
- vérifier sommeil/nutrition
- ne pas forcer la progression

### Si douleur

Recommandation :

- noter douleur
- arrêter ou réduire amplitude
- proposer une alternative
- ne pas recommander de progression

## PR

Types de PR :

- meilleur poids sur l'exercice
- meilleur volume sur l'exercice
- meilleure série estimée
- meilleur total séance

Volume d'une série :

```txt
volume = poids * reps
```

Volume exercice :

```txt
somme des volumes de toutes les séries de l'exercice
```

Volume séance :

```txt
somme des volumes de tous les exercices
```

## Nutrition

### Teoman

Objectif : recomposition.

Cibles :

- Calories : 2500 kcal
- Protéines : 160 g
- Lipides : 70-80 g
- Glucides : 270-310 g
- Eau : 2500-3000 ml

Règles :

- Si poids baisse de 0,3 à 0,6 kg/semaine : parfait.
- Si poids ne bouge pas pendant 2 semaines : réduire 100-150 kcal ou ajouter cardio.
- Si force chute : déficit trop agressif.
- Si faim trop haute et énergie basse : surveiller récupération.

### Denizhan

Objectif : prise de masse propre.

Cibles :

- Calories : 2800 kcal
- Si poids ne monte pas après 2 semaines : 3000 kcal
- Protéines : 125-140 g
- Lipides : 70 g
- Glucides : 380-420 g
- Eau : 2500-3000 ml

Règles :

- Si poids ne monte pas pendant 2 semaines : ajouter 150-200 kcal.
- Si poids monte trop vite >2 kg/mois : réduire légèrement.
- Si force monte et poids monte lentement : parfait.
- Cardio minimal.

## Check hebdomadaire

Données à calculer :

- poids moyen
- variation poids vs semaine précédente
- séances faites
- calories moyennes
- protéines moyennes
- sommeil moyen
- énergie moyenne
- respect nutrition
- verdict automatique
- recommandation

## Scoring

| Action | Points |
|---|---:|
| Séance terminée | +50 |
| Série validée | +2 |
| PR exercice | +20 |
| Nutrition respectée | +20 |
| Eau respectée | +10 |
| Check hebdo fait | +30 |
| Semaine complète sans séance manquée | +100 |

## Streaks

### Workout streak

Incrémenter si l'utilisateur termine une séance prévue.

Reset si :

- séance prévue manquée sans rattrapage

### Nutrition streak

Incrémenter si :

- calories proches de la cible
- protéines atteintes
- eau atteinte

Tolérance calories :

- Teoman : ±150 kcal
- Denizhan : ±200 kcal

## Badges sobres

Exemples :

- `Semaine propre`
- `PR validé`
- `Hydratation solide`
- `Régularité`
- `Volume en hausse`

Ne pas rendre le design enfantin.

