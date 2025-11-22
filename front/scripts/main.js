/**
 * Point d'entrée principal de l'application JustStreamIt
 * Orchestre l'initialisation et le chargement de tous les composants
 */

import { fetchMovieDetails } from './api.js';
import { updateBestMovieDisplay } from './ui-components.js';
import { initializeCategories } from './categories.js';

/**
 * Charge et affiche le meilleur film (score IMDB le plus élevé)
 */
async function loadBestMovie() {
    console.log('Chargement du meilleur film...');
    
    try {
        // Récupérer le film avec le meilleur score IMDB
        const response = await fetch('http://127.0.0.1:8000/api/v1/titles/?page=1&sort_by=-imdb_score');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.results || data.results.length === 0) {
            console.error('Impossible de récupérer le meilleur film');
            return;
        }
        
        const bestMoviePreview = data.results[0];
        console.log('Meilleur film trouvé:', bestMoviePreview.title);
        
        // Récupérer les détails complets du film
        const bestMovie = await fetchMovieDetails(bestMoviePreview.id);
        
        if (!bestMovie) {
            console.error('Impossible de récupérer les détails du meilleur film');
            return;
        }
        
        // Mettre à jour l'affichage
        updateBestMovieDisplay(bestMovie);
        
        console.log('Meilleur film affiché avec succès');
    } catch (error) {
        console.error('Erreur lors du chargement du meilleur film:', error);
    }
}

/**
 * Initialise l'application au chargement du DOM
 */
async function initializeApp() {
    console.log('Initialisation de JustStreamIt...');
    
    try {
        // Charger le meilleur film en premier
        await loadBestMovie();
        
        // Puis charger toutes les catégories
        await initializeCategories();
        
        console.log('Application initialisée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
    }
}

// Démarrer l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', initializeApp);
