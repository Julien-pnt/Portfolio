/*
==========================================================================
ROUTER - PORTFOLIO JULIEN PINOT
Système de routage côté client pour URLs propres
==========================================================================
*/

class Router {
    constructor() {
        this.routes = {
            '/': '/PortFolio/Html/Index.html',
            '/accueil': '/PortFolio/Html/Index.html',
            '/cv': '/PortFolio/Html/CV.html',
            '/competences': '/PortFolio/Html/Compétences.html',
            '/projets': '/PortFolio/Html/Projets.html',
            '/experiences': '/PortFolio/Html/Experiences.html',
            '/certifications': '/PortFolio/Html/Certifications.html',
            '/veille': '/PortFolio/Html/Veilles-techno.html',
            '/passions': '/PortFolio/Html/Passions.html',
            '/contact': '/PortFolio/Html/Contact.html',
            '/stage': '/PortFolio/Html/Rapport-Stage-GigaMedia.html'
        };
        
        this.init();
    }

    init() {
        console.log('Router initialized');
        
        // Intercepter les clics sur les liens
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            
            if (link && this.isInternalLink(link)) {
                e.preventDefault();
                const href = link.getAttribute('href');
                console.log('Link clicked:', href);
                const path = this.getCleanPath(href);
                console.log('Clean path:', path);
                this.navigate(path);
            }
        });

        // Gérer le bouton retour du navigateur
        window.addEventListener('popstate', (e) => {
            console.log('Popstate event:', e.state);
            const path = window.location.pathname;
            window.location.href = this.routes[path] || '/PortFolio/Html/Index.html';
        });
    }

    isInternalLink(link) {
        const href = link.getAttribute('href');
        if (!href) return false;
        
        // Ignorer les liens externes, ancres et mailto
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
            return false;
        }
        
        // Vérifier si c'est un lien vers une page HTML du portfolio
        return href.endsWith('.html') || this.routes[href];
    }

    getCleanPath(href) {
        // Convertir les liens HTML en chemins propres
        const htmlToPath = {
            'Index.html': '/',
            'CV.html': '/cv',
            'Compétences.html': '/competences',
            'Projets.html': '/projets',
            'Experiences.html': '/experiences',
            'Certifications.html': '/certifications',
            'Veilles-techno.html': '/veille',
            'Passions.html': '/passions',
            'Contact.html': '/contact',
            'Rapport-Stage-GigaMedia.html': '/stage'
        };

        // Si c'est un lien HTML, le convertir
        if (href.endsWith('.html')) {
            const filename = href.split('/').pop();
            return htmlToPath[filename] || href;
        }

        return href;
    }

    navigate(path) {
        console.log('Navigating to:', path);
        
        if (this.routes[path]) {
            const targetFile = this.routes[path];
            console.log('Target file:', targetFile);
            
            // Mettre à jour l'URL sans recharger
            window.history.pushState({ path }, '', path);
            
            // Rediriger vers le fichier HTML
            window.location.href = targetFile;
        } else {
            console.error('Route non trouvée:', path);
        }
    }


}

// Initialiser le router après le chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.router = new Router();
    });
} else {
    window.router = new Router();
}
