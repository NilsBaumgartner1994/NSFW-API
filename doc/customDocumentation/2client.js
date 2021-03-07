'use strict';
/**
 * @apiDefine 2Client 2. Clients
 * To communicate with the API clients are needed. All clients just need the HTTP Methods and a network connection to the API. In the following we will focus on Javascript clients. We assume that the API is reachable at the URL: "http://localhost:3001/api/", in some real cases you need to specify a port.
 */

/**
 * @api {INTRODUCTION} NSFW-Web 2.1 NSFW-Web
 * @apiGroup 2Client
 * @apiDescription The lazy and easy way to access this API, or dont even access the api. Our web-framework handles most of things for you out of the box. NSFW-Web: https://www.npmjs.com/package/nsfw-web for more informations.
 * @apiParamExample {js} NSFW-Web Example
 import "regenerator-runtime/runtime.js";
 import ServerWeb from "./ServerWeb";
 import {WebStorage, MyStorage} from "nsfw-connector";
 import ReactDOM from 'react-dom';

 const regeneratorRuntime = require("regenerator-runtime");

 const config = {
    "title": "NSFW-Dev",
    "titleLong": "NSFW-Dev",
    "githubLink": "https://www.npmjs.com/package/nsfw-web",
    "version": "1.0.0",
 }

 MyStorage.setStorageImplementation(WebStorage); //We want to store things in the browser
 ServerWeb.getNSFWConnectorMyStorage().setStorageImplementation(WebStorage); //Sync the storage
 ServerWeb.setConfig(config);
 ServerWeb.start(ReactDOM);
 */

/**
 * @api {INTRODUCTION} NSFW-Connector 2.2 NSFW-Connector
 * @apiGroup 2Client
 * @apiDescription If you want to access the api on a smartphone, tablet or what ever supports JavaScript (and npm). NSFW-Connector: https://www.npmjs.com/package/nsfw-connector for more informations. With this package you can skip a lot of chapters here.
 * @apiParamExample {js} NSFW-Connector Example
 import {RequestHelper, NSFWResource, NSFWConnector, APIRequest, AuthConnector} from "nsfw-connector";
 NSFWConnector.reset();
 authObject = {
     "authMethod" : "configList",
     "username" : "admin",
     "password": "SuperSecretPassword",
 };

 await AuthConnector.authorize(authObject,true);
 let meal = new NSFWResource("Meals");
 await meal.loadByResource({id: 1});
 meal.name = "New name";
 await meal.save();
 await meal.destroy();
 */

/**
 * @api {INTRODUCTION} JavaScript-API-Call 2.3 JavaScript Requests
 * @apiGroup 2Client
 * @apiDescription If you want to make your life hard, then use this way, instead of the NSFW-Connector. In this example there is a Sequelize Resource named "Meals" with a name and an id.
 * @apiParamExample {js} GET Meal
 //Get an existing meal

 let accessToken = "XXX"; // if authorization is disabled, leave it blank
 let headers = new Headers({
     Authorization: "AccessToken " + accessToken,
     "Content-Type": "application/json",
 });

 let resource_url = "http://localhost:3001/api/"+"models/Meals/1";
 response = await fetch(resource_url, {
     method: "GET",
     credentials: 'include',
     headers: headers,
 });
 let answer = await response.json();
 * @apiParamExample {js} POST Meal
 //Create a new meal

 let accessToken = "XXX"; // if authorization is disabled, leave it blank
 let headers = new Headers({
     Authorization: "AccessToken " + accessToken,
     "Content-Type": "application/json",
 });

 let payloadRaw = {
    id: 1,
    name: "New created meal"
 };

 let resource_url = "http://localhost:3001/api/"+"models/Meals/";
 response = await fetch(resource_url, {
     method: "POST",
     credentials: 'include',
     headers: headers,
     body: payloadRaw,
 });
 let answer = await response.json();

 * @apiParamExample {js} PUT Meal
 //Update an existing meal

 let accessToken = "XXX"; // if authorization is disabled, leave it blank
 let headers = new Headers({
     Authorization: "AccessToken " + accessToken,
     "Content-Type": "application/json",
 });

 let payloadRaw = {
    name: "Renamed meal"
 };

 let resource_url = "http://localhost:3001/api/"+"models/Meals/1";
 response = await fetch(resource_url, {
     method: "PUT",
     credentials: 'include',
     headers: headers,
     body: payloadRaw,
 });
 let answer = await response.json();

 * @apiParamExample {js} DELETE Meal
 //Delete an existing meal

 let accessToken = "XXX"; // if authorization is disabled, leave it blank
 let headers = new Headers({
     Authorization: "AccessToken " + accessToken,
     "Content-Type": "application/json",
 });

 let resource_url = "http://localhost:3001/api/"+"models/Meals/1";
 response = await fetch(resource_url, {
     method: "DELETE",
     credentials: 'include',
     headers: headers,
     body: {},
 });
 let answer = await response.json();
 */