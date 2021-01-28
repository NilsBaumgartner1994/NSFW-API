/**
 * The My Express Router which is the core functionality. It setups all controllers and handles routes
 */
import AuthDatabase from "./AuthDatabase";
import AuthConfigList from "./AuthConfigList";

export default class AuthConnector {

    static AUTH_METHOD = "authMethod";

    static ERROR_MISSING_AUTH_NOT_GIVEN = "No Auth Object given";
    static ERROR_AUTH_IN_WRONG_FORMAT = "Auth Object in wrong format";
    static ERROR_MISSING_AUTHINTERFACE_NOT_FOUND = "Auth method not supported";
    static ERROR_CREDENTIALS_INCORRECT = "Credentials incorrect";

    static AUTH_INTERFACES = {

    };

    constructor(authConfig) {
        this.config = authConfig;
        this.configureAuthMethods();
    }

    configureAuthMethods(){
        let configAuthMethods = this.config.methods;
        if(!!configAuthMethods.configList){
            AuthConnector.registerAuthMethod(AuthConfigList);
        }
        if(!!configAuthMethods.database){
            AuthConnector.registerAuthMethod(AuthDatabase);
        }
    }

    /**
     * If we want to add more methods on the fly
     * @param authClass
     * @returns {boolean}
     */
    static registerAuthMethod(authClass){
        if(!!authClass){
            let authMethod = authClass.AUTH_METHOD;
            if(!!authMethod){
                if(!AuthConnector.AUTH_INTERFACES.hasOwnProperty(authMethod)){
                    if(
                        typeof authClass.getNeededAuthParams === "function" &&
                        typeof authClass.authorize === "function"
                    ) {
                        AuthConnector.AUTH_INTERFACES[authMethod] = authClass;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     {
        authMethod: ""
        displayName:
     }
     */

    static getAuthMethods(){
        let keys = Object.keys(AuthConnector.AUTH_INTERFACES);
        let possibleAuthMethods = {};
        for(let i=0; i<keys.length; i++){
            let key = keys[i];
            let connector = AuthConnector.AUTH_INTERFACES[key];
            possibleAuthMethods[key] = connector.getNeededAuthParams();
        }
        return possibleAuthMethods;
    }

    static allNeededParamsGiven(authObject, connector){
        let neededParams = connector.getNeededAuthParams();
        let neededKeys = Object.keys(neededParams.params);
        for(let i=0; i<neededKeys.length; i++){
            let key = neededKeys[i];
            if(!authObject.hasOwnProperty(key)) {
                return false;
            }
        }
        console.log("yes all keys given");
        return true;
    }

    /**
     *
     * @param authObject =
     * {
     *
     * }
     */
    static async authorize(authObject){
        if(!!authObject){
            let authMethod = authObject[AuthConnector.AUTH_METHOD];
            if(!!authMethod){
                let connectors = AuthConnector.AUTH_INTERFACES;
                let connector = connectors[authMethod];
                if(!!connector){
                    if(AuthConnector.allNeededParamsGiven(authObject,connector)){
                        let answer = await connector.authorize(authObject);
                        return answer;
                    }
                } else {
                    return AuthConnector.getError(AuthConnector.ERROR_MISSING_AUTHINTERFACE_NOT_FOUND);
                }
            }
            return AuthConnector.getError(AuthConnector.ERROR_AUTH_IN_WRONG_FORMAT);
        }
        return AuthConnector.getError(AuthConnector.ERROR_MISSING_AUTH_NOT_GIVEN);
    }

    static getSuccessMessage(authMedhod, myAccessControlRole, username, displayName, additionalInformation){
        return {
            success: true,
            auth: {
                [AuthConnector.AUTH_METHOD] : authMedhod,
                role: myAccessControlRole,
                username: username,
                displayName: displayName,
                additionalInformation: additionalInformation
            }
        }
    }

    static getError(errorType){
        return {
            error: errorType
        }
    }

}
