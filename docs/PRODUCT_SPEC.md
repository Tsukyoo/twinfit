# PRODUCT_SPEC.md — Spécification produit

## Vision

Créer une app web/PWA fitness privée pour Teoman et Denizhan, utilisée directement à Basic Fit pendant les séances.

L'app doit remplacer un carnet d'entraînement, un suivi nutrition simple et un dashboard de progression. Elle doit être rapide, mobile-first, sobre et motivante.

## Objectif principal

Permettre à chaque profil de :

- choisir son profil
- voir sa séance du jour
- lancer une séance complète
- suivre exercice par exercice
- entrer poids, reps, séries, RPE et notes
- utiliser un timer de repos
- terminer la séance avec recap
- suivre nutrition, poids, progression et points

## Profils

### Teoman

- Âge : 17 ans
- Taille : 183 cm
- Poids initial : 81 kg
- Objectif : recomposition corporelle
- Calories départ : 2500 kcal
- Protéines : 160 g
- Eau : 2,5 à 3 L
- Cardio : 2 à 3 fois/semaine
- Objectif court terme : 77-79 kg

Priorités :

- garder un physique solide
- perdre un léger gras inutile
- épaules plus larges
- dos plus large
- haut des pecs
- bras dessinés
- taille plus propre

### Denizhan

- Âge : 18 ans
- Taille : 180 cm
- Poids initial : 62 kg
- Objectif : prise de masse propre esthétique
- Calories départ : 2800 kcal
- Calories si stagnation 2 semaines : 3000 kcal
- Protéines : 125-140 g
- Eau : 2,5 à 3 L
- Cardio : minimal
- Objectif : +1 à +1,5 kg/mois

Priorités :

- prendre du poids et du muscle
- épaules plus larges
- dos en V
- haut des pecs
- bras plus gros
- rester propre

## User stories principales

### Profil

En tant qu'utilisateur, je veux choisir Teoman ou Denizhan pour voir uniquement mon programme, mes données et mes objectifs.

### Dashboard

En tant qu'utilisateur, je veux voir rapidement ma séance du jour, mes calories, mon eau, mes protéines, mon poids et mes points.

### En séance

En tant qu'utilisateur, je veux lancer une séance et être guidé exercice par exercice, sans réfléchir au programme.

### Série

En tant qu'utilisateur, je veux entrer rapidement poids, reps, RPE et notes après chaque série.

### Repos

En tant qu'utilisateur, je veux qu'un timer de repos démarre automatiquement après validation d'une série.

### Recap

En tant qu'utilisateur, je veux voir ce que j'ai fait à la fin : volume, durée, séries, PR et points gagnés.

### Progression

En tant qu'utilisateur, je veux voir si je progresse en poids, volume, force et régularité.

### Nutrition

En tant qu'utilisateur, je veux noter calories, protéines, glucides, lipides, eau, faim, énergie et sommeil.

### Check hebdomadaire

En tant qu'utilisateur, je veux un verdict simple chaque semaine pour savoir si je dois ajuster calories, cardio ou charge.

### Classement

En tant qu'utilisateur, je veux comparer mes points avec l'autre profil pour garder la motivation.

### Export/import

En tant qu'utilisateur, je veux sauvegarder mes données en JSON et pouvoir les restaurer.

## Pages obligatoires

1. Home / sélection profil
2. Dashboard
3. Planning
4. En séance
5. Exercices
6. Progression
7. Nutrition
8. Check hebdo
9. Classement
10. Paramètres

## MVP fonctionnel

Le MVP est validé si :

- les deux profils existent
- la séance du jour est détectée
- une séance peut être lancée
- les séries sont sauvegardées après chaque validation
- un recap est généré
- les logs nutrition sont sauvegardés
- les points sont calculés
- export JSON fonctionne
- GitHub Pages fonctionne

## Hors scope V1

- Authentification
- Backend
- Sync cloud
- Notifications push avancées
- IA générative
- Paiement
- Multi-utilisateurs publics
- Coach externe
- App native iOS/Android

