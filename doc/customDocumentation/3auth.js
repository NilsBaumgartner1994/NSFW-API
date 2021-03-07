"use strict";
/**
 * @apiDefine 3Auth 3. Authentication
 * In fact we have some sensible areas in our application which should not be public to everyone. Therefore a authentication is needed. We will differentiate between a direct admin, and a token authentication.
 */

/**
 * @api {INTRODUCTION} AuthenticationSetup 3.1 Setup
 * @apiGroup 3Auth
 * @apiDescription Here comes how to setup the server
 * @apiParamExample {js} Config List
 import {ServerAPI, AuthConfigList} from "nsfw-api";

 let serverConfig = {
    "port": 3001,
    ...
    "auth": {
      "disabled": false,
      "methods": {
        "configList": true,
      }
    }
  }

 AuthConfigList.setAdminsFile({
     admin: "SuperSecretPassword",
     alsoAdminUserName: "AnotherPassword",
 });

 //for configOfModels and pathToModels see later documentation
 let server = new ServerAPI(serverConfig, configOfModels, pathToModels, "auto");
 server.start();

 * @apiParamExample {js} Custom Authenticator
 import {ServerAPI, AuthConnector} from "nsfw-api";

 AuthConnector.registerAuthMethod(YourCustomAuthenticator);

 //for configOfModels and pathToModels see later documentation
 let server = new ServerAPI(serverConfig, configOfModels, pathToModels, "auto");
 server.start();


 class MyCustomAuth {

    static AUTH_METHOD = "customAuth";  //Required name for auth interface
    static AUTH_NAME = "My Custom Auth"; //Required displayname for auth interface

    static PARAM_USERNAME = "username";
    static PARAM_PASSWORD = "password";

    static getNeededAuthParams(){
        return {
            name : MyCustomAuth.AUTH_NAME,
            params: {
                [MyCustomAuth.PARAM_USERNAME] : "username",
                [MyCustomAuth.PARAM_PASSWORD]: "password",
            }
        }
    }

    static async authorize(authObject) {
        //authObject contains all values for defined params

        let isAuthorized = ...
        if(!isAuthorized){
            return AuthConnector.getError(AuthConnector.ERROR_CREDENTIALS_INCORRECT);
        } else {
            return AuthConnector.getSuccessMessage(AuthConfigList.AUTH_METHOD, MyAccessControl.roleNameAdmin, username, username,null);
        }
    }


}
 */

/**
 * @api {INTRODUCTION} UserAuthentication 3.2 User
 * @apiGroup 3Auth
 * @apiDescription In order to authenticate as a user, we first need a user account. The registration as a user can be read here: [Create User](#api-User-CreateUser). After we got a valid user Id and the corresponding password, we can obtain an AccessToken.
 *
 * @apiParamExample {js} User authentication example:
 var password = "password"; // user password
 var user_id = 123; // user id
 var apiURL = "https://localhost/api";
 async function getAccessToken(){ // function to obtain an AccessToken
  let headers = new Headers({
    'Content-Type': 'application/json',
  });
  let url = apiURL+"/users/"+user_id+"/newToken";
  // create auth payload
  let payloadJSON = {
    plaintextSecret: password,
    user_id: user_id
  }
  // request to server
  let response = await fetch(url, {
    method: 'POST',
    Accept: 'application/json',
    headers: headers,
    body: JSON.stringify(payloadJSON) //with credentials
  });
  let responseJson = await response.json();
  return responseJson.accessToken; //return token
}
 async function getUserProfile(){ // function to a user profile
  let accessToken = await getAccessToken(); //obtain AccessToken
  // create headers
 let headers = new Headers({
            Authorization: "MyAccessToken " + accessToken, //with AccessToken
            "Content-Type": "application/json",
        });
 let url = apiURL+"/user/123/"; //private profile url
 //request to server
 fetch(url, {
    method: 'GET',
    headers: headers,
})
 .then((response) => response.json())
 .then((responseJson) => { // response of private profile
    console.log(responseJson);
});
}
 */

/**
 * @api {INTRODUCTION} UserAdminRights 3.3 User/Admin Rights
 * @apiGroup 3Auth
 * @apiDescription In Order to get information which resources and attributes a specific role can access, take a look at [Permission](#api-Permission)'s
 */