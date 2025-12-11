/*
==========================================================================
DARK MODE TOGGLE - PORTFOLIO JULIEN PINOT
Gestion du thème sombre avec persistance localStorage
==========================================================================
*/

// ==================== CONSTANTES ====================
const THEME_TRANSITION_DURATION = 300;

class DarkModeToggle {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Appliquer le thème sauvegardé au chargement
        this.applyTheme(this.theme);
        
        // Créer le bouton toggle
        this.createToggleButton();
        
        // Détecter la préférence système si aucun thème n'est sauvegardé
        if (!localStorage.getItem('theme')) {
            this.detectSystemPreference();
        }
    }

    createToggleButton() {
        console.log('Creating toggle button...');
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Changer de thème');
        button.setAttribute('title', 'Changer de thème');
        
        // Créer l'icône du soleil avec createElement (sécurisé)
        const sunIcon = this.createSVGIcon('sun');
        const moonIcon = this.createSVGIcon('moon');
        
        button.appendChild(sunIcon);
        button.appendChild(moonIcon);
        
        button.addEventListener('click', () => {
            console.log('Toggle button clicked!');
            this.toggleTheme();
        });
        document.body.appendChild(button);
        console.log('Toggle button added to body');
    }

    toggleTheme() {
        console.log('toggleTheme called, current theme:', this.theme);
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        console.log('New theme:', this.theme);
        this.applyTheme(this.theme);
        localStorage.setItem('theme', this.theme);
        
        // Animation de feedback
        const button = document.querySelector('.theme-toggle');
        button.style.transform = 'scale(0.9) rotate(180deg)';
        setTimeout(() => {
            button.style.transform = '';
        }, THEME_TRANSITION_DURATION);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Mettre à jour les meta tags pour la couleur du thème (mobile)
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
        }
    }

    createSVGIcon(type) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        
        if (type === 'sun') {
            svg.setAttribute('class', 'sun-icon');
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '12');
            circle.setAttribute('cy', '12');
            circle.setAttribute('r', '5');
            svg.appendChild(circle);
            
            const lines = [
                [12, 1, 12, 3], [12, 21, 12, 23], [4.22, 4.22, 5.64, 5.64],
                [18.36, 18.36, 19.78, 19.78], [1, 12, 3, 12], [21, 12, 23, 12],
                [4.22, 19.78, 5.64, 18.36], [18.36, 5.64, 19.78, 4.22]
            ];
            
            lines.forEach(([x1, y1, x2, y2]) => {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                svg.appendChild(line);
            });
        } else if (type === 'moon') {
            svg.setAttribute('class', 'moon-icon');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
            svg.appendChild(path);
        }
        
        return svg;
    }

    detectSystemPreference() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        if (prefersDark.matches) {
            this.theme = 'dark';
            this.applyTheme('dark');
            localStorage.setItem('theme', 'dark');
        }
        
        // Écouter les changements de préférence système
        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme-manual')) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.theme);
            }
        });
    }
}

// Initialiser le dark mode dès que possible (avant le DOM complet)
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
}

// Initialiser après le chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DarkModeToggle();
    });
} else {
    new DarkModeToggle();
}
