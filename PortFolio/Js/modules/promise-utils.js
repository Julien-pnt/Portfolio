/*
==========================================================================
PROMISE UTILS - PORTFOLIO JULIEN PINOT
Utilitaires pour remplacer les setTimeout imbriqués par async/await
==========================================================================
*/

/**
 * Utilitaires de promesses pour gérer les délais et animations
 * @class PromiseUtils
 */
export class PromiseUtils {
    /**
     * Crée une promesse qui se résout après un délai spécifié
     * @param {number} ms - Délai en millisecondes
     * @returns {Promise<void>}
     */
    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Alias de wait pour plus de lisibilité
     * @param {number} ms - Délai en millisecondes
     * @returns {Promise<void>}
     */
    static delay(ms) {
        return this.wait(ms);
    }

    /**
     * Exécute une fonction avec un délai
     * @param {Function} fn - Fonction à exécuter
     * @param {number} ms - Délai en millisecondes
     * @returns {Promise<any>}
     */
    static async delayedExecution(fn, ms) {
        await this.wait(ms);
        return fn();
    }

    /**
     * Exécute plusieurs fonctions en séquence avec délais
     * @param {Array<{fn: Function, delay: number}>} tasks - Tâches à exécuter
     * @returns {Promise<Array<any>>}
     */
    static async sequence(tasks) {
        const results = [];
        
        for (const task of tasks) {
            if (task.delay) {
                await this.wait(task.delay);
            }
            const result = await task.fn();
            results.push(result);
        }
        
        return results;
    }

    /**
     * Exécute une animation en cascade sur des éléments
     * @param {NodeList|Array} elements - Éléments à animer
     * @param {Function} animationFn - Fonction d'animation
     * @param {number} cascadeDelay - Délai entre chaque élément
     * @returns {Promise<void>}
     */
    static async cascadeAnimation(elements, animationFn, cascadeDelay = 100) {
        const elementsArray = Array.from(elements);
        
        for (let i = 0; i < elementsArray.length; i++) {
            await this.wait(i * cascadeDelay);
            animationFn(elementsArray[i], i);
        }
    }

    /**
     * Crée un timeout avec promesse
     * @param {Promise} promise - Promesse à exécuter
     * @param {number} timeoutMs - Timeout en millisecondes
     * @param {string} timeoutMessage - Message d'erreur si timeout
     * @returns {Promise<any>}
     */
    static timeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
        return Promise.race([
            promise,
            this.wait(timeoutMs).then(() => {
                throw new Error(timeoutMessage);
            })
        ]);
    }

    /**
     * Retry une opération avec délai exponentiel
     * @param {Function} fn - Fonction à exécuter
     * @param {number} maxRetries - Nombre maximum de tentatives
     * @param {number} baseDelay - Délai de base en millisecondes
     * @returns {Promise<any>}
     */
    static async retry(fn, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                // Guard Clause - dernière tentative
                if (attempt === maxRetries - 1) {
                    break;
                }
                
                // Délai exponentiel
                const delay = baseDelay * Math.pow(2, attempt);
                await this.wait(delay);
            }
        }
        
        throw lastError;
    }

    /**
     * Debounce une fonction asynchrone
     * @param {Function} fn - Fonction à debouncer
     * @param {number} delay - Délai en millisecondes
     * @returns {Function}
     */
    static debounce(fn, delay = 300) {
        let timeoutId = null;
        
        return async function(...args) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            return new Promise((resolve) => {
                timeoutId = setTimeout(async () => {
                    const result = await fn.apply(this, args);
                    resolve(result);
                }, delay);
            });
        };
    }

    /**
     * Throttle une fonction asynchrone
     * @param {Function} fn - Fonction à throttler
     * @param {number} limit - Limite en millisecondes
     * @returns {Function}
     */
    static throttle(fn, limit = 300) {
        let inThrottle = false;
        
        return async function(...args) {
            if (!inThrottle) {
                inThrottle = true;
                const result = await fn.apply(this, args);
                
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
                
                return result;
            }
        };
    }

    /**
     * Exécute une fonction à intervalles réguliers jusqu'à condition
     * @param {Function} fn - Fonction à exécuter
     * @param {Function} condition - Condition d'arrêt
     * @param {number} interval - Intervalle en millisecondes
     * @param {number} maxIterations - Nombre max d'itérations
     * @returns {Promise<any>}
     */
    static async poll(fn, condition, interval = 1000, maxIterations = 10) {
        let iterations = 0;
        
        while (iterations < maxIterations) {
            const result = await fn();
            
            if (condition(result)) {
                return result;
            }
            
            await this.wait(interval);
            iterations++;
        }
        
        throw new Error('Polling max iterations reached');
    }

    /**
     * Crée une animation fluide (requestAnimationFrame basé sur Promise)
     * @param {Function} updateFn - Fonction de mise à jour
     * @param {number} duration - Durée en millisecondes
     * @returns {Promise<void>}
     */
    static animate(updateFn, duration) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            
            const frame = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                updateFn(progress);
                
                if (progress < 1) {
                    requestAnimationFrame(frame);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(frame);
        });
    }

    /**
     * Ease-in-out pour les animations
     * @param {number} t - Progression (0 à 1)
     * @returns {number}
     */
    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * Ease-out pour les animations
     * @param {number} t - Progression (0 à 1)
     * @returns {number}
     */
    static easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Ease-in pour les animations
     * @param {number} t - Progression (0 à 1)
     * @returns {number}
     */
    static easeIn(t) {
        return t * t * t;
    }
}

// Exports nommés pour utilisation directe
export const { wait, delay, sequence, cascadeAnimation, timeout, retry, debounce, throttle, poll, animate } = PromiseUtils;

// Export par défaut
export default PromiseUtils;
