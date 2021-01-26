const bcrypt = require('bcrypt');

const saltRounds = 10;

/**
 * Cryptographie helper Class
 * This class makes safe compares, generates salts and hashes passwords
 */
export default class CryptoHelper {


    /**
     * Generate a salt, depending on preconfigured salt Rounds
     * @returns {string} a salt
     */
    static genSalt() {
        let salt = bcrypt.genSaltSync(saltRounds);
        return salt;
    }

    /**
     * Hashes a Plaintext Secret with a salt into a hashed Secret Key
     * @param plaintextSecret The Plaintext Secret
     * @param salt The salt
     * @returns {string} The hashed Secret
     */
    static hashSecret(plaintextSecret, salt) {
        let hashedSecretKey = bcrypt.hashSync(plaintextSecret, salt);
        return hashedSecretKey;
    }

    /**
     * Makes a compare of the plaintextSecret and the hashed Secret
     * @param plaintextSecret The Plaintext Secret
     * @param hashedSecretKey The hashed Secret
     * @returns {boolean} does the plaintext secret matches with the hash
     */
    static compare(plaintextSecret, hashedSecretKey) {
        let match = bcrypt.compareSync(plaintextSecret, hashedSecretKey);
        return match;
    }

}
