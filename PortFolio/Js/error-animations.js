/*
==========================================================================
ERROR PAGES ANIMATIONS - PORTFOLIO JULIEN PINOT
Animations sécurisées selon recommandations ANSSI
==========================================================================
*/

(function() {
    'use strict';

    // Configuration
    const PARTICLE_COUNT = 30;
    const PARTICLE_COLORS = ['#2563eb', '#60a5fa', '#93c5fd'];
    const MAX_PARTICLES = 50; // ANSSI - Limite pour éviter DoS côté client
    const ANIMATION_TIMEOUT = 100; // Protection contre boucles infinies
    
    /**
     * Validation et sanitization des entrées utilisateur
     * @param {*} value - Valeur à valider
     * @param {string} type - Type attendu
     * @returns {boolean}
     */
    function isValidInput(value, type) {
        if (value === null || value === undefined) return false;
        if (type === 'number') return typeof value === 'number' && !isNaN(value) && isFinite(value);
        if (type === 'string') return typeof value === 'string' && value.length < 1000;
        return false;
    }

    /**
     * Échappe les caractères HTML pour prévenir XSS
     * @param {string} str - Chaîne à échapper
     * @returns {string}
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    /**
     * Crée des particules flottantes animées (sécurisé ANSSI)
     */
    function createFloatingParticles() {
        const container = document.querySelector('.particles-bg');
        if (!container) return;

        // ANSSI - Limiter le nombre de particules
        const safeParticleCount = Math.min(PARTICLE_COUNT, MAX_PARTICLES);

        for (let i = 0; i < safeParticleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // ANSSI - Valeurs contrôlées et bornées
            const size = Math.max(2, Math.min(6, Math.random() * 4 + 2));
            const colorIndex = Math.floor(Math.random() * PARTICLE_COLORS.length);
            const color = PARTICLE_COLORS[colorIndex];
            const x = Math.max(0, Math.min(100, Math.random() * 100));
            const y = Math.max(0, Math.min(100, Math.random() * 100));
            const duration = Math.max(15, Math.min(35, Math.random() * 20 + 15));
            const delay = Math.max(0, Math.min(10, Math.random() * 5));
            
            // ANSSI - Utilisation de textContent au lieu de innerHTML
            particle.setAttribute('aria-hidden', 'true');
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${x}%;
                top: ${y}%;
                opacity: 0.3;
                animation: float-particle ${duration}s linear ${delay}s infinite;
                box-shadow: 0 0 ${size * 2}px ${color};
                pointer-events: none;
            `;
            
            container.appendChild(particle);
        }
        
        addParticleAnimation();
    }
    
    /**
     * Ajoute l'animation CSS pour les particules (sécurisé)
     */
    function addParticleAnimation() {
        if (document.getElementById('particle-animation')) return;
        
        const style = document.createElement('style');
        style.id = 'particle-animation';
        style.setAttribute('nonce', 'error-page-animations'); // ANSSI - CSP nonce
        
        // ANSSI - Valeurs contrôlées pour l'animation
        const translateX = Math.max(-200, Math.min(200, Math.random() * 200 - 100));
        const translateY = Math.max(-200, Math.min(200, Math.random() * 200 - 100));
        
        style.textContent = `
            @keyframes float-particle {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.3;
                }
                90% {
                    opacity: 0.3;
                }
                100% {
                    transform: translate(${translateX}px, ${translateY}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Effet de typing sur le titre d'erreur (sécurisé ANSSI)
     */
    function typewriterEffect() {
        const title = document.querySelector('.error-title');
        if (!title || title.dataset.typed === 'true') return;
        
        const text = title.textContent;
        // ANSSI - Validation de la longueur
        if (!isValidInput(text, 'string') || text.length > 200) return;
        
        title.textContent = '';
        title.dataset.typed = 'true';
        
        let index = 0;
        const speed = 50;
        let iterations = 0;
        const maxIterations = text.length + 10; // ANSSI - Protection boucle infinie
        
        function type() {
            // ANSSI - Double protection contre boucle infinie
            if (iterations++ > maxIterations) return;
            
            if (index < text.length) {
                // ANSSI - Utilisation de textContent (pas innerHTML)
                title.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    /**
     * Effet de parallaxe sur le code d'erreur (sécurisé ANSSI)
     */
    function setupParallax() {
        const errorCode = document.querySelector('.error-code');
        if (!errorCode) return;
        
        // ANSSI - Throttling pour limiter la charge CPU
        let ticking = false;
        
        document.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // ANSSI - Valeurs bornées pour éviter manipulation DOM excessive
                    const x = Math.max(-30, Math.min(30, (e.clientX / window.innerWidth - 0.5) * 20));
                    const y = Math.max(-30, Math.min(30, (e.clientY / window.innerHeight - 0.5) * 20));
                    
                    errorCode.style.transform = `translate(${x}px, ${y}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    /**
     * Animation de scan laser (effet cybersécurité - sécurisé ANSSI)
     */
    function createLaserScan() {
        const container = document.querySelector('.error-code-wrapper');
        if (!container || container.querySelector('.laser-scan')) return;
        
        const laser = document.createElement('div');
        laser.className = 'laser-scan';
        laser.setAttribute('aria-hidden', 'true'); // ANSSI - Accessibilité
        laser.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #2563eb, transparent);
            box-shadow: 0 0 20px #2563eb;
            animation: laser-scan 3s ease-in-out infinite;
            pointer-events: none;
        `;
        
        container.style.position = 'relative';
        container.appendChild(laser);
        
        // ANSSI - Ajouter l'animation avec nonce
        const style = document.createElement('style');
        style.setAttribute('nonce', 'error-page-animations');
        style.textContent = `
            @keyframes laser-scan {
                0%, 100% {
                    top: 0;
                    opacity: 0;
                }
                5% {
                    opacity: 1;
                }
                95% {
                    opacity: 1;
                }
                100% {
                    top: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Effet de glitch aléatoire sur le code
     */
    function randomGlitch() {
        const errorCode = document.querySelector('.error-code');
        if (!errorCode) return;
        
        setInterval(() => {
            if (Math.random() > 0.95) {
                errorCode.style.textShadow = '2px 2px #ef4444, -2px -2px #2563eb';
                setTimeout(() => {
                    errorCode.style.textShadow = '';
                }, 100);
            }
        }, 500);
    }
    
    /**
     * Compte à rebours visuel (pour 503 - sécurisé ANSSI)
     */
    function setupCountdown() {
        const countdown = document.getElementById('countdown-timer');
        if (!countdown) return;
        
        let seconds = parseInt(countdown.textContent, 10);
        
        // ANSSI - Validation des entrées
        if (!isValidInput(seconds, 'number') || seconds < 0 || seconds > 300) {
            seconds = 30; // Valeur par défaut sécurisée
        }
        
        let iterations = 0;
        const maxIterations = seconds + 10; // ANSSI - Protection boucle infinie
        
        const interval = setInterval(() => {
            // ANSSI - Double protection
            if (iterations++ > maxIterations || seconds < 0) {
                clearInterval(interval);
                return;
            }
            
            seconds--;
            // ANSSI - Utilisation de textContent
            countdown.textContent = String(seconds);
            
            // Animation du chiffre (valeurs bornées)
            countdown.style.transform = 'scale(1.2)';
            countdown.style.color = seconds <= 10 ? '#ef4444' : '#f59e0b';
            
            setTimeout(() => {
                countdown.style.transform = 'scale(1)';
            }, 200);
            
            if (seconds <= 0) {
                clearInterval(interval);
            }
        }, 1000);
    }

    /**
     * Animation des boutons au hover (particules)
     */
    function setupButtonEffects() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    /**
     * Initialisation de tous les effets
     */
    function init() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        // Créer les animations
        createFloatingParticles();
        createLaserScan();
        setupParallax();
        setupButtonEffects();
        randomGlitch();
        
        // Effects conditionnels
        if (document.getElementById('countdown-timer')) {
            setupCountdown();
        }
        
        // Petit délai pour l'effet typing
        setTimeout(typewriterEffect, 800);
    }

    // Lancer l'initialisation
    init();

})();
