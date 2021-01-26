"use strict";
/**
 * @apiDefine 3Auth 3. Authentication
 * In fact we have some sensible areas in our application which should not be public to everyone. Therefore a authentication is needed. We will differentiate between a direct admin, and a token authentication.
 */

/**
 * @api {INTRODUCTION} AdminAuthentication 3.1 Admin
 * @apiGroup 3Auth
 * @apiDescription To get an admin role you need to run request on the same machine/IP. This can be achieved via an proxy server which has a basic authentication. In this repository there is a proxy server already installed, which only needs to be started.
 * @apiParamExample {js} Admin authentication example:
 let username = "admin";
 let password = "password";
 let portProxy = 3002;
 let url = "https://localhost:"+portProxy+"/api/secretArea";
 let encoded = btoa(username+":"+password); //encoded username and password
 //header creation with username and password
 let headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + encoded
 });
 fetch(url, {
    method: 'GET',
    Accept: 'application/json',
    headers: headers, //adding headers
 })
 .then((response) => response.json())
 .then((responseJson) => {
    console.log(responseJson); //receiving response
 });
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