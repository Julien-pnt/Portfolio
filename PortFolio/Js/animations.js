/*
==========================================================================
ANIMATIONS JAVASCRIPT PORTFOLIO JULIEN PINOT
Gestion intelligente des animations avec Intersection Observer
==========================================================================
*/

class PortfolioAnimations {
    constructor() {
        this.init();
    }

    init() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAnimations());
        } else {
            this.setupAnimations();
        }
    }

    setupAnimations() {
        this.createParticles();
        this.setupIntersectionObserver();
        this.setupHeaderAnimation();
        this.setupTypingEffect();
        this.setupCardAnimations();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.animateCounters();
    }

    // Création de particules flottantes
    createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'floating-particles';
        document.body.appendChild(particlesContainer);

        // Créer 15 particules avec des tailles et vitesses différentes
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Taille aléatoire entre 2 et 6px
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Position horizontale aléatoire
            particle.style.left = `${Math.random() * 100}%`;
            
            // Délai d'animation aléatoire
            particle.style.animationDelay = `${Math.random() * 20}s`;
            
            // Durée d'animation variable
            particle.style.animationDuration = `${15 + Math.random() * 10}s`;
            
            particlesContainer.appendChild(particle);
        }
    }

    // Configuration de l'Intersection Observer pour les animations au scroll
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Ne plus observer l'élément une fois animé
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observer tous les éléments avec les classes d'animation
        const animatedElements = document.querySelectorAll(
            '.observe-fade, .observe-slide-left, .observe-slide-right, .observe-zoom'
        );
        
        animatedElements.forEach(el => observer.observe(el));
    }

    // Animation du header au chargement
    setupHeaderAnimation() {
        const header = document.querySelector('.header');
        if (header) {
            header.classList.add('header-animate');
        }
    }

    // Effet de typing pour les titres
    setupTypingEffect() {
        const typingElements = document.querySelectorAll('.typing-effect');
        
        typingElements.forEach((element, index) => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--primary-blue)';
            
            // Délai croissant pour chaque élément
            setTimeout(() => {
                this.typeText(element, text, 50);
            }, index * 500);
        });
    }

    typeText(element, text, speed) {
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                // Faire clignoter le curseur quelques fois puis le supprimer
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 2000);
            }
        }, speed);
    }

    // Animation en cascade pour les cartes
    setupCardAnimations() {
        const cardContainers = document.querySelectorAll('.cards-cascade');
        
        cardContainers.forEach(container => {
            const cards = container.children;
            
            // Observer le conteneur
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Animer les cartes en cascade
                        Array.from(cards).forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('animate-fade-in-up');
                            }, index * 100);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(container);
        });
    }

    // Animations liées au scroll
    setupScrollAnimations() {
        let ticking = false;
        
        const updateScrollAnimations = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Parallaxe pour les éléments hero
            const heroElements = document.querySelectorAll('.hero-parallax');
            heroElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
            
            // Animation de la navbar au scroll
            const navbar = document.querySelector('.header');
            if (navbar) {
                if (scrolled > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
            
            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestScrollUpdate);
    }

    // Effets hover avancés
    setupHoverEffects() {
        // Effet de tilt 3D pour les cartes
        const tiltCards = document.querySelectorAll('.tilt-3d');
        
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        });

        // Effet ripple pour les boutons
        const rippleButtons = document.querySelectorAll('.ripple-effect');
        
        rippleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    left: ${x}px;
                    top: ${y}px;
                    width: ${size}px;
                    height: ${size}px;
                    pointer-events: none;
                    animation: ripple-animation 0.6s ease-out;
                `;
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Ajout des styles pour l'animation ripple
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Animation des barres de progression pour les compétences
    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target;
                    const targetWidth = progressBar.dataset.progress || '0%';
                    
                    setTimeout(() => {
                        progressBar.style.width = targetWidth;
                        progressBar.style.transition = 'width 2s ease-out';
                    }, 200);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        skillBars.forEach(bar => observer.observe(bar));
    }

    // Animation de compteur pour les statistiques
    animateCounters() {
        const counters = document.querySelectorAll('.counter');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.target);
                    const duration = 2000; // 2 secondes
                    const step = target / (duration / 16); // 60fps
                    
                    let current = 0;
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        const displayValue = Math.floor(current);
                        counter.textContent = target === 100 ? displayValue + '%' : displayValue;
                    }, 16);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        counters.forEach(counter => observer.observe(counter));
    }

    // Gestionnaire global pour les effets de performance
    optimizeAnimations() {
        // Réduire les animations sur les appareils moins performants
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            document.body.classList.add('reduced-animations');
        }
        
        // Pauser les animations quand l'onglet n'est pas visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.body.style.animationPlayState = 'paused';
            } else {
                document.body.style.animationPlayState = 'running';
            }
        });
    }
}

// Initialiser les animations
const portfolioAnimations = new PortfolioAnimations();

// Initialiser les icônes Feather si disponibles
if (typeof feather !== 'undefined') {
    feather.replace();
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioAnimations;
}

