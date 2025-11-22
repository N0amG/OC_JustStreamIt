/**
 * Module de gestion de la modale de détails des films
 * Gère l'affichage, la fermeture et le formatage des informations détaillées
 */

import { fetchMovieDetails } from './api.js';

/**
 * Classe pour gérer l'affichage de la modale de détails d'un film
 */
class MovieModal {
    constructor() {
        this.modal = null;
        this.template = document.getElementById('movie-modal-template');
        this.initEventListeners();
    }

    /**
     * Initialise les écouteurs d'événements pour tous les boutons "Détails"
     */
    initEventListeners() {
        // Utiliser la délégation d'événements sur le document
        document.addEventListener('click', (e) => {
            // Vérifier si le clic est sur un bouton "Détails"
            if (e.target.classList.contains('details-btn') || e.target.classList.contains('details-button')) {
                e.preventDefault();
                const movieId = e.target.dataset.movieId;
                if (movieId) {
                    this.showModal(movieId);
                }
            }
            
            // Vérifier si le clic est sur le bouton de fermeture ou l'overlay
            if (e.target.classList.contains('movie-modal__close-btn') || e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Fermer la modale avec la touche Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal) {
                this.closeModal();
            }
        });
    }

    /**
     * Affiche la modale avec les détails d'un film
     * @param {string|number} movieId - ID du film à afficher
     */
    async showModal(movieId) {
        try {
            console.log(`Chargement des détails pour le film ID: ${movieId}`);
            
            // Récupérer les détails complets du film depuis l'API
            const movieData = await fetchMovieDetails(movieId);
            
            if (!movieData) {
                console.error('Impossible de récupérer les détails du film');
                return;
            }

            // Créer la modale depuis le template
            this.createModal(movieData);
            
            // Ajouter la modale au DOM
            document.body.appendChild(this.modal);
            
            // Empêcher le scroll du body
            document.body.style.overflow = 'hidden';
            
            console.log('Modale affichée avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'affichage de la modale:', error);
        }
    }

    /**
     * Crée la modale depuis le template et la remplit avec les données du film
     * @param {Object} movie - Données complètes du film
     */
    createModal(movie) {
        // Cloner le template
        const modalContent = this.template.content.cloneNode(true);
        
        // Récupérer tous les éléments à remplir
        const elements = {
            poster: modalContent.querySelector('.movie-poster-img'),
            title: modalContent.querySelector('.movie-title'),
            meta: modalContent.querySelector('.movie-meta'),
            directors: modalContent.querySelector('.movie-directors'),
            synopsis: modalContent.querySelector('.movie-synopsis'),
            cast: modalContent.querySelector('.movie-cast')
        };

        // Remplir l'affiche
        elements.poster.src = movie.image_url || '';
        elements.poster.alt = `Affiche ${movie.title}`;
        
        // Gérer les erreurs de chargement d'image
        elements.poster.onerror = function() {
            this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='210' height='315'%3E%3Crect width='210' height='315' fill='%23666666'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='white'%3EImage non disponible%3C/text%3E%3C/svg%3E`;
        };

        // Remplir le titre
        elements.title.textContent = movie.title || 'Titre inconnu';
        
        // Construire le bloc métadonnées (année, genres, durée, etc.)
        const metaLines = [];
        
        // Ligne 1: Année - Genres
        const year = movie.year || (movie.date_published ? new Date(movie.date_published).getFullYear() : '');
        const genres = movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : '';
        if (year || genres) {
            metaLines.push(`${year}${year && genres ? ' - ' : ''}${genres}`);
        }
        
        // Ligne 2: Rated - Durée (Pays)
        const rated = movie.rated || '';
        const duration = movie.duration ? `${movie.duration} minutes` : '';
        const countries = movie.countries && movie.countries.length > 0 ? movie.countries.join(' / ') : '';
        const line2Parts = [];
        if (rated) line2Parts.push(rated);
        if (duration) line2Parts.push(duration);
        if (line2Parts.length > 0) {
            let line2 = line2Parts.join(' - ');
            if (countries) line2 += ` (${countries})`;
            metaLines.push(line2);
        }
        
        // Ligne 3: IMDB score
        if (movie.imdb_score) {
            metaLines.push(`IMDB score: ${movie.imdb_score}/10`);
        }
        
        // Ligne 4: Box office
        if (movie.worldwide_gross_income) {
            metaLines.push(`Recettes au box-office: ${this.formatBoxOffice(movie.worldwide_gross_income)}`);
        }
        
        elements.meta.innerHTML = metaLines.join('<br>');
        
        // Remplir les réalisateurs
        if (movie.directors && movie.directors.length > 0) {
            elements.directors.textContent = movie.directors.join(', ');
        } else {
            elements.directors.textContent = 'Non renseigné';
        }
        
        // Remplir le synopsis
        elements.synopsis.textContent = movie.long_description || movie.description || 'Aucun résumé disponible.';
        
        // Remplir le casting
        if (movie.actors && movie.actors.length > 0) {
            elements.cast.textContent = movie.actors.join(', ');
        } else {
            elements.cast.textContent = 'Non renseigné';
        }

        // Stocker la référence de la modale
        this.modal = modalContent.querySelector('.modal-overlay');
    }

    /**
     * Ferme la modale et réactive le scroll
     */
    closeModal() {
        if (this.modal && this.modal.parentElement) {
            this.modal.remove();
            this.modal = null;
            
            // Réactiver le scroll du body
            document.body.style.overflow = '';
            
            console.log('Modale fermée');
        }
    }

    /**
     * Formate le montant du box office pour un affichage lisible
     * @param {string|number} amount - Montant du box office
     * @returns {string} - Montant formaté (ex: "$123.5m")
     */
    formatBoxOffice(amount) {
        if (!amount) return 'Non renseigné';
        
        // Si le montant contient déjà un symbole de devise, le retourner tel quel
        if (typeof amount === 'string') {
            // Vérifier si c'est déjà formaté avec devise
            if (/^\$/.test(amount)) {
                return amount;
            }
            // Essayer d'extraire le nombre
            const match = amount.match(/[\d,.]+/);
            if (match) {
                const numAmount = parseFloat(match[0].replace(/,/g, ''));
                if (!isNaN(numAmount)) {
                    return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}m`;
                }
            }
            return amount;
        }
        
        // Formater en tant que nombre
        const numAmount = Number(amount);
        if (isNaN(numAmount)) return amount;
        
        // Convertir en millions si > 1 million
        if (numAmount >= 1000000) {
            return `$${(numAmount / 1000000).toFixed(1)}m`;
        }
        
        return `$${numAmount.toLocaleString('en-US')}`;
    }
}

// Initialiser la modale quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation du système de modale...');
    new MovieModal();
});

// Export pour utilisation dans d'autres modules si nécessaire
export default MovieModal;
