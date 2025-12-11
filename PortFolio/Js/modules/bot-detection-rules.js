/*
==========================================================================
BOT DETECTION RULES - Configuration des heuristiques
Extraction des règles de détection pour alléger bot-detector.js
==========================================================================
*/

export const BOT_DETECTION_RULES = {
    // Patterns User-Agent suspects
    userAgentPatterns: [
        'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
        'python', 'java', 'perl', 'ruby', 'go-http-client'
    ],
    
    // Scores de détection
    scores: {
        USER_AGENT: 50,
        WEBDRIVER: 70,
        AUTOMATION: 60,
        NO_TOUCH: 20,
        NO_MOUSE: 15,
        HEADLESS: 80,
        PHANTOM: 90,
        SUSPICIOUS_TIMING: 30,
        NO_PLUGINS: 10,
        DISABLED_IMAGES: 20,
        ABNORMAL_SCREEN: 25
    },
    
    // Seuils de décision
    thresholds: {
        CONFIRMED_BOT: 100,
        LIKELY_BOT: 70,
        SUSPICIOUS: 40
    },
    
    // Timing suspects (en ms)
    suspiciousTiming: {
        MIN_HUMAN_INTERVAL: 100,  // Trop rapide = bot
        MAX_HUMAN_INTERVAL: 30000, // Trop lent = automation
        MIN_PAGE_TIME: 1000        // Moins d'1s sur la page = suspect
    },
    
    // Résolutions d'écran suspectes
    abnormalScreenSizes: [
        { width: 800, height: 600 },   // Headless Chrome default
        { width: 1024, height: 768 },  // PhantomJS default
        { width: 1280, height: 1024 }  // Selenium default
    ],
    
    // Propriétés de détection dans window/navigator
    detectionProperties: [
        'webdriver',
        '__nightmare',
        '__phantomas',
        'callPhantom',
        '_phantom',
        'phantom',
        '__selenium_unwrapped',
        '__webdriver_script_fn'
    ]
};

/**
 * Vérifie si le User-Agent correspond à un bot connu
 * @param {string} userAgent - User-Agent du navigateur
 * @returns {boolean}
 */
export function isSuspiciousUserAgent(userAgent) {
    const ua = userAgent.toLowerCase();
    return BOT_DETECTION_RULES.userAgentPatterns.some(pattern => ua.includes(pattern));
}

/**
 * Vérifie si la résolution d'écran est suspecte
 * @param {number} width - Largeur d'écran
 * @param {number} height - Hauteur d'écran
 * @returns {boolean}
 */
export function isAbnormalScreenSize(width, height) {
    return BOT_DETECTION_RULES.abnormalScreenSizes.some(
        size => size.width === width && size.height === height
    );
}

/**
 * Calcule le score total de bot
 * @param {Object} detections - Objet des détections (clés = types, valeurs = booléens)
 * @returns {number}
 */
export function calculateBotScore(detections) {
    const scores = BOT_DETECTION_RULES.scores;
    let total = 0;
    
    if (detections.userAgent) total += scores.USER_AGENT;
    if (detections.webdriver) total += scores.WEBDRIVER;
    if (detections.automation) total += scores.AUTOMATION;
    if (detections.noTouch) total += scores.NO_TOUCH;
    if (detections.noMouse) total += scores.NO_MOUSE;
    if (detections.headless) total += scores.HEADLESS;
    if (detections.phantom) total += scores.PHANTOM;
    if (detections.suspiciousTiming) total += scores.SUSPICIOUS_TIMING;
    if (detections.noPlugins) total += scores.NO_PLUGINS;
    if (detections.disabledImages) total += scores.DISABLED_IMAGES;
    if (detections.abnormalScreen) total += scores.ABNORMAL_SCREEN;
    
    return total;
}

/**
 * Détermine le niveau de menace basé sur le score
 * @param {number} score - Score de détection
 * @returns {string} 'confirmed' | 'likely' | 'suspicious' | 'clean'
 */
export function getThreatLevel(score) {
    const { CONFIRMED_BOT, LIKELY_BOT, SUSPICIOUS } = BOT_DETECTION_RULES.thresholds;
    
    if (score >= CONFIRMED_BOT) return 'confirmed';
    if (score >= LIKELY_BOT) return 'likely';
    if (score >= SUSPICIOUS) return 'suspicious';
    return 'clean';
}
