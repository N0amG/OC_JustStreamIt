/**
 * Module de gestion des catégories de films
 * Gère l'affichage et la mise à jour des différentes catégories
 */

import { fetchMovies, fetchGenres } from './api.js';
import { createMovieCard, createGenreDropdown } from './ui-components.js';

/**
 * Récupère plusieurs pages de films et les combine
 * @param {number} movieCount - Nombre total de films à récupérer
 * @param {string} queryParams - Paramètres de requête (ex: 'genre=Action&sort_by=-imdb_score')
 * @returns {Promise<Array>} - Liste des films
 */
async function fetchMultiplePages(movieCount, queryParams = '') {
    // Calculer le nombre de pages nécessaires (5 films par page)
    const pagesNeeded = Math.ceil(movieCount / 5);
    
    // Récupérer toutes les pages en parallèle
    const promises = [];
    for (let page = 1; page <= pagesNeeded; page++) {
        promises.push(fetchMovies(page, queryParams));
    }
    
    const responses = await Promise.all(promises);
    
    // Combiner tous les résultats
    let allMovies = [];
    responses.forEach(response => {
        if (response && response.results) {
            allMovies = allMovies.concat(response.results);
        }
    });
    
    // Retourner le nombre exact de films demandé
    return allMovies.slice(0, movieCount);
}

/**
 * Affiche les films d'une catégorie dans un conteneur spécifique
 * @param {string} containerSelector - Sélecteur CSS du conteneur (ex: '.category-action .movies-grid')
 * @param {number} movieCount - Nombre de films à afficher
 * @param {string} queryParams - Paramètres de filtrage et tri
 * @param {string} categoryName - Nom de la catégorie (pour les logs)
 */
export async function displayCategoryMovies(containerSelector, movieCount, queryParams = '', categoryName = 'Films') {
    console.log(`Chargement: ${categoryName}`);
    
    // Récupérer les films
    const movies = await fetchMultiplePages(movieCount, queryParams);
    
    if (movies.length === 0) {
        console.error(`Aucun film récupéré pour: ${categoryName}`);
        return;
    }
    
    console.log(`${categoryName}: ${movies.length} films récupérés`);
    
    // Récupérer le conteneur
    const container = document.querySelector(containerSelector);
    
    if (!container) {
        console.error(`Conteneur non trouvé: ${containerSelector}`);
        return;
    }
    
    // Vider le contenu existant
    container.innerHTML = '';
    
    // Injecter chaque film
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        if (movieCard) {
            container.appendChild(movieCard);
        }
    });
    
    console.log(`${categoryName}: films affichés`);
}

/**
 * Crée un bouton "Voir plus" pour une catégorie
 * @param {string} categoryId - Identifiant de la catégorie
 * @returns {HTMLElement} - Bouton "Voir plus"
 */
function createShowMoreButton(categoryId) {
    const button = document.createElement('button');
    button.className = 'show-more-btn';
    button.textContent = 'Voir plus';
    button.dataset.categoryId = categoryId;
    
    // Gérer le clic pour afficher/masquer les films
    button.addEventListener('click', () => {
        const grid = document.querySelector(`.category-${categoryId} .movies-grid`);
        const movieCards = grid.querySelectorAll('.movie-card');
        const isExpanded = button.dataset.expanded === 'true';
        
        if (isExpanded) {
            // Masquer les films supplémentaires
            movieCards.forEach(card => {
                card.classList.remove('show-all');
            });
            button.textContent = 'Voir plus';
            button.dataset.expanded = 'false';
        } else {
            // Afficher tous les films
            movieCards.forEach(card => {
                card.classList.add('show-all');
            });
            button.textContent = 'Voir moins';
            button.dataset.expanded = 'true';
        }
    });
    
    return button;
}

/**
 * Crée et affiche une catégorie avec titre fixe
 * @param {string} categoryName - Nom de la catégorie
 * @param {string} categoryId - Identifiant unique
 * @param {string} queryParams - Paramètres de requête
 * @param {number} movieCount - Nombre de films à afficher
 * @returns {HTMLElement} - Conteneur de la catégorie créé
 */
export async function createFixedCategory(categoryName, categoryId, queryParams, movieCount = 6) {
    const container = document.createElement('div');
    container.className = `category-section category-${categoryId}`;
    container.dataset.categoryId = categoryId;
    
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = categoryName;
    
    const grid = document.createElement('div');
    grid.className = 'movies-grid';
    
    // Créer le bouton "Voir plus"
    const showMoreBtn = createShowMoreButton(categoryId);
    
    container.appendChild(title);
    container.appendChild(grid);
    container.appendChild(showMoreBtn);
    
    // Ajouter au DOM
    document.querySelector('.categories').appendChild(container);
    
    // Charger les films
    await displayCategoryMovies(`.category-${categoryId} .movies-grid`, movieCount, queryParams, categoryName);
    
    return container;
}

/**
 * Crée et affiche une catégorie avec sélecteur de genre
 * @param {string} categoryId - Identifiant unique de la catégorie
 * @param {Array} availableGenres - Liste de tous les genres disponibles
 * @param {Object} defaultGenre - Genre à afficher par défaut
 * @param {number} movieCount - Nombre de films à afficher
 * @returns {HTMLElement} - Conteneur de la catégorie créé
 */
export async function createDropdownCategory(categoryId, availableGenres, defaultGenre, movieCount = 6) {
    const container = document.createElement('div');
    container.className = `category-section category-${categoryId}`;
    container.dataset.categoryId = categoryId;
    
    // Créer le titre avec menu déroulant
    const titleWithDropdown = createGenreDropdown(
        availableGenres,
        defaultGenre,
        async (selectedGenre) => {
            console.log(`Genre sélectionné: ${selectedGenre.label}`);
            const gridSelector = `.category-${categoryId} .movies-grid`;
            await displayCategoryMovies(
                gridSelector,
                movieCount,
                `genre=${selectedGenre.value}&sort_by=-imdb_score`,
                selectedGenre.label
            );
            
            // Réinitialiser le bouton "Voir plus" après changement de genre
            const showMoreBtn = container.querySelector('.show-more-btn');
            if (showMoreBtn) {
                showMoreBtn.textContent = 'Voir plus';
                showMoreBtn.dataset.expanded = 'false';
                const grid = container.querySelector('.movies-grid');
                const movieCards = grid.querySelectorAll('.movie-card');
                movieCards.forEach(card => card.classList.remove('show-all'));
            }
        }
    );
    
    // Créer la grille
    const grid = document.createElement('div');
    grid.className = 'movies-grid';
    
    // Créer le bouton "Voir plus"
    const showMoreBtn = createShowMoreButton(categoryId);
    
    container.appendChild(titleWithDropdown);
    container.appendChild(grid);
    container.appendChild(showMoreBtn);
    
    // Ajouter au DOM
    document.querySelector('.categories').appendChild(container);
    
    // Charger les films du genre par défaut
    const gridSelector = `.category-${categoryId} .movies-grid`;
    await displayCategoryMovies(
        gridSelector,
        movieCount,
        `genre=${defaultGenre.value}&sort_by=-imdb_score`,
        defaultGenre.label
    );
    
    return container;
}

/**
 * Initialise toutes les catégories de films sur la page
 */
export async function initializeCategories() {
    console.log('Initialisation des catégories...');
    
    // Récupérer les genres depuis l'API
    const genresFromAPI = await fetchGenres();
    
    if (!genresFromAPI || genresFromAPI.length === 0) {
        console.error('Impossible de récupérer les genres depuis l\'API');
        return;
    }
    
    // Transformer les genres en format utilisable
    const availableGenres = genresFromAPI.map(genre => ({
        label: genre.name,
        value: genre.name
    }));
    
    console.log(`${availableGenres.length} genres disponibles`);
    
    // Définition des catégories à afficher
    const categories = [
        {
            type: 'fixed',
            name: 'Films les mieux notés',
            id: 'top-rated',
            query: 'sort_by=-imdb_score'
        },
        {
            type: 'fixed',
            name: 'Mystery',
            id: 'mystery',
            query: 'genre=Mystery&sort_by=-imdb_score'
        },
        {
            type: 'fixed',
            name: 'Action',
            id: 'action',
            query: 'genre=Action&sort_by=-imdb_score'
        },
        {
            type: 'dropdown',
            id: 'dropdown-1',
            defaultGenre: availableGenres[2] || availableGenres[0]
        },
        {
            type: 'dropdown',
            id: 'dropdown-2',
            defaultGenre: availableGenres[3] || availableGenres[1]
        }
    ];
    
    // Créer chaque catégorie
    for (const category of categories) {
        if (category.type === 'fixed') {
            await createFixedCategory(category.name, category.id, category.query);
        } else if (category.type === 'dropdown') {
            await createDropdownCategory(category.id, availableGenres, category.defaultGenre);
        }
    }
    
    console.log('Toutes les catégories ont été initialisées');
}
