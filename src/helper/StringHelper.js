const bcrypt = require('bcrypt');

const saltRounds = 10;

/**
 * Cryptographie helper Class
 * This class makes safe compares, generates salts and hashes passwords
 */
export default class StringHelper {

    // Web Browsers support replaceAll on strings but node not...
    // https://discourse.threejs.org/t/replaceall-is-not-a-function/14585
    static replaceAll(string, searchString, replaceString){
        return string.replace(new RegExp(searchString, 'g'), replaceString);
    }

}
