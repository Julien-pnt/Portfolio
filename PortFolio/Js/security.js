/*
==========================================================================
SYSTÈME DE SÉCURITÉ PORTFOLIO JULIEN PINOT
Expert Cybersécurité - Protection avancée côté client
Architecture modulaire avec CryptoService (Web Crypto API)
==========================================================================
*/

import { cryptoService } from './modules/crypto-service.js';

// ==================== CONSTANTES ====================
const DEVTOOLS_THRESHOLD = 160;
const DEVTOOLS_CHECK_INTERVAL = 500;
const CSRF_TOKEN_LENGTH = 32;
const SESSION_CHECK_INTERVAL = 30000;
const MAX_SECURITY_INCIDENTS = 50;

class SecurityManager {
    constructor() {
        this.init();
        this.setupProtections();
    }

    init() {
        // Démarrage sécurisé
        console.log('%c🔒 Système de sécurité activé', 'color: #00ff00; font-weight: bold;');
        this.detectDevTools();
        this.preventConsoleAccess();
        this.validatePageIntegrity();
    }

    // =====================================
    // PROTECTION CONTRE LES DEVTOOLS
    // =====================================
    detectDevTools() {
        let devtools = {
            open: false,
            orientation: null
        };

        setInterval(() => {
            if (window.outerHeight - window.innerHeight > DEVTOOLS_THRESHOLD || 
                window.outerWidth - window.innerWidth > DEVTOOLS_THRESHOLD) {
                if (!devtools.open) {
                    devtools.open = true;
                    console.clear();
                    console.log('%c⚠️ ATTENTION', 'color: red; font-size: 20px; font-weight: bold;');
                    console.log('%c🔒 Ce portfolio est protégé par des mesures de sécurité avancées', 'color: orange; font-size: 14px;');
                    console.log('%c📧 Contact: julien.pinot@student.com', 'color: blue; font-size: 12px;');
                }
            } else {
                devtools.open = false;
            }
        }, DEVTOOLS_CHECK_INTERVAL);
    }

    // =====================================
    // PROTECTION CONSOLE
    // =====================================
    preventConsoleAccess() {
        // Désactiver le clic droit
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showSecurityWarning('Clic droit désactivé pour des raisons de sécurité');
        });

        // Désactiver les raccourcis développeur
        document.addEventListener('keydown', (e) => {
            // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                this.showSecurityWarning('Raccourcis développeur désactivés');
            }
        });

        // Protection contre la sélection de texte sensible
        document.addEventListener('selectstart', (e) => {
            if (e.target.classList.contains('no-select') || 
                e.target.closest('.security-content')) {
                e.preventDefault();
            }
        });
    }

    // =====================================
    // VALIDATION D'INTÉGRITÉ
    // =====================================
    validatePageIntegrity() {
        // Vérifier l'intégrité des scripts critiques
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (script.src.includes('feather-icons') || script.src.includes('animations.js')) {
                script.onerror = () => {
                    this.handleSecurityIncident('Script critique compromis: ' + script.src);
                };
            }
        });

        // Vérifier les modifications DOM suspectes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeName === 'SCRIPT' && 
                            !node.src.includes('unpkg.com') && 
                            !node.src.includes('animations.js')) {
                            this.handleSecurityIncident('Script non autorisé détecté');
                            node.remove();
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // =====================================
    // PROTECTION XSS AVANCÉE
    // =====================================
    sanitizeInput(input) {
        // Échapper les caractères dangereux
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    validateURL(url) {
        // Vérifier que l'URL est sûre
        const allowedDomains = [
            'unpkg.com',
            'fonts.googleapis.com',
            'fonts.gstatic.com'
        ];

        try {
            const urlObj = new URL(url);
            return allowedDomains.some(domain => urlObj.hostname.includes(domain)) ||
                   urlObj.protocol === 'file:' ||
                   urlObj.hostname === 'localhost';
        } catch {
            return false;
        }
    }

    // =====================================
    // PROTECTION DES FORMULAIRES
    // =====================================
    secureForm(formElement) {
        // Ajouter un token CSRF
        const csrfToken = this.generateCSRFToken();
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = 'csrf_token';
        hiddenField.value = csrfToken;
        formElement.appendChild(hiddenField);

        // Validation en temps réel
        const inputs = formElement.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = this.sanitizeInput(e.target.value);
            });
        });

        // Validation avant soumission
        formElement.addEventListener('submit', (e) => {
            if (!this.validateForm(formElement)) {
                e.preventDefault();
                this.showSecurityWarning('Formulaire invalide détecté');
            }
        });
    }

    generateCSRFToken() {
        // Utiliser Web Crypto API moderne (sécurisé)
        const array = new Uint8Array(CSRF_TOKEN_LENGTH);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // =====================================
    // CHIFFREMENT MODERNE (Web Crypto API via CryptoService)
    // =====================================
    async hashData(data) {
        // Déléguer au CryptoService (architecture modulaire)
        return await cryptoService.hashData(data);
    }

    async encryptData(data, key) {
        // Déléguer au CryptoService (architecture modulaire)
        return await cryptoService.encryptData(data, key);
    }

    async generateEncryptionKey() {
        // Déléguer au CryptoService (architecture modulaire)
        return await cryptoService.generateEncryptionKey();
    }

    async decryptData(encryptedData, key, ivHex) {
        // Déléguer au CryptoService (architecture modulaire)
        return await cryptoService.decryptData(encryptedData, key, ivHex);
    }

    async hashPassword(password, salt = null, iterations = 100000) {
        // Déléguer au CryptoService (architecture modulaire)
        return await cryptoService.hashPassword(password, salt, iterations);
    }

    async verifyPassword(password, storedHash, salt, iterations = 100000) {
        // Déléguer au CryptoService (architecture modulaire)
        return await cryptoService.verifyPassword(password, storedHash, salt, iterations);
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea');
        return Array.from(inputs).every(input => {
            return this.validateInput(input.value);
        });
    }

    validateInput(value) {
        // Guard Clause: valeur vide est valide
        if (!value || value.trim() === '') return true;

        // Patterns dangereux (regex stricte)
        const dangerousPatterns = [
            /<script[\s\S]*?>/gi,           // Script tags
            /javascript:/gi,                  // Protocol javascript
            /on\w+\s*=/gi,                   // Event handlers (onclick, onload, etc.)
            /<iframe[\s\S]*?>/gi,            // iframes
            /eval\s*\(/gi,                   // eval calls
            /<object[\s\S]*?>/gi,            // object tags
            /<embed[\s\S]*?>/gi,             // embed tags
            /vbscript:/gi,                    // vbscript protocol
            /data:text\/html/gi               // data URI HTML
        ];

        // Vérifier chaque pattern
        return !dangerousPatterns.some(pattern => pattern.test(value));
    }

    // =====================================
    // MONITORING DE SÉCURITÉ
    // =====================================
    setupProtections() {
        // Protection contre l'injection de code
        window.addEventListener('error', (e) => {
            if (e.message.includes('script') || e.message.includes('eval')) {
                this.handleSecurityIncident('Tentative d\'injection détectée: ' + e.message);
            }
        });

        // Monitoring des requêtes réseau
        if ('fetch' in window) {
            const originalFetch = window.fetch;
            window.fetch = (...args) => {
                const [url] = args;
                if (!this.validateURL(url)) {
                    this.handleSecurityIncident('Requête non autorisée bloquée: ' + url);
                    return Promise.reject(new Error('Requête bloquée par sécurité'));
                }
                return originalFetch.apply(this, args);
            };
        }

        // Protection contre le détournement de session
        this.monitorSession();
    }

    monitorSession() {
        // Vérifier l'intégrité de la session
        const sessionData = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timestamp: Date.now()
        };

        sessionStorage.setItem('portfolio_session', JSON.stringify(sessionData));

        // Vérification périodique
        setInterval(() => {
            const stored = JSON.parse(sessionStorage.getItem('portfolio_session') || '{}');
            if (stored.userAgent !== navigator.userAgent ||
                stored.language !== navigator.language ||
                stored.platform !== navigator.platform) {
                this.handleSecurityIncident('Détournement de session détecté');
            }
        }, SESSION_CHECK_INTERVAL);
    }

    // =====================================
    // GESTION DES INCIDENTS
    // =====================================
    handleSecurityIncident(message) {
        console.warn('🚨 INCIDENT SÉCURITÉ:', message);
        
        // Log l'incident (en production, envoyer à un serveur de logging)
        const incident = {
            timestamp: new Date().toISOString(),
            message: message,
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer
        };

        // Stocker localement pour analyse
        const incidents = JSON.parse(localStorage.getItem('security_incidents') || '[]');
        incidents.push(incident);
        localStorage.setItem('security_incidents', JSON.stringify(incidents.slice(-MAX_SECURITY_INCIDENTS)));

        // Actions de mitigation
        this.mitigateIncident(message);
    }

    mitigateIncident(message) {
        // Actions automatiques selon le type d'incident
        if (message.includes('injection') || message.includes('script')) {
            // Nettoyer le DOM des éléments suspects
            document.querySelectorAll('script:not([src*="unpkg.com"]):not([src*="animations.js"])').forEach(el => {
                if (!el.src) el.remove(); // Supprimer les scripts inline non autorisés
            });
        }

        if (message.includes('session')) {
            // Régénérer les données de session
            sessionStorage.clear();
            this.monitorSession();
        }
    }

    showSecurityWarning(message) {
        // Affichage discret d'un avertissement
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        warning.textContent = '🔒 ' + message;
        document.body.appendChild(warning);

        // Animation d'apparition
        setTimeout(() => warning.style.opacity = '1', 100);
        
        // Suppression automatique
        setTimeout(() => {
            warning.style.opacity = '0';
            setTimeout(() => warning.remove(), 300);
        }, 3000);
    }

    // =====================================
    // API PUBLIQUE
    // =====================================
    getSecurityStatus() {
        return {
            protectionActive: true,
            incidents: JSON.parse(localStorage.getItem('security_incidents') || '[]'),
            sessionValid: !!sessionStorage.getItem('portfolio_session')
        };
    }
}

// =====================================
// INITIALISATION AUTOMATIQUE
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le gestionnaire de sécurité
    window.PortfolioSecurity = new SecurityManager();

    // Sécuriser tous les formulaires existants
    document.querySelectorAll('form').forEach(form => {
        window.PortfolioSecurity.secureForm(form);
    });

    // Observer les nouveaux formulaires
    const formObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'FORM') {
                    window.PortfolioSecurity.secureForm(node);
                }
            });
        });
    });

    formObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Protection contre l'accès direct au gestionnaire
Object.defineProperty(window, 'PortfolioSecurity', {
    writable: false,
    configurable: false
});
