# 🎮 Nouveau Graphique : Timeline des Applications

## ✨ **Fonctionnalité Ajoutée**

Un **nouveau graphique Timeline** a été ajouté à l'analyseur AMD qui affiche :

- 📱 **Nom de l'application** en cours d'exécution
- 📊 **Performance FPS** au fil du temps
- ⏰ **Timestamps** de chaque mesure
- 🎯 **Analyse de performance** avec codes couleurs

---

## 🎯 **Ce que Montre le Graphique Timeline**

### 📋 **Informations Affichées**

1. **Header d'Application** 🎮
   - Nom de l'application (ex: NBA2K25, Cyberpunk2077, etc.)
   - Durée de la session de jeu
   - FPS moyen de la session
   - Nombre total d'échantillons

2. **Timeline Interactive** ⏱️
   - Points colorés représentant les FPS à chaque moment
   - Marqueurs temporels (25%, 50%, 75% de la session)
   - Tooltip au survol avec détails complets

3. **Codes Couleurs des Performances** 🌈
   - 🟢 **Vert** : Performance fluide (> 60 FPS)
   - 🟡 **Jaune** : Performance moyenne (30-60 FPS)
   - 🔴 **Rouge** : Performance faible (< 30 FPS)

4. **Statistiques de Performance** 📈
   - % de temps avec performance fluide
   - % de temps avec performance moyenne
   - % de temps avec performance faible

---

## 🚀 **Comment Utiliser le Nouveau Graphique**

### 1. **Activation du Graphique**

```
📊 Panneau de Contrôle des Graphiques
└── [🕐 Timeline App] ← Cliquez ici pour activer/désactiver
```

### 2. **Lecture du Graphique**

- **Axe Horizontal** : Temps de la session (de 00:00 à fin)
- **Axe Vertical** : Niveau de FPS (bas = faible, haut = élevé)
- **Points Colorés** : Chaque point = mesure FPS à un moment donné

### 3. **Interactions**

- **Survol** : Affiche FPS exact, Frame Time, Process, Timestamp
- **Couleurs** : Identification rapide des zones de performance

---

## 📊 **Exemple de Données Affichées**

Avec votre fichier `FPS.Latency.20250629-204513.CSV` :

```
🎮 NBA2K25
📅 Session: 4m 23s | FPS Moyen: 87.5 | Échantillons: 263

Timeline:
00:00 ████████████████████████████████████ 04:23
      🔴🟡🟢🟢🟢🟢🟢🟡🟢🟢🟢🟢🟢🟢🟢

Performance:
✅ 78% Fluide (>60 FPS)
⚠️ 18% Moyenne (30-60 FPS)
❌ 4% Faible (<30 FPS)
```

### **Tooltip au Survol** 💡

```
87.2 FPS | 11.4ms | NBA2K25.exe | 02:15
```

---

## 🎯 **Avantages de ce Graphique**

### 🔍 **Diagnostic de Performance**

- Identifie les **moments problématiques** dans le jeu
- Révèle les **patterns de performance** (début vs fin de session)
- Détecte les **chutes de FPS** soudaines

### 📈 **Analyse Temporelle**

- Voit l'**évolution des performances** au fil du temps
- Comprend les **phases de jeu** (menus vs gameplay intensif)
- Identifie les **zones d'optimisation** nécessaires

### 🎮 **Insight Gaming**

- Compare les **différentes applications/jeux**
- Mesure l'**impact des paramètres graphiques**
- Évalue la **stabilité des performances**

---

## 🛠️ **Données Utilisées**

Le graphique Timeline utilise les colonnes suivantes de `FPS.Latency.CSV` :

| Colonne     | Description          | Exemple                |
| ----------- | -------------------- | ---------------------- |
| `FPS`       | Images par seconde   | `87.2`                 |
| `FrameTime` | Temps par image (ms) | `11.4`                 |
| `Process`   | Application en cours | `NBA2K25.exe`          |
| `Timestamp` | Moment de la mesure  | `02:15` ou auto-généré |

---

## 🎨 **Interface Mise à Jour**

### **Nouveau Panneau de Contrôle**

```
🎛️ Affichage des Graphiques
├── [🕐 Timeline App] ← NOUVEAU
├── [📊 FPS]
├── [🌡️ Températures]
├── [⚡ Consommation]
└── [📈 Utilisation]
```

### **Position du Graphique**

Le graphique Timeline apparaît **en premier** quand activé, avant les autres graphiques, pour donner une vue d'ensemble de la session.

---

## 🎉 **Résultat Final**

Vous avez maintenant **5 graphiques** au total :

1. 🕐 **Timeline App** - Vue d'ensemble temporelle avec nom de l'app
2. 📊 **FPS** - Graphique en barres des performances
3. 🌡️ **Températures** - Suivi thermique GPU/CPU
4. ⚡ **Consommation** - Usage énergétique
5. 📈 **Utilisation** - Charge GPU/CPU/RAM

**Chaque graphique peut être masqué/affiché indépendamment !** 🎛️

---

## 🚀 **Test du Nouveau Graphique**

1. ✅ Uploadez vos fichiers AMD Adrenaline
2. ✅ Cliquez sur "Analyser les Fichiers"
3. ✅ Le graphique Timeline apparaît automatiquement
4. ✅ Survolez les points pour voir les détails
5. ✅ Utilisez le bouton toggle pour masquer/afficher

**L'application affiche maintenant le nom de l'app, les FPS et leur timeline ! 🎮⚡**
