import { fetchTitles, fetchGenres } from './fecth_functions.js';

/**
 * Fonction générique pour afficher une catégorie de films
 * @param {string} containerSelector - Sélecteur CSS du conteneur (ex: '.movies-grid')
 * @param {number} movieCount - Nombre de films à afficher
 * @param {string} queryParams - Paramètres de la requête (ex: 'sort_by=-imdb_score' ou 'genre=Action')
 * @param {string} categoryName - Nom de la catégorie pour les logs
 * @param {boolean} hasDropdown - Si true, affiche un menu déroulant au lieu du titre fixe
 */
async function displayCategory(containerSelector, movieCount, queryParams = '', categoryName = 'Films', hasDropdown = false) {
    console.log(`Chargement de la catégorie: ${categoryName}`);

    // Calculer le nombre de pages nécessaires (5 films par page avec paramètres)
    const pagesNeeded = Math.ceil(movieCount / 5);

    // Récupérer les films de toutes les pages nécessaires
    const promises = [];
    for (let page = 1; page <= pagesNeeded; page++) {
        promises.push(fetchTitles(page, queryParams));
    }

    const responses = await Promise.all(promises);

    // Vérifier qu'au moins la première page a réussi
    if (!responses[0] || !responses[0].results) {
        console.error(`Impossible de récupérer les films pour: ${categoryName}`);
        return;
    }

    // Combiner tous les résultats
    let allMovies = [];
    responses.forEach(response => {
        if (response && response.results) {
            allMovies = allMovies.concat(response.results);
        }
    });

    // Prendre le nombre de films demandé
    const movies = allMovies.slice(0, movieCount);
    console.log(`${categoryName} - ${movies.length} films récupérés:`, movies);

    // Récupérer le conteneur
    const container = document.querySelector(containerSelector);

    if (!container) {
        console.error(`Conteneur non trouvé: ${containerSelector}`);
        return;
    }

    // Vider le contenu existant
    container.innerHTML = '';

    // Injecter chaque film
    movies.forEach((movie, index) => {
        console.log(`Injection du film ${index + 1}: ${movie.title}`);
        const movieCard = createMovieCard(movie);
        container.appendChild(movieCard);
    });

    console.log(`${categoryName} - Films injectés avec succès`);
}

/**
 * Créer une carte de film à partir du template HTML
 * @param {Object} movie - Objet film avec les données
 * @returns {HTMLElement} - Élément div de la carte cloné du template
 */
function createMovieCard(movie) {
    // Récupérer le template
    const template = document.getElementById('movie-card-template');
    if (!template) {
        console.error('Template movie-card-template introuvable');
        return null;
    }

    // Cloner le contenu du template
    const movieCard = template.content.cloneNode(true);

    // Récupérer les éléments à remplir
    const img = movieCard.querySelector('.movie-image');
    const title = movieCard.querySelector('.movie-title');
    const button = movieCard.querySelector('.details-btn');

    // Remplir avec les données du film
    title.textContent = movie.title;
    button.dataset.movieId = movie.id;
    img.alt = `Affiche ${movie.title}`;

    // Variable pour éviter la boucle infinie
    let errorHandled = false;

    // Gérer l'erreur de chargement (image 404 ou autre erreur)
    img.onerror = function () {
        if (!errorHandled) {
            errorHandled = true;
            console.warn(`Image non chargée pour ${movie.title}`);
            this.onerror = null;
            // Utiliser une image data URL comme fallback
            this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23666666'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='white'%3E${encodeURIComponent(movie.title)}%3C/text%3E%3C/svg%3E`;
        }
    };

    // Définir la source SANS crossOrigin pour éviter les erreurs CORS
    if (movie.image_url) {
        img.src = movie.image_url;
    } else {
        img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23666666'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='white'%3E${encodeURIComponent(movie.title)}%3C/text%3E%3C/svg%3E`;
    }

    return movieCard;
}

/**
 * Créer un titre avec menu déroulant pour sélectionner une catégorie
 * @param {Array} genres - Liste des genres disponibles
 * @param {Object} defaultGenre - Genre par défaut à afficher
 * @param {Function} onSelect - Callback appelé quand un genre est sélectionné
 * @returns {HTMLElement} - Élément h2 avec le select intégré
 */
function createGenreDropdown(genres, defaultGenre, onSelect) {
    const titleWrapper = document.createElement('h2');
    titleWrapper.className = 'category-title';

    const label = document.createElement('span');
    label.textContent = 'Autres: ';

    const select = document.createElement('select');
    select.className = 'genre-dropdown';

    // Ajouter les genres
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.value;
        option.textContent = genre.label;
        if (genre.value === defaultGenre.value) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    // Événement de sélection
    select.addEventListener('change', (e) => {
        const selectedGenre = genres.find(g => g.value === e.target.value);
        if (selectedGenre) {
            console.log(`Changement de genre vers: ${selectedGenre.label}`);
            onSelect(selectedGenre);
        }
    });

    titleWrapper.appendChild(label);
    titleWrapper.appendChild(select);

    return titleWrapper;
}

async function injectCategories() {
    // Récupérer les genres depuis l'API
    const genresFromAPI = await fetchGenres();
    
    if (!genresFromAPI || genresFromAPI.length === 0) {
        console.error('Impossible de récupérer les genres depuis l\'API');
        return;
    }

    // Transformer les genres de l'API en format utilisable
    const availableGenres = genresFromAPI.map(genre => ({
        label: genre.name,
        value: genre.name
    }));

    console.log('Genres disponibles:', availableGenres);

    const categories = [
        { name: 'Films les mieux notés', query: 'sort_by=-imdb_score', hasDropdown: false },
        { name: 'Mystery', query: 'genre=Mystery', hasDropdown: false },
        { name: 'Action', query: 'genre=Action', hasDropdown: false },
        { name: 'Autres', hasDropdown: true, id: 'dropdown-1', defaultGenre: availableGenres[2] },
        { name: 'Autres', hasDropdown: true, id: 'dropdown-2', defaultGenre: availableGenres[3] },
    ];

    for (const category of categories) {
        // Créer le conteneur de la catégorie
        const categoryContainer = document.createElement('div');
        const categoryId = category.id || category.name.toLowerCase().replace(/\s+/g, '-');
        categoryContainer.className = `category-section category-${categoryId}`;
        categoryContainer.dataset.categoryId = categoryId;

        if (category.hasDropdown) {
            // Créer le titre avec menu déroulant
            const titleWithDropdown = createGenreDropdown(availableGenres, category.defaultGenre, async (selectedGenre) => {
                console.log(`Genre sélectionné: ${selectedGenre.label}`);
                const gridSelector = `.category-${categoryId} .movies-grid`;
                await displayCategory(gridSelector, 6, `genre=${selectedGenre.value}&sort_by=-imdb_score`, selectedGenre.label);
            });

            // Ajouter le titre et la grille
            categoryContainer.appendChild(titleWithDropdown);
            const moviesGrid = document.createElement('div');
            moviesGrid.className = 'movies-grid';
            categoryContainer.appendChild(moviesGrid);

            // Ajouter au conteneur principal
            document.querySelector('.categories').appendChild(categoryContainer);

            // Charger les films du genre par défaut
            const gridSelector = `.category-${categoryId} .movies-grid`;
            await displayCategory(gridSelector, 6, `genre=${category.defaultGenre.value}&sort_by=-imdb_score`, category.defaultGenre.label);
        } else {
            // Titre fixe
            categoryContainer.innerHTML = `<h2 class='category-title'>${category.name}</h2><div class="movies-grid"></div>`;

            // Ajouter au conteneur principal
            document.querySelector('.categories').appendChild(categoryContainer);

            // Injecter les films pour les catégories fixes
            await displayCategory('.category-section:last-child .movies-grid', 6, category.query, category.name);
        }
    }
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document chargé, injection des catégories...');
    injectCategories();
});
