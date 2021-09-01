import AuthConnector from "./AuthConnector";
import MyAccessControl from "./../module/MyAccessControl";

const basicAuth = require("express-basic-auth");

/**
 * Implementation of an Auth Interface by a config list
 */
export default class AuthConfigList {

    static AUTH_METHOD = "configList";  //Required name for auth interface
    static AUTH_NAME = "Config List"; //Required Displayname for auth interface

    static PARAM_USERNAME = "username";
    static PARAM_PASSWORD = "password";

    static ADMINS = {};

    static setAdminsFile(admins){
        AuthConfigList.ADMINS = admins;
    }

    static getNeededAuthParams(){
        return {
            name : AuthConfigList.AUTH_NAME,
            params: {
                [AuthConfigList.PARAM_USERNAME] : "xmuster",
                [AuthConfigList.PARAM_PASSWORD]: "password",
            }
        }
    }

    static async authorize(authObject, models) {
        console.log("authorize");
        let username = authObject[AuthConfigList.PARAM_USERNAME];
        let password = authObject[AuthConfigList.PARAM_PASSWORD];

        console.log("Given username: "+username)
        console.log("Given password: "+password)

        console.log(AuthConfigList.ADMINS);

        let foundPassword = AuthConfigList.ADMINS[username] || password+"Not";
        let foundUsername = AuthConfigList.ADMINS.hasOwnProperty(username) ? username : username+"Not";


        console.log("foundPassword: "+foundPassword)

        let passwordMatch = basicAuth.safeCompare(foundPassword,password);
        let usernameMatch = basicAuth.safeCompare(foundUsername,username);

        let isAuthorized = !!(passwordMatch & usernameMatch);

        if(!isAuthorized){
            return AuthConnector.getError(AuthConnector.ERROR_CREDENTIALS_INCORRECT);
        } else {
            return AuthConnector.getSuccessMessage(AuthConfigList.AUTH_METHOD, MyAccessControl.roleNameAdmin, null, username, username,null);
        }
    }


}
