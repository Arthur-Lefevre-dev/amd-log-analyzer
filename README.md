# 🚀 Analyseur de Logs AMD Adrenaline

Une application web moderne construite avec **Nuxt 3**, **Tailwind CSS** et **DaisyUI** pour analyser et visualiser les données de performance générées par AMD Adrenaline.

## ✨ Fonctionnalités

- 📁 **Upload de fichiers** : Glisser-déposer ou sélection manuelle des fichiers CSV
- 📊 **Visualisation graphique** : Graphiques interactifs pour les performances et métriques matérielles
- 🔧 **Analyse détaillée** : Statistiques automatiques (FPS moyen, températures, consommation)
- 🎨 **Interface moderne** : Design responsive avec plusieurs thèmes disponibles
- 📈 **Comparaison de données** : Outils pour comparer différentes sessions
- 💾 **Export des données** : Sauvegarde des analyses et génération de rapports
- ⏱️ **Filtrage temporel** : Analyse par périodes spécifiques

## 🛠️ Technologies Utilisées

- **Nuxt 3** - Framework Vue.js full-stack
- **Tailwind CSS** - Framework CSS utilitaire
- **DaisyUI** - Composants UI basés sur Tailwind
- **Chart.js** - Bibliothèque de graphiques
- **PapaParse** - Parser CSV côté client

## 📦 Installation

1. **Cloner le projet**

```bash
git clone https://github.com/votre-username/amd-log-analyzer.git
cd amd-log-analyzer
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Lancer en mode développement**

```bash
npm run dev
```

4. **Ouvrir l'application**
   Rendez-vous sur [http://localhost:3000](http://localhost:3000)

## 📋 Utilisation

### 1. Génération des logs avec AMD Adrenaline

1. Ouvrez **AMD Adrenaline**
2. Allez dans **Performance** > **Metrics**
3. Activez l'enregistrement des métriques
4. Lancez votre jeu/application
5. Arrêtez l'enregistrement après votre session

Vous obtiendrez deux fichiers :

- `FPS.Latency.YYYYMMDD-HHMMSS.CSV` - Données de performance gaming
- `Hardware.YYYYMMDD-HHMMSS.CSV` - Métriques matérielles

### 2. Analyse dans l'application

1. **Upload des fichiers** :
   - Glissez-déposez ou cliquez pour sélectionner vos fichiers CSV
   - Un fichier pour les FPS/Latency et un pour le Hardware

2. **Lancement de l'analyse** :
   - Cliquez sur "Analyser les Fichiers"
   - L'application traite automatiquement les données

3. **Visualisation** :
   - **Métriques résumées** : FPS moyen, température max, consommation
   - **Graphique FPS** : Performance en temps réel avec frame time
   - **Graphique Températures** : GPU, CPU, mémoire GPU
   - **Graphique Consommation** : Power draw GPU et CPU
   - **Graphique Utilisation** : Charge GPU/CPU et utilisation mémoire

4. **Outils de comparaison** :
   - **Filtrage temporel** : Analyser une période spécifique
   - **Export JSON** : Sauvegarder les données analysées
   - **Rapport texte** : Générer un résumé des performances

## 📊 Types de Données Analysées

### Fichier FPS/Latency

- **FPS** : Images par seconde
- **Frame Time** : Temps moyen par frame (ms)
- **99th% FPS** : Percentile 99 des FPS
- **Micro Stutter** : Pourcentage de micro-stuttering
- **Process** : Application/jeu analysé
- **Graphics API** : DirectX 11/12, Vulkan, etc.

### Fichier Hardware

- **GPU** : Utilisation, fréquences, températures, consommation, ventilateurs
- **CPU** : Utilisation, fréquences, températures, consommation
- **Mémoire** : Utilisation système et GPU

## 🎨 Thèmes Disponibles

L'application propose plusieurs thèmes via DaisyUI :

- **Light** - Thème clair classique
- **Dark** - Thème sombre moderne
- **Cyberpunk** - Style futuriste néon
- **Synthwave** - Ambiance rétro 80s
- **Retro** - Look vintage

## 🔧 Configuration

### Personnalisation des graphiques

Les graphiques peuvent être personnalisés en modifiant les composants dans `/components/` :

- `FpsChart.vue` - Graphique de performance
- `TemperatureChart.vue` - Graphique de températures
- `PowerChart.vue` - Graphique de consommation
- `UtilizationChart.vue` - Graphique d'utilisation

### Ajout de nouveaux thèmes

Modifiez `nuxt.config.ts` pour ajouter des thèmes DaisyUI :

```typescript
daisyui: {
  themes: ["light", "dark", "votre-theme-custom"];
}
```

## 🚀 Build de Production

```bash
# Build pour production
npm run build

# Prévisualisation du build
npm run preview
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🐛 Support

Si vous rencontrez des problèmes ou avez des questions :

- Ouvrez une issue sur GitHub
- Consultez la documentation AMD Adrenaline
- Vérifiez que vos fichiers CSV sont au bon format

## 🔮 Roadmap

- [ ] Support des fichiers FrameTime additionnels
- [ ] Comparaison multi-sessions
- [ ] Alertes de performance
- [ ] Export vers d'autres formats (Excel, PDF)
- [ ] Mode hors ligne PWA
- [ ] Intégration API AMD
- [ ] Benchmarking automatique

---

Développé avec ❤️ pour la communauté AMD
