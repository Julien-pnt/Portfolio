/*
==========================================================================
CRYPTO SERVICE - PORTFOLIO JULIEN PINOT
Service de cryptographie moderne utilisant Web Crypto API
Conforme NIST SP 800-175B - AES-GCM 256-bit & SHA-256
==========================================================================
*/

/**
 * Service de cryptographie utilisant l'API Web Crypto (crypto.subtle)
 * @class CryptoService
 */
export class CryptoService {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12; // 96 bits recommandé pour AES-GCM
    }

    /**
     * Hash des données avec SHA-256
     * @param {string} data - Données à hasher
     * @returns {Promise<string>} Hash hexadécimal
     */
    async hashData(data) {
        if (!data) {
            throw new Error('CryptoService: Les données à hasher ne peuvent pas être vides');
        }

        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            
            // Conversion en hexadécimal
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        } catch (error) {
            console.error('CryptoService: Erreur lors du hashing:', error);
            throw new Error('Échec du hashing des données');
        }
    }

    /**
     * Génère une clé de chiffrement AES-GCM 256-bit
     * @returns {Promise<CryptoKey>} Clé de chiffrement
     */
    async generateEncryptionKey() {
        try {
            return await crypto.subtle.generateKey(
                {
                    name: this.algorithm,
                    length: this.keyLength
                },
                true, // extractable
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('CryptoService: Erreur lors de la génération de clé:', error);
            throw new Error('Échec de la génération de clé');
        }
    }

    /**
     * Génère un vecteur d'initialisation (IV) aléatoire
     * @returns {Uint8Array} IV de 96 bits
     */
    generateIV() {
        return crypto.getRandomValues(new Uint8Array(this.ivLength));
    }

    /**
     * Chiffre des données avec AES-GCM
     * @param {string} data - Données à chiffrer
     * @param {CryptoKey} key - Clé de chiffrement
     * @returns {Promise<{encrypted: string, iv: string}>} Données chiffrées et IV
     */
    async encryptData(data, key) {
        if (!data) {
            throw new Error('CryptoService: Les données à chiffrer ne peuvent pas être vides');
        }
        if (!key) {
            throw new Error('CryptoService: La clé de chiffrement est requise');
        }

        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const iv = this.generateIV();

            const encryptedBuffer = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                dataBuffer
            );

            // Conversion en hexadécimal
            const encryptedHex = Array.from(new Uint8Array(encryptedBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            const ivHex = Array.from(iv)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            return {
                encrypted: encryptedHex,
                iv: ivHex
            };
        } catch (error) {
            console.error('CryptoService: Erreur lors du chiffrement:', error);
            throw new Error('Échec du chiffrement des données');
        }
    }

    /**
     * Déchiffre des données avec AES-GCM
     * @param {string} encryptedHex - Données chiffrées en hexadécimal
     * @param {CryptoKey} key - Clé de déchiffrement
     * @param {string} ivHex - IV en hexadécimal
     * @returns {Promise<string>} Données déchiffrées
     */
    async decryptData(encryptedHex, key, ivHex) {
        if (!encryptedHex || !key || !ivHex) {
            throw new Error('CryptoService: Données de déchiffrement incomplètes');
        }

        try {
            // Conversion depuis hexadécimal
            const encryptedBuffer = new Uint8Array(
                encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
            );
            
            const iv = new Uint8Array(
                ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
            );

            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                encryptedBuffer
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('CryptoService: Erreur lors du déchiffrement:', error);
            throw new Error('Échec du déchiffrement des données');
        }
    }

    /**
     * Génère un token aléatoire sécurisé
     * @param {number} length - Longueur du token (défaut: 32)
     * @returns {string} Token hexadécimal
     */
    generateSecureToken(length = 32) {
        const buffer = crypto.getRandomValues(new Uint8Array(length));
        return Array.from(buffer)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Hash de mot de passe avec sel (PBKDF2)
     * @param {string} password - Mot de passe
     * @param {string} salt - Sel (optionnel, sera généré si absent)
     * @param {number} iterations - Nombre d'itérations (défaut: 100000)
     * @returns {Promise<{hash: string, salt: string}>} Hash et sel
     */
    async hashPassword(password, salt = null, iterations = 100000) {
        if (!password) {
            throw new Error('CryptoService: Le mot de passe ne peut pas être vide');
        }

        try {
            // Génération du sel si non fourni
            const saltBuffer = salt 
                ? new Uint8Array(salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
                : crypto.getRandomValues(new Uint8Array(16));

            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);

            // Import de la clé
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveBits']
            );

            // Dérivation PBKDF2
            const derivedBits = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: iterations,
                    hash: 'SHA-256'
                },
                keyMaterial,
                256 // 256 bits
            );

            const hashHex = Array.from(new Uint8Array(derivedBits))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            const saltHex = Array.from(saltBuffer)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            return {
                hash: hashHex,
                salt: saltHex
            };
        } catch (error) {
            console.error('CryptoService: Erreur lors du hashage du mot de passe:', error);
            throw new Error('Échec du hashage du mot de passe');
        }
    }

    /**
     * Vérifie un mot de passe contre son hash
     * @param {string} password - Mot de passe à vérifier
     * @param {string} storedHash - Hash stocké
     * @param {string} salt - Sel utilisé
     * @param {number} iterations - Nombre d'itérations utilisées
     * @returns {Promise<boolean>} true si le mot de passe correspond
     */
    async verifyPassword(password, storedHash, salt, iterations = 100000) {
        try {
            const { hash } = await this.hashPassword(password, salt, iterations);
            return hash === storedHash;
        } catch (error) {
            console.error('CryptoService: Erreur lors de la vérification du mot de passe:', error);
            return false;
        }
    }
}

// Export de l'instance singleton
export const cryptoService = new CryptoService();

// Export par défaut
export default CryptoService;
