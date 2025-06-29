# 🎮 Démonstration - Analyseur de Logs AMD

Ce guide vous montre comment utiliser l'Analyseur de Logs AMD avec les fichiers d'exemple fournis.

## 📁 Fichiers de Démonstration

Dans le dossier `/log` vous trouverez des fichiers de logs réels générés par AMD Adrenaline lors d'une session de jeu NBA 2K25 :

- **`FPS.Latency.20250629-204513.CSV`** (1.3MB) - Données de performance FPS/Latency
- **`Hardware.20250629-204519.CSV`** (636KB) - Métriques matérielles détaillées

## 🚀 Test de l'Application

### 1. Lancer l'Application

```bash
cd amd-log-analyzer
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### 2. Upload des Fichiers de Démonstration

1. **Fichier FPS/Latency** :
   - Cliquez sur la carte "Fichier FPS/Latency"
   - Sélectionnez `../log/FPS.Latency.20250629-204513.CSV`
   - ✅ Le fichier devrait être reconnu avec une icône verte

2. **Fichier Hardware** :
   - Cliquez sur la carte "Fichier Hardware"
   - Sélectionnez `../log/Hardware.20250629-204519.CSV`
   - ✅ Le fichier devrait être reconnu avec une icône verte

### 3. Lancement de l'Analyse

1. Cliquez sur **"Analyser les Fichiers"**
2. ⏳ L'application traite les données (~17k échantillons FPS, ~4k échantillons Hardware)
3. 📊 Les résultats s'affichent automatiquement

## 📈 Résultats Attendus

### Métriques Résumées

- **FPS Moyen** : ~150-180 FPS (performance excellente)
- **Température Max GPU** : ~70°C (température acceptable)
- **Consommation Moyenne GPU** : ~180-200W
- **Utilisation Moyenne CPU** : ~50-60%

### Graphiques Générés

#### 🎯 Performance FPS

- **Données** : 17,055 points de données
- **Jeu** : NBA2K25.exe (DirectX 12)
- **Tendance** : Performance stable avec quelques chutes ponctuelles
- **Frame Time** : Corrélation inversée avec les FPS

#### 🌡️ Températures

- **GPU Temp** : Courbe stable autour de 48-55°C
- **GPU Hotspot** : 10-15°C au-dessus de la température GPU
- **CPU Temp** : Variations entre 63-75°C
- **GPU Memory** : Stable autour de 66-70°C

#### ⚡ Consommation

- **GPU Power** : Variations importantes selon l'activité (75-230W)
- **CPU Power** : Plus stable (35-60W)
- **Corrélation** : Pics de consommation GPU = baisse temporaire des FPS

#### 📊 Utilisation

- **GPU Util** : Haute utilisation (80-99%) = bonne optimisation
- **CPU Util** : Modérée (40-90%) = pas de goulot d'étranglement
- **System Memory** : ~20% (utilisation normale)
- **GPU Memory** : ~6-8GB utilisés

## 🔍 Points d'Analyse Intéressants

### Événements Notables dans les Données

**Minute 19:33:40** - Chute de performance importante :

- FPS passe de ~190 à ~65 FPS
- GPU Power chute à 77W
- Micro stuttering élevé (37%)
- → Probablement un changement de scène ou menu

**Minute 19:34:12** - Pic de performance :

- FPS monte à ~230 FPS
- GPU Power pic à 230W
- Puis retour à ~80 FPS (limitation 99th percentile)
- → Menu ou écran de chargement

**Session globale** :

- Jeu stable en DirectX 12
- Températures bien maîtrisées
- Performance GPU excellente
- Pas de throttling thermique

## 🛠️ Fonctionnalités à Tester

### 1. Changement de Thème

- Testez les thèmes : Dark, Cyberpunk, Synthwave
- Vérifiez que les graphiques s'adaptent

### 2. Filtrage Temporel

- Activez "Filtrer par Temps"
- Analysez une période spécifique (ex: 19:33:30 - 19:34:00)
- Observez comment les métriques se recalculent

### 3. Export des Données

- **Export JSON** : Télécharge l'analyse complète
- **Rapport Texte** : Génère un résumé des performances

### 4. Interface Responsive

- Testez sur différentes tailles d'écran
- Vérifiez la mise en page des graphiques

## 🎨 Personnalisation

### Modification des Couleurs de Graphiques

Éditez les fichiers dans `/components/` pour personnaliser :

- Couleurs des courbes
- Échelles des axes
- Types de graphiques (line, bar, area)

### Ajout de Nouvelles Métriques

Les données CSV contiennent d'autres colonnes exploitables :

- `GPU FAN` - Vitesse des ventilateurs
- `GPU VOLTAGE` - Voltage GPU
- `CPU EDC/TDC` - Métriques AMD spécifiques
- `MICRO STUTTER` - Analyse du stuttering

## 🐛 Problèmes Courants

### Fichiers Non Reconnus

- ✅ Vérifiez l'extension `.csv`
- ✅ Vérifiez que les en-têtes correspondent au format AMD Adrenaline
- ✅ Taille de fichier raisonnable (< 50MB)

### Performance Lente

- Les fichiers de démo sont volumineux (~17k échantillons)
- L'application limite à 100 échantillons pour l'affichage
- Pour l'analyse complète, augmentez la limite dans le code

### Graphiques Vides

- Vérifiez que les données ne sont pas toutes à "N/A"
- Certaines colonnes peuvent être vides selon le matériel

## 🚀 Prochaines Étapes

Avec cette démonstration réussie, vous pouvez :

1. Tester vos propres fichiers AMD Adrenaline
2. Personnaliser l'interface selon vos besoins
3. Ajouter de nouvelles fonctionnalités d'analyse
4. Comparer différentes sessions de jeu

---

🎉 **Félicitations !** Vous avez maintenant un outil professionnel pour analyser vos performances gaming AMD !
