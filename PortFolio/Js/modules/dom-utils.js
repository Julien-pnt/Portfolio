/*
==========================================================================
DOM UTILITIES - Manipulation sécurisée du DOM
Prévention XSS et helpers pour createElement
==========================================================================
*/

/**
 * Crée un élément DOM de manière sécurisée avec du contenu textuel
 * @param {string} tag - Nom du tag HTML
 * @param {Object} options - Options de configuration
 * @returns {HTMLElement}
 */
export function createSafeElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    // Texte sécurisé (prévention XSS)
    if (options.text) {
        element.textContent = options.text;
    }
    
    // Classes CSS
    if (options.className) {
        element.className = options.className;
    }
    
    if (options.classList) {
        options.classList.forEach(cls => element.classList.add(cls));
    }
    
    // Attributs
    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    
    // Styles inline
    if (options.styles) {
        Object.assign(element.style, options.styles);
    }
    
    // Enfants
    if (options.children) {
        options.children.forEach(child => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    }
    
    return element;
}

/**
 * Crée une notification sécurisée
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification ('success', 'error', 'warning', 'info')
 * @param {number} duration - Durée d'affichage en ms
 * @returns {HTMLElement}
 */
export function createNotification(message, type = 'info', duration = 4000) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const iconSpan = createSafeElement('span', { text: icons[type] });
    const messageSpan = createSafeElement('span', { text: message });
    
    const notification = createSafeElement('div', {
        className: 'security-notification',
        styles: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: colors[type],
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: '10001',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '500',
            animation: 'slideInRight 0.3s ease'
        },
        children: [iconSpan, messageSpan]
    });
    
    document.body.appendChild(notification);
    
    // Auto-suppression
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
    
    return notification;
}

/**
 * Sanitise une chaîne pour l'utiliser dans le DOM
 * @param {string} str - Chaîne à sanitiser
 * @returns {string}
 */
export function sanitizeText(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Crée un élément avec des enfants imbriqués
 * @param {string} tag - Tag HTML
 * @param {Object} props - Propriétés
 * @param  {...any} children - Enfants (HTMLElement ou string)
 * @returns {HTMLElement}
 */
export function createElement(tag, props = {}, ...children) {
    const element = document.createElement(tag);
    
    // Appliquer les propriétés
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.substring(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Ajouter les enfants
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            element.appendChild(child);
        }
    });
    
    return element;
}

/**
 * Vide un élément de manière sécurisée
 * @param {HTMLElement} element - Élément à vider
 */
export function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Remplace le contenu d'un élément de manière sécurisée
 * @param {HTMLElement} element - Élément cible
 * @param {...HTMLElement} children - Nouveaux enfants
 */
export function replaceChildren(element, ...children) {
    clearElement(element);
    children.forEach(child => {
        if (child instanceof HTMLElement) {
            element.appendChild(child);
        }
    });
}

/**
 * Vérifie si une URL est sûre (pas de javascript:, data:, etc.)
 * @param {string} url - URL à vérifier
 * @returns {boolean}
 */
export function isSafeUrl(url) {
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = url.toLowerCase().trim();
    return !dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol));
}

/**
 * Crée un lien sécurisé
 * @param {string} href - URL de destination
 * @param {string} text - Texte du lien
 * @param {Object} options - Options additionnelles
 * @returns {HTMLElement|null}
 */
export function createSafeLink(href, text, options = {}) {
    if (!isSafeUrl(href)) {
        console.warn('URL dangereuse détectée:', href);
        return null;
    }
    
    const link = createElement('a', {
        href,
        className: options.className || '',
        target: options.target || '_self',
        rel: options.external ? 'noopener noreferrer' : ''
    }, text);
    
    return link;
}

// Export d'un objet avec toutes les utilitaires
export const DOMUtils = {
    createSafeElement,
    createNotification,
    sanitizeText,
    createElement,
    clearElement,
    replaceChildren,
    isSafeUrl,
    createSafeLink
};

export default DOMUtils;
