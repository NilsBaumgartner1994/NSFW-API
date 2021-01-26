'use strict';
/**
 * @apiDefine 2Client 2. Clients
 * To communicate with the API clients are needed. All clients just need the HTTP Methods and a network connection to the API. In the following we will focus on Javascript clients. We assume that the API is reachable at the URL: "https://localhost", in some real cases you need to specify a port.
 */

/**
 * @api {INTRODUCTION} JavascriptGet 2.1 GET Request
 * @apiGroup 2Client
 * @apiDescription In this example our client want to receive a meal from the API. Therefore we assume we got authentication headers, which will be explained in the next section.
 * @apiParamExample {js} Request-Example:
 var server = "https://localhost/api/";
 var mealID = 123;
 var resource_url = "meals/"+mealID+"/";
 async function getMeal(){
    // define the content type of our sending information
    let headers = new Headers({
        'Content-Type': 'application/json'
    });
    // create request to the server
    let response = await fetch(server+resource_url, {
        method: "GET",
        credentials: 'include',
        headers: headers,
    });
    // return our response
    return response.json();
 }
 */

/**
 * @api {INTRODUCTION} JavascriptPost 2.2 POST Request
 * @apiGroup 2Client
 * @apiDescription In this example our client want to update a meal with a new name. Beseide POST Request there are also DELETE and PUT requests. In our API instead of PUT request, we use POST requests.
 * @apiParamExample {js} Request-Example:
 var payload_json = {name: "new name"};
 var payload = JSON.stringify(payload_json);
 var server = "https://localhost/api/";
 var mealID = 123;
 var resource_url = "meals/"+mealID+"/";
 async function updateMeal(){
     // create request to the server
     let response = await fetch(server+resource_url, {
            method: "POST",
            credentials: 'include',
            headers: headers,
            body: payload,
     });
     // return our response
     return response.json();
  }
 */