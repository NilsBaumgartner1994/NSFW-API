import AuthConnector from "./AuthConnector";
import MyAccessControl from "./../module/MyAccessControl";

const LdapAuth = require('ldapauth-fork');
const { authenticate } = require('ldap-authentication')

/**
 * The My Express Router which is the core functionality. It setups all controllers and handles routes
 */
export default class AuthLDAP {

    static AUTH_METHOD = "ldap";

    static AUTH_NAME = "LDAP";
    static PARAM_USERNAME = "username";
    static PARAM_PASSWORD = "password";

    static getNeededAuthParams(){
        return {
            name: AuthLDAP.AUTH_NAME,
            params: {
                [AuthLDAP.PARAM_USERNAME] : "xmuster",
                [AuthLDAP.PARAM_PASSWORD]: "password",
            }
        }
    }

    static getOptionsUniOsnabrueck(username, password){
        return {
            url: 'ldaps://ldap.uni-osnabrueck.de:636',
            bindDN: 'uid='+username+',ou=people,dc=uni-osnabrueck,dc=de',
            bindCredentials: password,
            searchBase: 'ou=people,dc=uni-osnabrueck,dc=de',
            searchFilter: '(uid={{username}})',
            reconnect: true
        };
    }

    /**
     *
     * @param authObject will have allNeededAuthParams
     * @returns {Promise<unknown>}
     */
    static async authorize(authObject){
        console.log("AuthLDAP authorize");
        let username = authObject[AuthLDAP.PARAM_USERNAME];
        let password = authObject[AuthLDAP.PARAM_PASSWORD];

        let ldap = new LdapAuth(
            AuthLDAP.getOptionsUniOsnabrueck(username,password)
        );

/**
        let options = {
            ldapOpts: {
                url: 'ldap://ldap.uni-osnabrueck.de:389',
                tlsOptions: { rejectUnauthorized: false }
            },
            userDn: 'uid='+username+',ou=people,dc=uni-osnabrueck,dc=de',
            userPassword: password,
            userSearchBase: 'ou=people,dc=uni-osnabrueck,dc=de',
            usernameAttribute: 'uid',
            username: username
            // starttls: false
        }

        let user = await authenticate(options)
        console.log(user);
*/


        const promise = new Promise( (res,rej) => {
            console.log("Start authenticate at myUOS");
            console.log("authenticate: "+username+" with: "+password);
            ldap.authenticate(username, password, function(err, user) {
                console.log(err);
                console.log(user);
                if(err){
                    rej(err);
                } else {
                    res(user);
                }
            });
        });

        console.log("Promise created");
        try{
            let user = await promise;
            console.log("waiting");
            console.log(user);
            return AuthConnector.getSuccessMessage(AuthLDAP.AUTH_METHOD, MyAccessControl.roleNameAdmin, username, null);
        } catch (err) {
            console.log(err);
            return AuthConnector.getError(AuthConnector.ERROR_CREDENTIALS_INCORRECT);
        }
        return AuthConnector.getError(AuthConnector.ERROR_CREDENTIALS_INCORRECT);
    }
}
