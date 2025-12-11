/*
==========================================================================
MENU BURGER MOBILE - PORTFOLIO JULIEN PINOT
Gestion du menu hamburger responsive
==========================================================================
*/

// ==================== CONSTANTES ====================
const MOBILE_BREAKPOINT = 768;
const SCROLL_THRESHOLD = 50;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // ==================== MENU BURGER MOBILE ====================
    const burgerMenu = document.getElementById('burgerMenu');
    const navbar = document.getElementById('navbar');
    const navbarLinks = document.querySelectorAll('.navbar__link');
    
    if (!burgerMenu || !navbar) {
        console.warn('Menu burger non trouvé sur cette page');
        return;
    }
    
    // Toggle menu mobile
    burgerMenu.addEventListener('click', function() {
        burgerMenu.classList.toggle('active');
        navbar.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Accessibilité
        const isExpanded = burgerMenu.classList.contains('active');
        burgerMenu.setAttribute('aria-expanded', isExpanded);
    });
    
    // Fermer le menu quand on clique sur un lien
    navbarLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            burgerMenu.classList.remove('active');
            navbar.classList.remove('active');
            document.body.classList.remove('menu-open');
            burgerMenu.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Fermer le menu avec la touche Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navbar.classList.contains('active')) {
            burgerMenu.classList.remove('active');
            navbar.classList.remove('active');
            document.body.classList.remove('menu-open');
            burgerMenu.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Fermer le menu en cliquant en dehors (sur mobile)
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            if (!navbar.contains(e.target) && !burgerMenu.contains(e.target) && navbar.classList.contains('active')) {
                burgerMenu.classList.remove('active');
                navbar.classList.remove('active');
                document.body.classList.remove('menu-open');
                burgerMenu.setAttribute('aria-expanded', 'false');
            }
        }
    });
    
    // Fermer le menu si on redimensionne la fenêtre en mode desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            burgerMenu.classList.remove('active');
            navbar.classList.remove('active');
            document.body.classList.remove('menu-open');
            burgerMenu.setAttribute('aria-expanded', 'false');
        }
    });
});

// Animation du header au scroll (déplacé ici depuis Index.html)
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > SCROLL_THRESHOLD) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});
