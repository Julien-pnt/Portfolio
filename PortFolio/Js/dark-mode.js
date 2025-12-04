/*
==========================================================================
DARK MODE TOGGLE - PORTFOLIO JULIEN PINOT
Gestion du thème sombre avec persistance localStorage
==========================================================================
*/

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
        
        button.innerHTML = `
            <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;
        
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
        }, 300);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Mettre à jour les meta tags pour la couleur du thème (mobile)
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
        }
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
