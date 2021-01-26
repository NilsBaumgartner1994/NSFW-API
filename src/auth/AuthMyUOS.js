import AuthConnector from "./AuthConnector";
import MyAccessControl from "../module/MyAccessControl";

const gegAuthAdapter = require("geg-auth-adapter");



/**
 * The My Express Router which is the core functionality. It setups all controllers and handles routes
 */
export default class AuthMyUOS {

    static AUTH_METHOD = "myUOS";

    static AUTH_NAME = "MyUOS";
    static PARAM_USERNAME = "username";
    static PARAM_PASSWORD = "password";

    static PERM_DOZENT = "dozent";
    static PERM_TUTOR = "tutor";
    static PERM_STUDENT = "student";

    static getNeededAuthParams(){
        return {
            name: AuthMyUOS.AUTH_NAME,
            params: {
                [AuthMyUOS.PARAM_USERNAME] : "xmuster",
                [AuthMyUOS.PARAM_PASSWORD]: "password",
            }
        }
    }

    static getRoleMapping(){
        let roleMapping = {
            [AuthMyUOS.PERM_DOZENT] : MyAccessControl.roleNameAdmin,
            [AuthMyUOS.PERM_TUTOR] : MyAccessControl.roleNameModerator,
            [AuthMyUOS.PERM_STUDENT] : MyAccessControl.roleNameUser,
        }
        return roleMapping;
    }

    /**
     *
     * @param authObject will have allNeededAuthParams
     * @returns {Promise<unknown>}
     */
    static async authorize(authObject){
        console.log("AuthLDAP authorize");
        let username = authObject[AuthMyUOS.PARAM_USERNAME];
        let password = authObject[AuthMyUOS.PARAM_PASSWORD];

        try {
            let user = await gegAuthAdapter.authorize(username,password)
            let name = user.name;
            let displayName = name.given; //firstname or name.formated for fullname including title
            let perms = user.perms;

            let role = AuthMyUOS.getRoleMapping()[perms] || MyAccessControl.roleNameGuest;

            let additionalInformation = null; // additionalInformation = user; but was a bit overkill i think
            return AuthConnector.getSuccessMessage(AuthMyUOS.AUTH_METHOD, role, username, displayName, additionalInformation);
        } catch (error) {
            console.log(error);
            return AuthConnector.getError(AuthConnector.ERROR_CREDENTIALS_INCORRECT);
        }
    }
}
