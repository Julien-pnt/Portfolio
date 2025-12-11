/*
==========================================================================
BOT DETECTOR - PORTFOLIO JULIEN PINOT
Système de détection de bots avec scoring comportemental
==========================================================================
*/

// Constantes de scoring
const BOT_SCORE_USER_AGENT = 30;
const BOT_SCORE_WEBDRIVER = 40;
const BOT_SCORE_NO_INTERACTION = 20;
const BOT_SCORE_HEADLESS = 15;
const BOT_SCORE_THRESHOLD = 50;
const BOT_SCORE_REDUCTION = 5;

// Seuils d'interaction
const MOUSE_MOVEMENTS_THRESHOLD = 10;
const CLICKS_THRESHOLD = 3;
const SCROLLS_THRESHOLD = 5;
const BOT_CHECK_DELAY = 5000;

/**
 * Détecteur de bots basé sur l'analyse comportementale
 * @class BotDetector
 */
export class BotDetector {
    constructor() {
        this.botScore = 0;
        this.mouseMovements = 0;
        this.clicks = 0;
        this.scrolls = 0;
        this.listeners = [];
    }

    /**
     * Initialise la détection de bots
     */
    init() {
        this.checkUserAgent();
        this.checkWebDriver();
        this.checkHeadlessBrowser();
        this.setupBehaviorTracking();
        this.scheduleCheck();
    }

    /**
     * Vérifie le User Agent pour des patterns de bots
     */
    checkUserAgent() {
        // Guard Clause - vérifier si navigator existe
        if (!navigator || !navigator.userAgent) {
            return;
        }

        const ua = navigator.userAgent.toLowerCase();
        const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'phantomjs', 'headless'];
        
        // Guard Clause - augmenter le score si pattern détecté
        if (botPatterns.some(pattern => ua.includes(pattern))) {
            this.botScore += BOT_SCORE_USER_AGENT;
            console.warn('BotDetector: Pattern de bot détecté dans User Agent');
        }
    }

    /**
     * Vérifie si WebDriver est actif (automatisation)
     */
    checkWebDriver() {
        // Guard Clause - vérifier si navigator.webdriver existe
        if (!navigator) {
            return;
        }

        if (navigator.webdriver) {
            this.botScore += BOT_SCORE_WEBDRIVER;
            console.warn('BotDetector: WebDriver détecté (automatisation)');
        }
    }

    /**
     * Vérifie les propriétés manquantes (headless browser)
     */
    checkHeadlessBrowser() {
        // Guard Clause - vérifier si window et navigator existent
        if (!window || !navigator) {
            return;
        }

        // Vérifications multiples pour les navigateurs headless
        const hasChrome = window.chrome !== undefined;
        const hasPlugins = navigator.plugins && navigator.plugins.length > 0;
        const hasMimeTypes = navigator.mimeTypes && navigator.mimeTypes.length > 0;
        
        // Guard Clause - augmenter le score si signatures headless détectées
        if (!hasChrome || !hasPlugins || !hasMimeTypes) {
            this.botScore += BOT_SCORE_HEADLESS;
            console.warn('BotDetector: Signatures de navigateur headless détectées');
        }
    }

    /**
     * Configure le suivi comportemental
     */
    setupBehaviorTracking() {
        this.trackMouseMovements();
        this.trackClicks();
        this.trackScrolls();
    }

    /**
     * Suit les mouvements de souris
     */
    trackMouseMovements() {
        const handler = () => {
            this.mouseMovements++;
            
            // Guard Clause - réduire le score si interaction humaine détectée
            if (this.mouseMovements > MOUSE_MOVEMENTS_THRESHOLD) {
                this.botScore = Math.max(0, this.botScore - BOT_SCORE_REDUCTION);
            }
        };

        document.addEventListener('mousemove', handler, { passive: true });
        this.listeners.push({ type: 'mousemove', handler });
    }

    /**
     * Suit les clics
     */
    trackClicks() {
        const handler = () => {
            this.clicks++;
            
            // Guard Clause - réduire le score si interaction humaine détectée
            if (this.clicks > CLICKS_THRESHOLD) {
                this.botScore = Math.max(0, this.botScore - BOT_SCORE_REDUCTION);
            }
        };

        document.addEventListener('click', handler, { passive: true });
        this.listeners.push({ type: 'click', handler });
    }

    /**
     * Suit les scrolls
     */
    trackScrolls() {
        const handler = () => {
            this.scrolls++;
            
            // Guard Clause - réduire le score si interaction humaine détectée
            if (this.scrolls > SCROLLS_THRESHOLD) {
                this.botScore = Math.max(0, this.botScore - BOT_SCORE_REDUCTION);
            }
        };

        document.addEventListener('scroll', handler, { passive: true });
        this.listeners.push({ type: 'scroll', handler });
    }

    /**
     * Planifie la vérification finale du score
     */
    scheduleCheck() {
        setTimeout(() => {
            this.performFinalCheck();
        }, BOT_CHECK_DELAY);
    }

    /**
     * Effectue la vérification finale
     */
    performFinalCheck() {
        // Guard Clause - vérifier l'absence totale d'interaction
        if (this.mouseMovements === 0 && this.clicks === 0 && this.scrolls === 0) {
            this.botScore += BOT_SCORE_NO_INTERACTION;
            console.warn('BotDetector: Aucune interaction humaine détectée');
        }
        
        // Guard Clause - déclencher l'alerte si seuil atteint
        if (this.botScore >= BOT_SCORE_THRESHOLD) {
            console.warn(`⚠️ Comportement de bot détecté (score: ${this.botScore})`);
            this.handleBotDetection();
            return;
        }

        console.log(`✓ Utilisateur humain vérifié (score: ${this.botScore})`);
    }

    /**
     * Gère la détection d'un bot
     */
    handleBotDetection() {
        // Enregistrer la détection dans localStorage
        localStorage.setItem('bot_detected', Date.now().toString());
        localStorage.setItem('bot_score', this.botScore.toString());
        
        // Ajouter un overlay discret
        this.addBotOverlay();
        
        // Émettre un événement personnalisé
        const event = new CustomEvent('botDetected', {
            detail: {
                score: this.botScore,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Ajoute un overlay discret pour les bots détectés
     */
    addBotOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'bot-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.05);
            z-index: 1;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s;
        `;
        
        document.body.appendChild(overlay);
        
        // Fade in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
    }

    /**
     * Obtient le score actuel
     * @returns {number}
     */
    getScore() {
        return this.botScore;
    }

    /**
     * Vérifie si un bot a été détecté
     * @returns {boolean}
     */
    isBotDetected() {
        return this.botScore >= BOT_SCORE_THRESHOLD;
    }

    /**
     * Obtient les statistiques d'interaction
     * @returns {{mouseMovements: number, clicks: number, scrolls: number, score: number}}
     */
    getStats() {
        return {
            mouseMovements: this.mouseMovements,
            clicks: this.clicks,
            scrolls: this.scrolls,
            score: this.botScore
        };
    }

    /**
     * Réinitialise le détecteur
     */
    reset() {
        this.botScore = 0;
        this.mouseMovements = 0;
        this.clicks = 0;
        this.scrolls = 0;
        
        localStorage.removeItem('bot_detected');
        localStorage.removeItem('bot_score');
    }

    /**
     * Nettoie les event listeners
     */
    cleanup() {
        this.listeners.forEach(({ type, handler }) => {
            document.removeEventListener(type, handler);
        });
        this.listeners = [];
    }

    /**
     * Vérifie si un bot a été précédemment détecté
     * @returns {boolean}
     */
    hasPreviousDetection() {
        const detected = localStorage.getItem('bot_detected');
        
        // Guard Clause - pas de détection précédente
        if (!detected) {
            return false;
        }

        const detectionTime = parseInt(detected);
        const now = Date.now();
        const oneHour = 3600000;
        
        // Expiration après 1 heure
        return (now - detectionTime) < oneHour;
    }
}

// Export de l'instance singleton
export const botDetector = new BotDetector();

// Export par défaut
export default BotDetector;
