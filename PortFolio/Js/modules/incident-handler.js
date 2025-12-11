/*
==========================================================================
INCIDENT HANDLER - Gestion centralisée des incidents de sécurité
Délégation depuis enhanced-security.js pour réduire la complexité
==========================================================================
*/

import { cryptoService } from './crypto-service.js';

/**
 * Gestionnaire centralisé des incidents de sécurité
 * @class IncidentHandler
 */
export class IncidentHandler {
    constructor() {
        this.incidents = [];
        this.maxIncidents = 100; // Limite mémoire
    }

    /**
     * Enregistre un incident de sécurité
     * @param {string} type - Type d'incident
     * @param {string} description - Description détaillée
     * @param {Object} context - Contexte additionnel
     */
    async logIncident(type, description, context = {}) {
        const incident = {
            id: await this.generateIncidentId(),
            type,
            description,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            context
        };

        this.incidents.push(incident);
        
        // Limiter la taille du tableau
        if (this.incidents.length > this.maxIncidents) {
            this.incidents.shift();
        }

        // Notification visuelle pour incidents critiques
        if (this.isCritical(type)) {
            this.notifyCriticalIncident(incident);
        }

        return incident;
    }

    /**
     * Génère un ID unique pour l'incident
     * @returns {Promise<string>}
     */
    async generateIncidentId() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString();
        const hash = await cryptoService.hashData(timestamp + random);
        return hash.substring(0, 16);
    }

    /**
     * Vérifie si l'incident est critique
     * @param {string} type - Type d'incident
     * @returns {boolean}
     */
    isCritical(type) {
        const criticalTypes = [
            'xss_attempt',
            'sql_injection',
            'csrf_detected',
            'bot_confirmed',
            'rate_limit_exceeded',
            'integrity_violation'
        ];
        return criticalTypes.includes(type);
    }

    /**
     * Notifie l'utilisateur d'un incident critique (admin uniquement)
     * @param {Object} incident - Incident détecté
     */
    notifyCriticalIncident(incident) {
        // En production, cela pourrait envoyer à un endpoint de monitoring
        // Logging silencieux pour éviter l'exposition d'informations sensibles
    }

    /**
     * Récupère les incidents d'un type spécifique
     * @param {string} type - Type d'incident
     * @returns {Array}
     */
    getIncidentsByType(type) {
        return this.incidents.filter(incident => incident.type === type);
    }

    /**
     * Récupère les incidents des dernières N minutes
     * @param {number} minutes - Nombre de minutes
     * @returns {Array}
     */
    getRecentIncidents(minutes = 5) {
        const cutoff = Date.now() - (minutes * 60 * 1000);
        return this.incidents.filter(incident => incident.timestamp >= cutoff);
    }

    /**
     * Vérifie si on est en développement
     * @returns {boolean}
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.port !== '';
    }

    /**
     * Exporte les incidents pour analyse (format JSON)
     * @returns {string}
     */
    exportIncidents() {
        return JSON.stringify(this.incidents, null, 2);
    }

    /**
     * Efface tous les incidents
     */
    clearIncidents() {
        this.incidents = [];
    }

    /**
     * Statistiques des incidents
     * @returns {Object}
     */
    getStatistics() {
        const stats = {
            total: this.incidents.length,
            byType: {},
            critical: 0,
            last24h: 0
        };

        const dayAgo = Date.now() - (24 * 60 * 60 * 1000);

        this.incidents.forEach(incident => {
            // Comptage par type
            stats.byType[incident.type] = (stats.byType[incident.type] || 0) + 1;
            
            // Incidents critiques
            if (this.isCritical(incident.type)) {
                stats.critical++;
            }
            
            // Incidents des dernières 24h
            if (incident.timestamp >= dayAgo) {
                stats.last24h++;
            }
        });

        return stats;
    }
}

// Export de l'instance singleton
export const incidentHandler = new IncidentHandler();

// Export par défaut
export default IncidentHandler;
