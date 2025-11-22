# JustStreamIt - Frontend

## Architecture du code

### 📁 Structure des fichiers

```
front/
├── index.html           # Page HTML principale
├── style.css            # Styles CSS de l'application
└── scripts/
    ├── main.js          # Point d'entrée principal
    ├── api.js           # Gestion des appels API
    ├── categories.js    # Gestion des catégories de films
    ├── ui-components.js # Création des composants UI
    └── modal.js         # Gestion de la modale de détails
```

### 📦 Description des modules

#### **main.js**
Point d'entrée de l'application. Orchestre l'initialisation :
- Charge le meilleur film
- Initialise toutes les catégories
- Lance l'application au chargement du DOM

#### **api.js**
Gère toutes les communications avec l'API backend :
- `fetchGenres()` : Récupère tous les genres disponibles
- `fetchMovies()` : Récupère les films avec filtres et pagination
- `fetchMovieDetails()` : Récupère les détails complets d'un film

#### **ui-components.js**
Crée et configure les composants visuels :
- `createMovieCard()` : Génère une carte de film
- `createGenreDropdown()` : Crée un sélecteur de genre
- `updateBestMovieDisplay()` : Met à jour l'affichage du meilleur film
- Gestion des images avec fallback en cas d'erreur

#### **categories.js**
Gère l'affichage des catégories de films :
- `displayCategoryMovies()` : Affiche les films d'une catégorie
- `createFixedCategory()` : Crée une catégorie avec titre fixe
- `createDropdownCategory()` : Crée une catégorie avec sélecteur de genre
- `initializeCategories()` : Initialise toutes les catégories

#### **modal.js**
Gère la modale de détails des films :
- Affichage des informations complètes (synopsis, acteurs, réalisateurs, etc.)
- Gestion de l'ouverture et fermeture
- Formatage des données (box office, durée, etc.)
- Support de la touche Échap pour fermer

### 🔄 Flux de données

```
1. Chargement de la page (index.html)
   ↓
2. main.js s'initialise
   ↓
3. Appel à api.js pour récupérer les données
   ↓
4. ui-components.js crée les éléments visuels
   ↓
5. categories.js organise l'affichage
   ↓
6. modal.js gère les interactions utilisateur
```

### 🎯 Principes de conception

1. **Séparation des responsabilités** : Chaque module a une fonction claire et unique
2. **Modularité** : Code organisé en modules ES6 réutilisables
3. **Maintenabilité** : Noms explicites et commentaires détaillés
4. **Évolutivité** : Architecture facilitant l'ajout de nouvelles fonctionnalités

### 🚀 Utilisation

Ouvrir simplement `index.html` dans un navigateur avec le backend API en cours d'exécution sur `http://127.0.0.1:8000`.

Les scripts se chargeront automatiquement et initialiseront l'application.
