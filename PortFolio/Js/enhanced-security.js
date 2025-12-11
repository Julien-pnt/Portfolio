/*
==========================================================================
ENHANCED SECURITY - PORTFOLIO JULIEN PINOT
Sécurité renforcée avec architecture modulaire
Utilise BotDetector, RateLimiter, CaptchaSystem
==========================================================================
*/

import { botDetector } from './modules/bot-detector.js';
import { rateLimiter } from './modules/rate-limiter.js';
import { captchaSystem } from './modules/captcha-system.js';

// ==================== CONSTANTES ====================
const FORM_MIN_FILL_TIME = 3000;
const NOTIFICATION_DURATION = 4000;

class EnhancedSecurityManager {
    constructor() {
        this.botDetector = botDetector;
        this.rateLimiter = rateLimiter;
        this.captchaSystem = captchaSystem;
        this.init();
    }

    init() {
        console.log('%c🔒 Enhanced Security System Active', 'color: #00ff00; font-weight: bold;');
        
        // Initialiser les modules de sécurité
        this.botDetector.init();
        this.rateLimiter.init();
        
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
    // PROTECTION FORMULAIRES AVEC CAPTCHA (délégué au module)
    // =====================================
    secureFormWithCaptcha(formElement) {
        // Guard Clause - vérifier que le formulaire existe
        if (!formElement) {
            console.error('EnhancedSecurity: Formulaire invalide');
            return;
        }

        // Ajouter un honeypot (champ invisible pour piéger les bots)
        const honeypot = this.createHoneypot();
        const timestamp = this.createTimestamp();
        
        formElement.appendChild(honeypot);
        formElement.appendChild(timestamp);

        // Validation lors de la soumission
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Guard Clause - vérifier le honeypot
            if (honeypot.value !== '') {
                console.warn('🤖 Bot détecté via honeypot');
                return false;
            }
            
            // Guard Clause - vérifier le temps de remplissage
            const fillTime = Date.now() - parseInt(timestamp.value);
            if (fillTime < FORM_MIN_FILL_TIME) {
                this.showWarning('Veuillez prendre votre temps pour remplir le formulaire');
                return false;
            }
            
            // Guard Clause - vérifier rate limit
            const formId = formElement.id || 'form';
            if (!this.rateLimiter.checkFormSubmitLimit(formId)) {
                return false;
            }
            
            // Déléguer au CaptchaSystem
            this.captchaSystem.showCaptchaChallenge(formElement);
        });
    }

    createHoneypot() {
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.cssText = 'position:absolute;left:-9999px;';
        honeypot.tabIndex = -1;
        honeypot.setAttribute('autocomplete', 'off');
        return honeypot;
    }

    createTimestamp() {
        const timestamp = document.createElement('input');
        timestamp.type = 'hidden';
        timestamp.name = 'form_timestamp';
        timestamp.value = Date.now().toString();
        return timestamp;
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
        // Déléguer au CaptchaSystem pour cohérence
        this.captchaSystem.showSuccess(message);
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
            botScore: this.botDetector.getScore(),
            botDetected: this.botDetector.isBotDetected(),
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
