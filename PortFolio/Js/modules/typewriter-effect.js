/*
==========================================================================
TYPEWRITER EFFECT - Animation de texte dactylographié
Performance optimisée avec requestAnimationFrame
==========================================================================
*/

const DEFAULT_TYPING_SPEED = 50;
const DEFAULT_ELEMENT_DELAY = 500;
const CURSOR_DURATION = 2000;

/**
 * Gestionnaire d'effet de machine à écrire optimisé
 * @class TypewriterEffect
 */
export class TypewriterEffect {
    constructor(options = {}) {
        this.typingSpeed = options.typingSpeed || DEFAULT_TYPING_SPEED;
        this.elementDelay = options.elementDelay || DEFAULT_ELEMENT_DELAY;
        this.cursorDuration = options.cursorDuration || CURSOR_DURATION;
    }

    /**
     * Initialise l'effet sur tous les éléments avec la classe .typing-effect
     */
    init() {
        const elements = document.querySelectorAll('.typing-effect');
        if (elements.length === 0) return;

        // Utiliser récursion au lieu de boucle async
        this.processElementRecursive(Array.from(elements), 0);
    }

    /**
     * Traite les éléments de manière récursive (non-bloquant)
     * @param {Array<HTMLElement>} elements - Liste des éléments
     * @param {number} index - Index actuel
     */
    processElementRecursive(elements, index) {
        if (index >= elements.length) return;

        const element = elements[index];
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid var(--primary-blue)';

        // Délai progressif entre chaque élément
        setTimeout(() => {
            this.typeTextOptimized(element, text, () => {
                // Callback après animation complète
                setTimeout(() => {
                    element.style.borderRight = 'none';
                    // Traiter l'élément suivant
                    this.processElementRecursive(elements, index + 1);
                }, this.cursorDuration);
            });
        }, index * this.elementDelay);
    }

    /**
     * Anime le texte caractère par caractère (optimisé avec RAF)
     * @param {HTMLElement} element - Élément cible
     * @param {string} text - Texte à afficher
     * @param {Function} onComplete - Callback de fin
     */
    typeTextOptimized(element, text, onComplete) {
        let currentIndex = 0;
        let lastTimestamp = 0;

        const animate = (timestamp) => {
            // Throttle avec le speed défini
            if (timestamp - lastTimestamp < this.typingSpeed) {
                requestAnimationFrame(animate);
                return;
            }

            lastTimestamp = timestamp;

            // Guard Clause: fin de l'animation
            if (currentIndex >= text.length) {
                if (onComplete) onComplete();
                return;
            }

            // Ajouter le caractère suivant
            element.textContent += text.charAt(currentIndex);
            currentIndex++;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    /**
     * Anime un seul élément (API publique)
     * @param {HTMLElement} element - Élément à animer
     * @param {string} text - Texte à afficher
     * @param {Function} onComplete - Callback optionnel
     */
    animateElement(element, text, onComplete) {
        element.textContent = '';
        element.style.borderRight = '2px solid var(--primary-blue)';

        this.typeTextOptimized(element, text, () => {
            setTimeout(() => {
                element.style.borderRight = 'none';
                if (onComplete) onComplete();
            }, this.cursorDuration);
        });
    }

    /**
     * Arrête toutes les animations en cours
     */
    stop() {
        // Les animations RAF s'arrêtent automatiquement
        // Supprimer les curseurs actifs
        document.querySelectorAll('.typing-effect').forEach(el => {
            el.style.borderRight = 'none';
        });
    }
}

// Export de l'instance singleton
export const typewriterEffect = new TypewriterEffect();

// Export par défaut
export default TypewriterEffect;
