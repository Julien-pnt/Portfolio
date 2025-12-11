/*
==========================================================================
RATE LIMITER - PORTFOLIO JULIEN PINOT
Système de limitation de taux pour prévenir les abus
==========================================================================
*/

// Constantes
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_WARNING_DURATION = 5000;
const FETCH_RATE_LIMIT = 10;
const FETCH_RATE_WINDOW = 10000;
const FORM_SUBMIT_LIMIT = 3;
const THEME_TRANSITION_DURATION = 300;

/**
 * Gestionnaire de limitation de taux (Rate Limiting)
 * @class RateLimiter
 */
export class RateLimiter {
    constructor() {
        this.rateLimiter = new Map();
        this.formSubmitCount = new Map();
        this.originalFetch = null;
    }

    /**
     * Initialise le rate limiting
     */
    init() {
        this.patchFetch();
    }

    /**
     * Vérifie si une action peut être effectuée selon les limites de taux
     * @param {string} identifier - Identifiant unique de l'action
     * @param {number} maxAttempts - Nombre maximum de tentatives
     * @param {number} windowMs - Fenêtre de temps en millisecondes
     * @returns {boolean} true si l'action est autorisée
     */
    checkRateLimit(identifier, maxAttempts = 5, windowMs = RATE_LIMIT_WINDOW_MS) {
        // Guard Clause - validation des paramètres
        if (!identifier) return false;

        const now = Date.now();
        const attempts = this.rateLimiter.get(identifier) || [];
        
        // Nettoyer les anciennes tentatives (hors fenêtre temporelle)
        const recentAttempts = attempts.filter(time => now - time < windowMs);
        
        // Guard Clause - vérifier si la limite est atteinte
        if (recentAttempts.length >= maxAttempts) {
            const oldestAttempt = Math.min(...recentAttempts);
            const waitTime = Math.ceil((windowMs - (now - oldestAttempt)) / 1000);
            
            this.showRateLimitWarning(waitTime);
            return false;
        }
        
        // Enregistrer la nouvelle tentative
        recentAttempts.push(now);
        this.rateLimiter.set(identifier, recentAttempts);
        return true;
    }

    /**
     * Affiche un avertissement de limite de taux atteinte
     * @param {number} waitTime - Temps d'attente en secondes
     */
    showRateLimitWarning(waitTime) {
        const warning = document.createElement('div');
        warning.className = 'rate-limit-warning';
        warning.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 10000;
            text-align: center;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        const elements = this.createWarningElements(waitTime);
        elements.forEach(el => warning.appendChild(el));
        
        document.body.appendChild(warning);
        
        // Auto-suppression après la durée d'avertissement
        setTimeout(() => {
            warning.style.transition = 'opacity 0.3s';
            warning.style.opacity = '0';
            setTimeout(() => warning.remove(), THEME_TRANSITION_DURATION);
        }, RATE_LIMIT_WARNING_DURATION);
    }

    /**
     * Crée les éléments de l'avertissement
     * @param {number} waitTime - Temps d'attente en secondes
     * @returns {HTMLElement[]}
     */
    createWarningElements(waitTime) {
        const emoji = document.createElement('div');
        emoji.style.cssText = 'font-size: 3rem; margin-bottom: 1rem;';
        emoji.textContent = '⏱️';
        
        const title = document.createElement('h3');
        title.style.cssText = 'margin-bottom: 1rem; color: #dc2626;';
        title.textContent = 'Trop de tentatives';
        
        const message = document.createElement('p');
        message.style.cssText = 'color: #64748b; margin-bottom: 1.5rem;';
        message.textContent = `Veuillez patienter ${waitTime} secondes avant de réessayer.`;
        
        const button = document.createElement('button');
        button.style.cssText = `
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s;
        `;
        button.textContent = 'Compris';
        button.addEventListener('click', () => {
            const warningElement = button.closest('.rate-limit-warning');
            if (warningElement) warningElement.remove();
        });
        
        button.addEventListener('mouseenter', () => {
            button.style.background = '#1d4ed8';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = '#2563eb';
        });
        
        return [emoji, title, message, button];
    }

    /**
     * Patche la fonction fetch pour appliquer le rate limiting
     */
    patchFetch() {
        // Guard Clause - ne pas patcher deux fois
        if (this.originalFetch) {
            return;
        }

        this.originalFetch = window.fetch;
        const self = this;
        
        window.fetch = function(...args) {
            const url = args[0];
            
            // Guard Clause - vérifier rate limit pour cette URL
            if (!self.checkRateLimit('fetch_' + url, FETCH_RATE_LIMIT, FETCH_RATE_WINDOW)) {
                return Promise.reject(new Error('Rate limit exceeded for: ' + url));
            }
            
            return self.originalFetch.apply(this, args);
        };
    }

    /**
     * Restaure la fonction fetch originale
     */
    unpatchFetch() {
        // Guard Clause - vérifier si fetch a été patché
        if (!this.originalFetch) {
            return;
        }

        window.fetch = this.originalFetch;
        this.originalFetch = null;
    }

    /**
     * Vérifie le rate limit pour un formulaire
     * @param {string} formId - Identifiant du formulaire
     * @returns {boolean} true si la soumission est autorisée
     */
    checkFormSubmitLimit(formId) {
        return this.checkRateLimit(
            'form_' + formId, 
            FORM_SUBMIT_LIMIT, 
            RATE_LIMIT_WINDOW_MS
        );
    }

    /**
     * Réinitialise les compteurs de rate limit
     * @param {string} identifier - Identifiant spécifique (optionnel)
     */
    reset(identifier = null) {
        if (identifier) {
            this.rateLimiter.delete(identifier);
        } else {
            this.rateLimiter.clear();
            this.formSubmitCount.clear();
        }
    }

    /**
     * Obtient le nombre de tentatives restantes
     * @param {string} identifier - Identifiant de l'action
     * @param {number} maxAttempts - Nombre maximum de tentatives
     * @param {number} windowMs - Fenêtre de temps
     * @returns {number} Nombre de tentatives restantes
     */
    getRemainingAttempts(identifier, maxAttempts = 5, windowMs = RATE_LIMIT_WINDOW_MS) {
        const now = Date.now();
        const attempts = this.rateLimiter.get(identifier) || [];
        const recentAttempts = attempts.filter(time => now - time < windowMs);
        
        return Math.max(0, maxAttempts - recentAttempts.length);
    }

    /**
     * Obtient le temps d'attente avant la prochaine tentative
     * @param {string} identifier - Identifiant de l'action
     * @param {number} windowMs - Fenêtre de temps
     * @returns {number} Temps d'attente en secondes (0 si aucune attente)
     */
    getWaitTime(identifier, windowMs = RATE_LIMIT_WINDOW_MS) {
        const now = Date.now();
        const attempts = this.rateLimiter.get(identifier) || [];
        const recentAttempts = attempts.filter(time => now - time < windowMs);
        
        // Guard Clause - pas d'attente si aucune tentative récente
        if (recentAttempts.length === 0) {
            return 0;
        }
        
        const oldestAttempt = Math.min(...recentAttempts);
        const waitTimeMs = windowMs - (now - oldestAttempt);
        
        return Math.max(0, Math.ceil(waitTimeMs / 1000));
    }
}

// Export de l'instance singleton
export const rateLimiter = new RateLimiter();

// Export par défaut
export default RateLimiter;
