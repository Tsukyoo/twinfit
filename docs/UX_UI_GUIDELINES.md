# UX_UI_GUIDELINES.md

# TwinFit — UX/UI Guidelines

## 1. Direction visuelle finale

TwinFit doit avoir une direction visuelle inspirée de :

- Apple Fitness
- iOS Health / Activity
- Apple Liquid Glass
- interfaces mobiles blanches, propres, premium
- cartes arrondies, aérées, lisibles
- anneaux d’activité
- gradients sobres par profil
- navigation flottante façon iOS

L’app ne doit plus partir sur un dark mode dominant en V1.

La direction V1 est :

```txt
Light premium by default
Fond gris très clair iOS
Cartes blanches/translucides
Accents colorés par profil
Anneaux d’activité
Typographie large, claire, très lisible
Navigation mobile flottante
```

Le dark mode pourra exister en V2, mais ne doit pas guider le design initial.

---

## 2. Objectif UX principal

L’app doit être utilisable pendant une vraie séance à Basic Fit.

Priorités :

1. ouvrir vite l’app
2. choisir profil
3. voir la séance du jour
4. lancer séance
5. valider les séries rapidement
6. voir timer repos
7. finir séance
8. consulter recap/progression

L’utilisateur est en salle, sur téléphone, parfois fatigué, pressé, avec une main occupée.  
Donc l’interface doit être très claire, tactile, rapide et sans surcharge.

---

## 3. Principes UX non négociables

### 3.1 Mobile-first strict

L’app est pensée d’abord pour mobile.

Largeur cible :

```txt
max-width: 430px à 480px
centrée sur desktop
fond global gris clair
container mobile blanc/gris iOS
```

Desktop ne doit pas transformer l’app en dashboard complexe.  
Sur desktop, afficher simplement l’app centrée dans un cadre mobile premium.

---

### 3.2 Un écran = une intention

Chaque écran doit avoir une action principale évidente.

Exemples :

- Profil : choisir Teoman ou Denizhan
- Dashboard : lancer séance ou consulter résumé
- En séance : valider une série
- Nutrition : saisir calories/macros/eau
- Progression : comprendre évolution
- Classement : comparer les points
- Settings : gérer export/import

À éviter :

- trop de boutons primaires
- cartes inutiles
- textes longs
- menus profonds
- composants gadget

---

### 3.3 Gros boutons tactiles

Taille minimale recommandée :

```txt
bouton principal : 52px à 60px de hauteur
bouton secondaire : 44px minimum
input en séance : 64px+ de hauteur
zone cliquable icône : 44px minimum
```

Les boutons principaux doivent être faciles à toucher pendant l’effort.

---

### 3.4 Feedback immédiat

Chaque action importante doit produire un retour visuel.

Exemples :

- série validée → check + animation légère
- timer lancé → carte repos visible
- PR détecté → badge sobre
- nutrition complétée → anneau mis à jour
- export réussi → toast court

Ne jamais laisser l’utilisateur se demander si l’action a fonctionné.

---

## 4. Palette couleur

### 4.1 Fond global

```txt
App background: #f5f5f7
Surface: #ffffff / rgba(255,255,255,0.80)
Muted surface: #f2f2f7
Border: rgba(255,255,255,0.65)
Text main: #111827 / #1d1d1f
Text secondary: #6b7280 / #8e8e93
Text muted: #a1a1aa
```

Fond principal :

```css
background: #f5f5f7;
```

Le design doit respirer, avec beaucoup d’espace blanc.

---

### 4.2 Couleurs système Apple-like

Utiliser des couleurs proches des systèmes iOS :

```txt
Red / Calories: #ff3b30
Green / Success / Hydration complete: #34c759
Blue / Water / Action: #007aff ou #32ade6
Purple / Protein: #af52de
Orange / Energy / Denizhan: #ff9500
Yellow / Trophy: #ffcc00
Gray: #8e8e93
```

---

### 4.3 Couleurs profil

Chaque profil doit avoir une identité simple.

#### Denizhan

Objectif : prise de masse propre, énergie, force.

```txt
Gradient: from-orange-400 to-red-500
Primary accent: #ff3b30
Secondary accent: #ff9500
```

Utilisation :
- bouton “Lancer séance”
- avatar initiale
- highlights du profil
- courbe principale

#### Teoman

Objectif : recomposition, définition, physique propre.

```txt
Gradient: from-blue-400 to-cyan-500
Primary accent: #34c759
Secondary accent: #32ade6
```

Utilisation :
- bouton “Lancer séance”
- avatar initiale
- highlights du profil
- courbe principale

Attention : ne pas utiliser trop de couleurs en même temps.  
Les couleurs profil servent surtout aux accents, pas au fond entier de l’app.

---

## 5. Typographie

### 5.1 Police recommandée

Utiliser la stack système Apple :

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "SF Pro Display",
  "SF Pro Text",
  Inter,
  system-ui,
  sans-serif;
```

Ne pas importer trop de fonts.

---

### 5.2 Hiérarchie

```txt
Page title: 36px à 44px, font-bold, tracking-tight
Section title: 20px à 24px, font-bold
Card title: 18px à 22px, font-bold
Body: 15px à 17px
Label: 10px à 12px, uppercase, font-bold, tracking-wider
Metric value: 28px à 42px selon contexte
```

Exemples :

```txt
Résumé
Séance du jour
Activité journalière
Évolution poids
Le Duel
En séance
```

Titres courts.  
Pas de paragraphes marketing.

---

## 6. Layout global

### 6.1 Structure mobile

```txt
body
  background gris clair
  app-shell max-w-md
    sticky header
    main scrollable
    floating bottom nav
```

Sur desktop :

```txt
fond extérieur gris
app mobile centrée
ombre légère ou cadre premium
```

---

### 6.2 Header

Header sticky style iOS :

```txt
height: 64px environ
background: white/60
backdrop-blur-xl
border-bottom subtil
avatar profil à gauche
nom profil
bouton “Changer” à droite
```

Le header doit rester visible hors mode séance.

---

### 6.3 Bottom navigation

Navigation principale flottante façon Liquid Glass.

Style :

```txt
position: fixed/absolute bottom
left/right 24px
background white/80
backdrop-blur-2xl
border white/50
rounded-[32px]
shadow soft
padding 8px
```

Tabs V1 recommandées :

1. Résumé
2. Séance / Planning
3. Nutrition
4. Progression
5. Duel

Sur petits écrans, limiter à 4 ou 5 icônes max.

Chaque tab :

```txt
icône Lucide
label 10-11px
état actif avec fond gris clair
couleur active = couleur profil
état inactif = gris + opacité
```

---

## 7. Composants UI standards

### 7.1 AppleCard

Carte principale réutilisable.

Style :

```txt
background: white/80
backdrop-blur-xl
border: 1px solid white
border-radius: 28px à 32px
shadow très douce
overflow hidden
```

Tailwind reference :

```txt
bg-white/80 backdrop-blur-xl rounded-[28px]
shadow-[0_8px_32px_rgba(0,0,0,0.04)]
border border-white overflow-hidden
```

Interaction :

```txt
active:scale-95
transition-all duration-200
```

Ne pas mettre des ombres noires fortes partout.

---

### 7.2 ActivityRing

Composant obligatoire pour :

- calories
- protéines
- eau
- progression séance
- streak éventuellement

Structure :

```txt
anneau SVG
fond anneau couleur à 20-30% d’opacité
progression couleur pleine
icône au centre
valeur sous l’anneau
label uppercase sous valeur
```

Règles :

```txt
progression clampée entre 0 et 100
animation douce 800-1000ms
strokeLinecap round
```

Couleurs :

```txt
Calories: #ff3b30
Protéines: #af52de
Eau: #32ade6
Succès: #34c759
```

---

### 7.3 PrimaryActionCard

Carte d’action principale du dashboard.

Exemple :

```txt
Gradient profil
Titre : Lancer l’entraînement
Nom séance : Upper A / Lower A
Bouton play rond
Effet lumière/blobs très subtils
```

Style :

```txt
rounded-[32px]
p-8
bg-gradient-to-br profileGradient
text-white
shadow soft
```

Action :

```txt
tap → lance séance du jour
```

---

### 7.4 MetricCard

Carte statistique rapide.

Contenu :

```txt
label
valeur
sous-texte
icône optionnelle
variation optionnelle
```

Exemples :

- Poids actuel
- Points semaine
- Streak
- Volume semaine
- Séances faites

---

### 7.5 FloatingCTA

Bouton principal flottant si nécessaire.

Utiliser avec modération.  
Ne pas concurrencer la bottom navigation.

---

## 8. Écran sélection profil

Objectif : entrée simple et premium.

Structure :

```txt
logo app / icône Activity
nom app : TwinFit
subtitle court : L’expérience fitness exclusive.
cards profils Teoman / Denizhan
```

Chaque carte profil :

```txt
avatar rond avec gradient
nom
objectif court
chevron
```

Exemple d’objectif :

```txt
Denizhan — Prise de masse propre
Teoman — Recomposition & définition
```

Interaction :

```txt
tap profil → sauvegarde localStorage → dashboard
```

Règle :
Ne pas afficher toutes les statistiques dès l’écran profil.  
L’écran doit rester simple.

---

## 9. Dashboard

Objectif : voir l’état du jour et lancer vite la séance.

Ordre recommandé :

1. Header sticky profil
2. Titre “Résumé”
3. Focus du profil
4. Carte “Lancer l’entraînement”
5. Activité journalière avec anneaux
6. Stats rapides
7. Évolution poids
8. Prochaine séance
9. Mini leaderboard optionnel

---

### 9.1 Carte lancement séance

Contenu :

```txt
Lancer l’entraînement
Nom séance du jour
Nombre d’exercices
Durée estimée
Play button
```

Doit être la carte la plus visible.

---

### 9.2 Activité journalière

Afficher 3 anneaux :

```txt
Calories
Protéines
Eau
```

Chaque anneau :

```txt
valeur actuelle
objectif
progression
icône
```

Exemple :

```txt
2950 kcal / 3200
175g / 180
2.8L / 3.5
```

---

### 9.3 Évolution poids

Graphique simple :

- ligne fluide
- points propres
- pas trop d’axes visibles
- tooltip arrondi
- couleur = accent profil

Si Recharts est utilisé :

```txt
ResponsiveContainer
LineChart
CartesianGrid horizontal seulement
XAxis minimal
YAxis minimal
Tooltip custom ou style arrondi
Line strokeWidth 4
```

---

## 10. Mode “En séance”

C’est l’écran le plus important de l’app.

Objectif :
L’utilisateur doit pouvoir valider une série en moins de 5 secondes.

---

### 10.1 Structure écran

```txt
header sticky
  Fermer
  En Séance
  vide ou timer global

main scrollable
  vidéo/placeholder
  nom exercice
  machine Basic Fit
  série actuelle
  inputs poids / reps / RPE
  bouton Valider série
  technique courte
  erreurs fréquentes
  navigation exercice précédent/suivant

bottom optional
  action principale fixe si utile
```

---

### 10.2 Header session

Style :

```txt
bg-white/70
backdrop-blur-md
border-bottom gray subtle
```

Actions :

```txt
Fermer
Titre En Séance
```

Attention :
Fermer ne doit pas supprimer la séance.  
Fermer = quitter l’écran, session sauvegardée.

---

### 10.3 Placeholder vidéo

Tant que les vidéos ne sont pas disponibles :

```txt
aspect-video
gradient gris clair
rounded-[32px]
play button central
badge machine en bas gauche
```

Le badge machine :

```txt
bg-white/60
backdrop-blur-md
rounded-2xl
icône info
texte uppercase
```

Ne pas bloquer le développement à cause des vidéos.

---

### 10.4 Exercice actuel

Afficher :

```txt
Nom exercice en très gros
Muscles ciblés en chips
Série X sur Y
Objectif reps
Repos prévu
```

Exemple :

```txt
Développé incliné haltères
Haut pecs · épaules avant · triceps
Série 2 sur 4
Objectif : 6-10 reps
Repos : 120s
```

---

### 10.5 Inputs série

Les inputs doivent être très grands.

Champs obligatoires :

```txt
Poids kg
Répétitions
RPE
```

Design :

```txt
grid 2 colonnes pour poids/reps
RPE en dessous ou slider compact
fond gris très clair
rounded-2xl
valeur grande
label petit uppercase
```

Recommandation :

```txt
Poids: input number
Reps: input number
RPE: segmented control 6 / 7 / 8 / 9 / 10 ou slider
```

Ne pas utiliser de petits champs classiques.

---

### 10.6 Bouton valider série

Bouton principal :

```txt
largeur 100%
hauteur 56px
gradient profil
texte blanc
icône CheckCircle2
rounded-2xl
```

Texte :

```txt
Valider la série
```

Après validation :

- sauvegarde IndexedDB
- ajoute points
- déclenche timer repos
- passe à la série suivante après timer ou skip

---

### 10.7 Timer repos

Timer repos doit remplacer visuellement le formulaire ou être affiché très clairement.

Carte repos :

```txt
AppleCard
fond bleu très clair
icône Timer
texte “Repos en cours”
compteur grand
boutons Pause / Passer
```

Le timer ne doit pas être un simple petit texte.

---

### 10.8 Fin exercice / fin séance

À la fin d’un exercice :

```txt
animation check légère
passage exercice suivant
résumé mini : séries faites / volume
```

À la fin séance :

```txt
écran success
icône check dans gradient profil
titre “Séance terminée”
points gagnés
bouton “Voir le recap”
```

---

## 11. Recap séance

Objectif :
Donner un sentiment de progression réel.

Afficher :

```txt
durée totale
volume total
séries faites
exercices complétés
PR détectés
points gagnés
note séance
comparaison dernière séance
```

Style :

- gros header success
- cards stats
- PR en badges sobres
- pas de confettis enfantins

---

## 12. Nutrition

Objectif :
Saisie rapide et retour clair.

Structure :

```txt
titre Nutrition
anneaux calories/protéines/eau
formulaire macros
repas/note libre
faim énergie sommeil
respect plan oui/non
tips personnalisés
```

UX :

```txt
inputs grands
barres progression
bouton enregistrer sticky si formulaire long
```

Couleurs :

```txt
Calories red
Protéines purple
Eau blue
```

---

## 13. Progression

Objectif :
Comprendre si le plan marche.

Sections :

```txt
Poids corporel
Volume semaine
PR récents
Historique exercices
Suggestions prochaines charges
```

Charts :

- simples
- lisibles
- peu d’axes
- couleur profil
- tooltips arrondis

Ne pas afficher 10 graphiques en même temps.  
Priorité V1 :

1. poids corporel
2. volume semaine
3. calories/protéines

---

## 14. Classement / Duel

Objectif :
Motiver Teoman et Denizhan sans gamification enfantine.

Nom d’écran recommandé :

```txt
Le Duel
```

Contenu :

```txt
classement semaine
points total
streak
badges sobres
progress bar comparative
```

Style :

- cartes AppleCard
- avatar gradient
- trophée seulement pour premier
- progress bar colorée
- pas de mascotte
- pas d’effets arcade

Texte possible :

```txt
Qui dominera cette semaine ?
```

---

## 15. Settings

Objectif :
Contrôle simple.

Sections :

```txt
Profil actif
Préférences UI
Export JSON
Import JSON
Backup local
Reset profil
Version app
```

Danger zone :

```txt
Reset profil
Reset toutes données
```

Toute suppression doit demander confirmation.

---

## 16. Animations

Animations autorisées :

```txt
fade-in
slide-in-from-bottom
scale active button
progress ring animation
chart line animation
timer pulse léger
```

Durées :

```txt
150-200ms interaction
300-500ms screen transition
800-1000ms ring progress
```

À éviter :

- animations trop longues
- effets 3D
- parallaxe
- confettis excessifs
- transitions qui ralentissent la séance

---

## 17. Iconographie

Utiliser Lucide React.

Icônes recommandées :

```txt
Activity
Dumbbell
Play
CheckCircle2
Timer
Trophy
Flame
Beef
Droplets
TrendingUp
Calendar
Settings
Info
ChevronRight
X
Plus
Minus
Download
Upload
RotateCcw
```

Règle :
Une icône doit aider à comprendre, pas décorer gratuitement.

---

## 18. Copywriting UI

Ton :

```txt
court
direct
premium
motivant mais sobre
```

Exemples bons :

```txt
Résumé
Lancer l’entraînement
En séance
Valider la série
Repos en cours
Séance terminée
Voir le recap
Le Duel
Progression
Objectif atteint
```

À éviter :

```txt
Bravo champion !!!
Tu es une machine !!!
Explose tout !!!
Mode guerrier activé !!!
```

L’app doit rester mature.

---

## 19. États vides

Chaque page doit avoir un empty state propre.

Exemples :

### Pas encore de séance

```txt
Aucune séance enregistrée.
Lance ta première séance pour voir ta progression.
Bouton : Lancer séance
```

### Pas encore de nutrition

```txt
Aucune donnée nutrition aujourd’hui.
Ajoute tes calories, protéines et eau pour suivre ton plan.
Bouton : Ajouter nutrition
```

### Pas encore de progression

```txt
Pas encore assez de données.
Après quelques séances, ta progression apparaîtra ici.
```

---

## 20. Accessibilité

Obligatoire :

```txt
contraste suffisant
boutons 44px minimum
labels visibles
focus states
aria-label sur boutons icônes
pas d’information uniquement par couleur
```

Les gradients doivent rester lisibles.

---

## 21. Erreurs UX à éviter

Interdit :

- dark mode dominant en V1
- dashboard trop chargé
- cartes trop petites
- inputs minuscules
- navigation trop profonde
- design générique SaaS
- design gaming
- animations gadget
- formulaires longs pendant la séance
- suppression data sans confirmation
- graphiques illisibles
- dépendre des vidéos pour avancer
- cacher le bouton “Valider série”
- timer repos discret
- routes non compatibles GitHub Pages

---

## 22. Références d’implémentation UI

Les composants clés à créer en Phase 2/4 :

```txt
AppShell
MobileFrame
Header
BottomNav
AppleCard
ActivityRing
ProfileAvatar
PrimaryWorkoutCard
MetricCard
ProgressChartCard
WorkoutVideoPlaceholder
SetInputCard
RestTimerCard
LeaderboardCard
```

---

## 23. Direction finale à respecter

TwinFit doit ressembler à une app iOS fitness privée, pas à un dashboard web classique.

Le ressenti cible :

```txt
simple
clair
blanc
premium
fluide
tactile
motivant
très lisible en salle
```

La meilleure version de l’app est celle qui donne envie de l’ouvrir avant chaque séance, sans friction.
