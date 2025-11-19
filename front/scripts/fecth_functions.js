// URLs de l'API
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const GENRES_URL = `${API_BASE_URL}/genres/`;
const TITLES_URL = `${API_BASE_URL}/titles/`;

// Variables pour stocker les données
let genresData = null;
let titlesData = null;

// Fonction pour récupérer une page spécifique d'une URL
async function fetchPage(url, page = 1, args = '') {
    try {
        let urlWithPage = `${url}?page=${page}`;
        if (args) {
            urlWithPage += `&${args}`;
        }
        console.log('Fetching:', urlWithPage);
        const response = await fetch(urlWithPage);
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

// Fonction pour récupérer les genres (page spécifique)
export async function fetchGenres() {
    try {
        let genresData = [];
        for (let page = 1; page <= 5 ; page++) {
            const data = await fetchPage(GENRES_URL, page);
            if (data && data.results) {
                genresData = genresData.concat(data.results);
            }
            // Arrêter si plus de pages
            if (!data || !data.next) break;
        }
        console.log('Genres récupérés:', genresData);
        return genresData;
    } catch (error) {
        console.error('Erreur lors de la récupération des genres:', error);
    }
}

// Fonction pour récupérer les titres (page spécifique)
export async function fetchTitles(page = 1, args = '') {
    try {
        titlesData = await fetchPage(TITLES_URL, page, args);
        console.log(`Titres récupérés (page ${page}):`, titlesData);
        return titlesData;
    } catch (error) {
        console.error('Erreur lors de la récupération des titres:', error);
    }
}
