/*
==========================================================================
CAPTCHA SYSTEM - PORTFOLIO JULIEN PINOT
Système de captcha modulaire avec vérification mathématique
==========================================================================
*/

// Constantes
const NOTIFICATION_DURATION = 4000;
const THEME_TRANSITION_DURATION = 300;

/**
 * Système de captcha pour la protection des formulaires
 * @class CaptchaSystem
 */
export class CaptchaSystem {
    constructor() {
        this.activeOverlay = null;
    }

    /**
     * Génère un challenge mathématique simple
     * @returns {{num1: number, num2: number, answer: number}}
     */
    generateMathChallenge() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const answer = num1 + num2;
        return { num1, num2, answer };
    }

    /**
     * Crée l'overlay du captcha
     * @returns {HTMLElement}
     */
    createCaptchaOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'captcha-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        return overlay;
    }

    /**
     * Crée la boîte du captcha
     * @param {number} num1 - Premier nombre
     * @param {number} num2 - Second nombre
     * @returns {HTMLElement}
     */
    createCaptchaBox(num1, num2) {
        const captchaBox = document.createElement('div');
        captchaBox.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        const elements = this.createCaptchaElements(num1, num2);
        elements.forEach(el => captchaBox.appendChild(el));
        
        return captchaBox;
    }

    /**
     * Crée les éléments du captcha
     * @param {number} num1 - Premier nombre
     * @param {number} num2 - Second nombre
     * @returns {HTMLElement[]}
     */
    createCaptchaElements(num1, num2) {
        const emoji = document.createElement('div');
        emoji.style.cssText = 'font-size: 2rem; margin-bottom: 1rem;';
        emoji.textContent = '🤔';
        
        const title = document.createElement('h3');
        title.style.cssText = 'margin-bottom: 1rem; color: #1e293b;';
        title.textContent = 'Vérification humaine';
        
        const question = document.createElement('p');
        question.style.cssText = 'color: #64748b; margin-bottom: 1.5rem; font-size: 1.1rem;';
        question.textContent = `Combien font ${num1} + ${num2} ?`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'captcha-input';
        input.setAttribute('aria-label', 'Réponse au captcha');
        input.style.cssText = `
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1.1rem;
            text-align: center;
            margin-bottom: 1rem;
            transition: border-color 0.3s;
        `;
        
        const submitBtn = document.createElement('button');
        submitBtn.id = 'captcha-submit';
        submitBtn.textContent = 'Vérifier';
        submitBtn.setAttribute('aria-label', 'Vérifier la réponse');
        submitBtn.style.cssText = `
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            width: 100%;
            transition: background 0.3s;
        `;
        
        submitBtn.addEventListener('mouseenter', () => {
            submitBtn.style.background = '#1d4ed8';
        });
        
        submitBtn.addEventListener('mouseleave', () => {
            submitBtn.style.background = '#2563eb';
        });
        
        return [emoji, title, question, input, submitBtn];
    }

    /**
     * Configure les gestionnaires d'événements du captcha
     * @param {HTMLElement} captchaBox - Boîte du captcha
     * @param {number} answer - Réponse correcte
     * @param {HTMLElement} overlay - Overlay
     * @param {HTMLFormElement} formElement - Formulaire à soumettre
     */
    setupCaptchaHandlers(captchaBox, answer, overlay, formElement) {
        const input = captchaBox.querySelector('#captcha-input');
        const submitBtn = captchaBox.querySelector('#captcha-submit');
        
        // Focus automatique
        input.focus();
        
        const verify = () => {
            if (this.verifyCaptchaAnswer(input, answer)) {
                this.handleCaptchaSuccess(overlay, formElement);
            } else {
                this.handleCaptchaError(input);
            }
        };
        
        submitBtn.addEventListener('click', verify);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                verify();
            }
        });
        
        // Fermeture au clic sur l'overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    /**
     * Vérifie la réponse du captcha
     * @param {HTMLInputElement} input - Champ de saisie
     * @param {number} answer - Réponse correcte
     * @returns {boolean}
     */
    verifyCaptchaAnswer(input, answer) {
        const userAnswer = parseInt(input.value);
        return userAnswer === answer;
    }

    /**
     * Gère le succès du captcha
     * @param {HTMLElement} overlay - Overlay à supprimer
     * @param {HTMLFormElement} formElement - Formulaire à soumettre
     */
    handleCaptchaSuccess(overlay, formElement) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), THEME_TRANSITION_DURATION);
        
        this.showSuccess('Vérification réussie !');
        this.submitFormData(formElement);
    }

    /**
     * Gère l'échec du captcha
     * @param {HTMLInputElement} input - Champ de saisie
     */
    handleCaptchaError(input) {
        input.style.borderColor = '#dc2626';
        input.style.animation = 'shake 0.3s';
        input.value = '';
        input.placeholder = 'Réponse incorrecte, réessayez';
        
        setTimeout(() => {
            input.style.borderColor = '#e2e8f0';
            input.placeholder = '';
        }, 2000);
    }

    /**
     * Affiche le challenge captcha
     * @param {HTMLFormElement} formElement - Formulaire à protéger
     */
    showCaptchaChallenge(formElement) {
        const { num1, num2, answer } = this.generateMathChallenge();
        const overlay = this.createCaptchaOverlay();
        const captchaBox = this.createCaptchaBox(num1, num2);
        
        overlay.appendChild(captchaBox);
        document.body.appendChild(overlay);
        
        this.activeOverlay = overlay;
        this.setupCaptchaHandlers(captchaBox, answer, overlay, formElement);
    }

    /**
     * Soumet les données du formulaire
     * @param {HTMLFormElement} formElement - Formulaire
     */
    submitFormData(formElement) {
        const formData = new FormData(formElement);
        console.log('✅ Formulaire validé et prêt à être envoyé:', Object.fromEntries(formData));
        
        // En production, faire un fetch vers le backend
        this.showSuccess('Message envoyé avec succès !');
        
        // Réinitialiser le formulaire après soumission
        formElement.reset();
    }

    /**
     * Affiche une notification de succès
     * @param {string} message - Message à afficher
     */
    showSuccess(message) {
        this.showNotification(message, '#10b981', '✅');
    }

    /**
     * Affiche une notification
     * @param {string} message - Message
     * @param {string} color - Couleur de fond
     * @param {string} icon - Icône
     */
    showNotification(message, color, icon) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        
        notification.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), THEME_TRANSITION_DURATION);
        }, NOTIFICATION_DURATION);
    }
}

// Export de l'instance singleton
export const captchaSystem = new CaptchaSystem();

// Export par défaut
export default CaptchaSystem;
