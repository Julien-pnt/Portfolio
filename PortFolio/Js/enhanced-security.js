/*
==========================================================================
ENHANCED SECURITY - PORTFOLIO JULIEN PINOT
Sécurité renforcée avec rate limiting, bot detection et captcha
==========================================================================
*/

// ==================== CONSTANTES ====================
const BOT_SCORE_USER_AGENT = 30;
const BOT_SCORE_WEBDRIVER = 40;
const BOT_SCORE_NO_INTERACTION = 20;
const BOT_SCORE_HEADLESS = 15;
const BOT_SCORE_THRESHOLD = 50;
const BOT_SCORE_REDUCTION = 5;
const MOUSE_MOVEMENTS_THRESHOLD = 10;
const CLICKS_THRESHOLD = 3;
const SCROLLS_THRESHOLD = 5;
const BOT_CHECK_DELAY = 5000;
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_WARNING_DURATION = 5000;
const FETCH_RATE_LIMIT = 10;
const FETCH_RATE_WINDOW = 10000;
const FORM_MIN_FILL_TIME = 3000;
const FORM_SUBMIT_LIMIT = 3;
const NOTIFICATION_DURATION = 4000;

class EnhancedSecurityManager {
    constructor() {
        this.rateLimiter = new Map();
        this.botScore = 0;
        this.init();
    }

    init() {
        console.log('%c🔒 Enhanced Security System Active', 'color: #00ff00; font-weight: bold;');
        this.setupBotDetection();
        this.setupRateLimiting();
        this.preventBasicAttacks();
        this.validateIntegrity();
    }

    // =====================================
    // BOT DETECTION
    // =====================================
    setupBotDetection() {
        // Vérification user agent
        const ua = navigator.userAgent.toLowerCase();
        const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'];
        if (botPatterns.some(pattern => ua.includes(pattern))) {
            this.botScore += BOT_SCORE_USER_AGENT;
        }

        // Vérification webdriver
        if (navigator.webdriver) {
            this.botScore += BOT_SCORE_WEBDRIVER;
        }

        // Vérification du comportement de navigation
        let mouseMovements = 0;
        let clicks = 0;
        let scrolls = 0;

        document.addEventListener('mousemove', () => {
            mouseMovements++;
            if (mouseMovements > MOUSE_MOVEMENTS_THRESHOLD) this.botScore = Math.max(0, this.botScore - BOT_SCORE_REDUCTION);
        }, { once: false, passive: true });

        document.addEventListener('click', () => {
            clicks++;
            if (clicks > CLICKS_THRESHOLD) this.botScore = Math.max(0, this.botScore - BOT_SCORE_REDUCTION);
        }, { once: false, passive: true });

        document.addEventListener('scroll', () => {
            scrolls++;
            if (scrolls > SCROLLS_THRESHOLD) this.botScore = Math.max(0, this.botScore - BOT_SCORE_REDUCTION);
        }, { once: false, passive: true });

        // Vérification après 5 secondes
        setTimeout(() => {
            if (mouseMovements === 0 && clicks === 0 && scrolls === 0) {
                this.botScore += BOT_SCORE_NO_INTERACTION;
            }
            
            if (this.botScore >= BOT_SCORE_THRESHOLD) {
                console.warn('⚠️ Comportement de bot détecté (score:', this.botScore, ')');
                this.handleBotDetection();
            }
        }, BOT_CHECK_DELAY);

        // Vérification des propriétés manquantes (headless browser)
        if (!window.chrome || !navigator.plugins.length) {
            this.botScore += BOT_SCORE_HEADLESS;
        }
    }

    handleBotDetection() {
        // Actions en cas de détection de bot
        localStorage.setItem('bot_detected', Date.now().toString());
        
        // Ajouter un overlay discret
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.05);
            z-index: 1;
            pointer-events: none;
        `;
        document.body.appendChild(overlay);
    }

    // =====================================
    // RATE LIMITING
    // =====================================
    setupRateLimiting() {
        // Limiter les soumissions de formulaires
        this.formSubmitCount = new Map();
        
        // Limiter les requêtes fetch/ajax
        this.patchFetch();
    }

    checkRateLimit(identifier, maxAttempts = 5, windowMs = 60000) {
        const now = Date.now();
        const attempts = this.rateLimiter.get(identifier) || [];
        
        // Nettoyer les anciennes tentatives
        const recentAttempts = attempts.filter(time => now - time < windowMs);
        
        if (recentAttempts.length >= maxAttempts) {
            const oldestAttempt = Math.min(...recentAttempts);
            const waitTime = Math.ceil((windowMs - (now - oldestAttempt)) / 1000);
            
            this.showRateLimitWarning(waitTime);
            return false;
        }
        
        recentAttempts.push(now);
        this.rateLimiter.set(identifier, recentAttempts);
        return true;
    }

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
        `;
        
        // Créer les éléments de manière sécurisée
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
        `;
        button.textContent = 'Compris';
        button.addEventListener('click', () => warning.remove());
        
        warning.appendChild(emoji);
        warning.appendChild(title);
        warning.appendChild(message);
        warning.appendChild(button);
        warning.appendChild(emoji);
        warning.appendChild(title);
        warning.appendChild(message);
        warning.appendChild(button);
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            warning.style.transition = 'opacity 0.3s';
            warning.style.opacity = '0';
            setTimeout(() => warning.remove(), THEME_TRANSITION_DURATION);
        }, RATE_LIMIT_WARNING_DURATION);
    }

    patchFetch() {
        const originalFetch = window.fetch;
        const self = this;
        
        window.fetch = function(...args) {
            const url = args[0];
            
            // Vérifier rate limit pour cette URL
            if (!self.checkRateLimit('fetch_' + url, FETCH_RATE_LIMIT, FETCH_RATE_WINDOW)) {
                return Promise.reject(new Error('Rate limit exceeded'));
            }
            
            return originalFetch.apply(this, args);
        };
    }

    // =====================================
    // PROTECTION FORMULAIRES AVEC CAPTCHA
    // =====================================
    secureFormWithCaptcha(formElement) {
        // Ajouter un honeypot (champ invisible pour piéger les bots)
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.cssText = 'position:absolute;left:-9999px;';
        honeypot.tabIndex = -1;
        honeypot.setAttribute('autocomplete', 'off');
        formElement.appendChild(honeypot);

        // Ajouter un timestamp
        const timestamp = document.createElement('input');
        timestamp.type = 'hidden';
        timestamp.name = 'form_timestamp';
        timestamp.value = Date.now().toString();
        formElement.appendChild(timestamp);

        // Validation lors de la soumission
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Vérifier le honeypot
            if (honeypot.value !== '') {
                console.warn('🤖 Bot détecté via honeypot');
                return false;
            }
            
            // Vérifier le temps de remplissage (les bots sont trop rapides)
            const fillTime = Date.now() - parseInt(timestamp.value);
            if (fillTime < FORM_MIN_FILL_TIME) {
                this.showWarning('Veuillez prendre votre temps pour remplir le formulaire');
                return false;
            }
            
            // Vérifier rate limit
            const formId = formElement.id || 'form';
            if (!this.checkRateLimit('form_' + formId, FORM_SUBMIT_LIMIT, RATE_LIMIT_WINDOW_MS)) {
                return false;
            }
            
            // Simuler une vérification captcha
            this.showCaptchaChallenge(formElement);
        });
    }

    showCaptchaChallenge(formElement) {
        const { num1, num2, answer } = this.generateMathChallenge();
        const overlay = this.createCaptchaOverlay();
        const captchaBox = this.createCaptchaBox(num1, num2);
        
        overlay.appendChild(captchaBox);
        document.body.appendChild(overlay);
        
        this.setupCaptchaHandlers(captchaBox, answer, overlay, formElement);
    }

    generateMathChallenge() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const answer = num1 + num2;
        return { num1, num2, answer };
    }

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
        `;
        return overlay;
    }

    createCaptchaBox(num1, num2) {
        const captchaBox = document.createElement('div');
        captchaBox.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
        `;
        
        const elements = this.createCaptchaElements(num1, num2);
        elements.forEach(el => captchaBox.appendChild(el));
        
        return captchaBox;
    }

    createCaptchaElements(num1, num2) {
        const emoji = document.createElement('div');
        emoji.style.cssText = 'font-size: 2rem; margin-bottom: 1rem;';
        emoji.textContent = '🤔';
        
        const title = document.createElement('h3');
        title.style.cssText = 'margin-bottom: 1rem;';
        title.textContent = 'Vérification humaine';
        
        const question = document.createElement('p');
        question.style.cssText = 'color: #64748b; margin-bottom: 1.5rem;';
        question.textContent = `Combien font ${num1} + ${num2} ?`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'captcha-input';
        input.style.cssText = `
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1.1rem;
            text-align: center;
            margin-bottom: 1rem;
        `;
        
        const submitBtn = document.createElement('button');
        submitBtn.id = 'captcha-submit';
        submitBtn.textContent = 'Vérifier';
        submitBtn.style.cssText = `
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            width: 100%;
        `;
        
        return [emoji, title, question, input, submitBtn];
    }

    setupCaptchaHandlers(captchaBox, answer, overlay, formElement) {
        const input = captchaBox.querySelector('#captcha-input');
        const submitBtn = captchaBox.querySelector('#captcha-submit');
        
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
            if (e.key === 'Enter') verify();
        });
    }

    verifyCaptchaAnswer(input, answer) {
        return parseInt(input.value) === answer;
    }

    handleCaptchaSuccess(overlay, formElement) {
        overlay.remove();
        this.showSuccess('Vérification réussie !');
        this.submitFormData(formElement);
    }

    handleCaptchaError(input) {
        input.style.borderColor = '#dc2626';
        input.value = '';
        input.placeholder = 'Réponse incorrecte, réessayez';
    }

    submitFormData(formElement) {
        // Logique de soumission du formulaire
        const formData = new FormData(formElement);
        console.log('✅ Formulaire validé et prêt à être envoyé:', Object.fromEntries(formData));
        
        // En production, faire un fetch vers votre backend ici
        this.showSuccess('Message envoyé avec succès !');
    }

    // =====================================
    // PROTECTION DE BASE
    // =====================================
    preventBasicAttacks() {
        // Protection contre les raccourcis développeur (optionnel)
        // Note: Commenté pour ne pas gêner l'expérience développeur légitime
        // Décommenter en production si nécessaire
    }

    validateIntegrity() {
        // Vérifier l'intégrité des scripts
        const criticalScripts = document.querySelectorAll('script[src][integrity]');
        
        criticalScripts.forEach(script => {
            script.addEventListener('error', () => {
                console.error('❌ Échec de validation d\'intégrité:', script.src);
                this.handleSecurityIncident('Script integrity check failed: ' + script.src);
            });
        });
    }

    // =====================================
    // UTILITAIRES
    // =====================================
    showWarning(message) {
        this.showNotification(message, '#f59e0b', '⚠️');
    }

    showSuccess(message) {
        this.showNotification(message, '#10b981', '✅');
    }

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
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = icon + ' ' + message;
        document.body.appendChild(notification);

        setTimeout(() => notification.style.opacity = '1', 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, NOTIFICATION_DURATION);
    }

    handleSecurityIncident(message) {
        console.warn('🚨 SECURITY INCIDENT:', message);
        
        const incident = {
            timestamp: new Date().toISOString(),
            message: message,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        const incidents = JSON.parse(localStorage.getItem('security_incidents') || '[]');
        incidents.push(incident);
        localStorage.setItem('security_incidents', JSON.stringify(incidents.slice(-100)));
    }

    // API publique
    getSecurityStats() {
        return {
            botScore: this.botScore,
            rateLimiters: this.rateLimiter.size,
            incidents: JSON.parse(localStorage.getItem('security_incidents') || '[]').length
        };
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.EnhancedSecurity = new EnhancedSecurityManager();
    
    // Sécuriser tous les formulaires
    document.querySelectorAll('form').forEach(form => {
        window.EnhancedSecurity.secureFormWithCaptcha(form);
    });
});
