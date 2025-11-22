/**
 * Module de gestion des appels API
 * Gère toutes les communications avec l'API backend
 */

// Configuration de l'API
const API_CONFIG = {
    baseUrl: 'http://127.0.0.1:8000/api/v1',
    endpoints: {
        genres: '/genres/',
        titles: '/titles/'
    }
};

/**
 * Récupère une page spécifique depuis une URL avec des paramètres optionnels
 * @param {string} url - URL de base de l'endpoint
 * @param {number} page - Numéro de la page à récupérer
 * @param {string} queryParams - Paramètres de requête additionnels (ex: 'sort_by=-imdb_score')
 * @returns {Promise<Object|null>} - Données de la page ou null en cas d'erreur
 */
async function fetchPage(url, page = 1, queryParams = '') {
    try {
        let fullUrl = `${url}?page=${page}`;
        if (queryParams) {
            fullUrl += `&${queryParams}`;
        }
        
        console.log('Requête API:', fullUrl);
        
        const response = await fetch(fullUrl);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return null;
    }
}

/**
 * Récupère tous les genres disponibles depuis l'API
 * @param {number} maxPages - Nombre maximum de pages à récupérer
 * @returns {Promise<Array>} - Liste des genres
 */
export async function fetchGenres(maxPages = 5) {
    try {
        const genresUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.genres}`;
        let allGenres = [];
        
        for (let page = 1; page <= maxPages; page++) {
            const data = await fetchPage(genresUrl, page);
            
            if (data && data.results) {
                allGenres = allGenres.concat(data.results);
            }
            
            // Arrêter si plus de pages disponibles
            if (!data || !data.next) {
                break;
            }
        }
        
        console.log(`${allGenres.length} genres récupérés`);
        return allGenres;
    } catch (error) {
        console.error('Erreur lors de la récupération des genres:', error);
        return [];
    }
}

/**
 * Récupère les films selon des critères de recherche
 * @param {number} page - Numéro de la page
 * @param {string} queryParams - Paramètres de filtrage (ex: 'genre=Action&sort_by=-imdb_score')
 * @returns {Promise<Object|null>} - Données des films avec pagination
 */
export async function fetchMovies(page = 1, queryParams = '') {
    try {
        const titlesUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.titles}`;
        const data = await fetchPage(titlesUrl, page, queryParams);
        
        if (data) {
            console.log(`Page ${page} récupérée: ${data.results?.length || 0} films`);
        }
        
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des films:', error);
        return null;
    }
}

/**
 * Récupère les détails complets d'un film spécifique
 * @param {string|number} movieId - ID du film
 * @returns {Promise<Object|null>} - Détails complets du film
 */
export async function fetchMovieDetails(movieId) {
    try {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.titles}${movieId}`;
        console.log('Récupération des détails du film:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Détails du film récupérés:', data.title);
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
        return null;
    }
}
