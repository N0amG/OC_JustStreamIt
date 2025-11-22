/**
 * Module de création des composants UI
 * Gère la création et la manipulation des éléments visuels
 */

/**
 * URL de l'image de remplacement en cas d'erreur de chargement
 * @param {string} text - Texte à afficher dans l'image de remplacement
 * @param {number} width - Largeur de l'image
 * @param {number} height - Hauteur de l'image
 * @returns {string} - URL data SVG
 */
function createFallbackImageUrl(text, width = 300, height = 300) {
    const encodedText = encodeURIComponent(text);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='${width}' height='${height}' fill='%23666666'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='white'%3E${encodedText}%3C/text%3E%3C/svg%3E`;
}

/**
 * Configure une image avec gestion d'erreur
 * @param {HTMLImageElement} imgElement - Élément image à configurer
 * @param {string} imageUrl - URL de l'image
 * @param {string} altText - Texte alternatif
 * @param {number} width - Largeur pour l'image de remplacement
 * @param {number} height - Hauteur pour l'image de remplacement
 */
function setupImage(imgElement, imageUrl, altText, width = 300, height = 300) {
    imgElement.alt = altText;
    
    let errorHandled = false;
    
    imgElement.onerror = function() {
        if (!errorHandled) {
            errorHandled = true;
            console.warn(`Image non chargée: ${altText}`);
            this.onerror = null;
            this.src = createFallbackImageUrl(altText, width, height);
        }
    };
    
    if (imageUrl) {
        imgElement.src = imageUrl;
    } else {
        imgElement.src = createFallbackImageUrl(altText, width, height);
    }
}

/**
 * Crée une carte de film à partir du template HTML
 * @param {Object} movie - Objet film avec les données (id, title, image_url)
 * @returns {DocumentFragment} - Fragment contenant la carte du film
 */
export function createMovieCard(movie) {
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
    
    // Configurer l'image avec gestion d'erreur
    setupImage(img, movie.image_url, `Affiche ${movie.title}`, 300, 300);
    
    return movieCard;
}

/**
 * Crée un sélecteur de genre (dropdown) avec un label
 * @param {Array} genres - Liste des genres [{label: string, value: string}]
 * @param {Object} defaultGenre - Genre sélectionné par défaut
 * @param {Function} onSelect - Callback appelé lors de la sélection (reçoit le genre sélectionné)
 * @returns {HTMLElement} - Élément h2 contenant le label et le select
 */
export function createGenreDropdown(genres, defaultGenre, onSelect) {
    const titleWrapper = document.createElement('h2');
    titleWrapper.className = 'category-title';
    
    const label = document.createElement('span');
    label.textContent = 'Autres: ';
    
    const select = document.createElement('select');
    select.className = 'genre-dropdown';
    
    // Ajouter les options de genres
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.value;
        option.textContent = genre.label;
        
        if (genre.value === defaultGenre.value) {
            option.selected = true;
        }
        
        select.appendChild(option);
    });
    
    // Gérer le changement de sélection
    select.addEventListener('change', (event) => {
        const selectedGenre = genres.find(g => g.value === event.target.value);
        if (selectedGenre) {
            console.log(`Changement de genre: ${selectedGenre.label}`);
            onSelect(selectedGenre);
        }
    });
    
    titleWrapper.appendChild(label);
    titleWrapper.appendChild(select);
    
    return titleWrapper;
}

/**
 * Crée un conteneur de catégorie avec titre et grille
 * @param {string} categoryId - Identifiant unique de la catégorie
 * @param {string} categoryTitle - Titre de la catégorie
 * @returns {HTMLElement} - Conteneur div de la catégorie
 */
export function createCategoryContainer(categoryId, categoryTitle) {
    const container = document.createElement('div');
    container.className = `category-section category-${categoryId}`;
    container.dataset.categoryId = categoryId;
    
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = categoryTitle;
    
    const grid = document.createElement('div');
    grid.className = 'movies-grid';
    
    container.appendChild(title);
    container.appendChild(grid);
    
    return container;
}

/**
 * Met à jour l'affichage du meilleur film
 * @param {Object} movie - Données complètes du film
 */
export function updateBestMovieDisplay(movie) {
    const imageElement = document.querySelector('.best-movie-image');
    const titleElement = document.querySelector('.best-movie-title');
    const descriptionElement = document.querySelector('.best-movie-description');
    const buttonElement = document.querySelector('.best-movie .details-button');
    
    if (!imageElement || !titleElement || !descriptionElement || !buttonElement) {
        console.error('Éléments du meilleur film non trouvés dans le DOM');
        return;
    }
    
    // Mettre à jour l'image
    imageElement.width = 225;
    setupImage(imageElement, movie.image_url, `Affiche ${movie.title}`, 225, 338);
    
    // Mettre à jour les textes
    titleElement.textContent = movie.title || 'Titre inconnu';
    descriptionElement.textContent = movie.long_description || movie.description || 'Aucune description disponible.';
    buttonElement.dataset.movieId = movie.id;
    
    console.log('Meilleur film affiché:', movie.title);
}
