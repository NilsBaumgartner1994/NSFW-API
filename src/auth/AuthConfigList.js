import AuthConnector from "./AuthConnector";
import MyAccessControl from "./../module/MyAccessControl";

const admins = require("./../../config/admins.json");
const basicAuth = require("express-basic-auth");

/**
 * The My Express Router which is the core functionality. It setups all controllers and handles routes
 */
export default class AuthConfigList {

    static AUTH_METHOD = "configList";

    static AUTH_NAME = "Config List";
    static PARAM_USERNAME = "username";
    static PARAM_PASSWORD = "password";

    static getNeededAuthParams(){
        return {
            name : AuthConfigList.AUTH_NAME,
            params: {
                [AuthConfigList.PARAM_USERNAME] : "xmuster",
                [AuthConfigList.PARAM_PASSWORD]: "password",
            }
        }
    }

    static async authorize(authObject) {
        let username = authObject[AuthConfigList.PARAM_USERNAME];
        let password = authObject[AuthConfigList.PARAM_PASSWORD];

        let foundPassword = admins[username] || password+"Not";
        let foundUsername = admins.hasOwnProperty(username) ? username : username+"Not";

        let passwordMatch = basicAuth.safeCompare(foundPassword,password);
        let usernameMatch = basicAuth.safeCompare(foundUsername,username);

        let isAuthorized = !!(passwordMatch & usernameMatch);

        if(!isAuthorized){
            return AuthConnector.getError(AuthConnector.ERROR_CREDENTIALS_INCORRECT);
        } else {
            return AuthConnector.getSuccessMessage(AuthConfigList.AUTH_METHOD, MyAccessControl.roleNameAdmin, username, username,null);
        }
    }


}
