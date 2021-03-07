define({ "api": [
  {
    "type": "INTRODUCTION",
    "url": "Function/Overview",
    "title": "1.2 Function overview",
    "group": "1Overview",
    "description": "<p>This API can handle a lot of functionalism's. Here comes a short collection of the most important functions.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "Server-Information",
            "description": "<p>Show vital information of the server, version number</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "User-Management",
            "description": "<p>Create, read, update and delete users. Manage friendships and meetings. Notify users via push notifications</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "Meal-Management",
            "description": "<p>Manage, like, comment and rate meals. Up- and download images of meals.</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "Building-Management",
            "description": "<p>Manage buildings. Up- and download images of buildings</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "Washing-Machine-Overview",
            "description": "<p>View the state of washing machines</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "Feedback-Management",
            "description": "<p>Manage Feedback from users</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "doc/customDocumentation/1overview.js",
    "groupTitle": "1. Overview",
    "groupDescription": "<p>Welcome to the API Documentation of NSFW-API. There are a lot of informations in here. I recommend you to read at least the small 4 Chapters 1-4 and then you should be good enough prepared to handle this API. This Document can be found in /doc/customDocumentation/1overview.js. ! If you make any changes in the documentation please run the command &quot;npm run doc&quot; to generate this document.</p>",
    "name": "IntroductionFunctionOverview"
  },
  {
    "type": "INTRODUCTION",
    "url": "REST/API",
    "title": "1.1 REST API Choice",
    "group": "1Overview",
    "description": "<p>A lot of systems communicate with them self. To support this communication a REST API is a good possibility. A REST API can combine multiple interface and task, so that a shared access from anywhere in a network is possible. Every device which supports a network communication can use the REST API. Further functions can be implemented with low effort.</p>",
    "version": "0.0.0",
    "filename": "doc/customDocumentation/1overview.js",
    "groupTitle": "1. Overview",
    "groupDescription": "<p>Welcome to the API Documentation of NSFW-API. There are a lot of informations in here. I recommend you to read at least the small 4 Chapters 1-4 and then you should be good enough prepared to handle this API. This Document can be found in /doc/customDocumentation/1overview.js. ! If you make any changes in the documentation please run the command &quot;npm run doc&quot; to generate this document.</p>",
    "name": "IntroductionRestApi"
  },
  {
    "type": "INTRODUCTION",
    "url": "JavaScript-API-Call",
    "title": "2.3 JavaScript Requests",
    "group": "2Client",
    "description": "<p>If you want to make your life hard, then use this way, instead of the NSFW-Connector. In this example there is a Sequelize Resource named &quot;Meals&quot; with a name and an id.</p>",
    "parameter": {
      "examples": [
        {
          "title": "GET Meal",
          "content": "//Get an existing meal\n\nlet accessToken = \"XXX\"; // if authorization is disabled, leave it blank\nlet headers = new Headers({\n    Authorization: \"AccessToken \" + accessToken,\n    \"Content-Type\": \"application/json\",\n});\n\nlet resource_url = \"http://localhost:3001/api/\"+\"models/Meals/1\";\nresponse = await fetch(resource_url, {\n    method: \"GET\",\n    credentials: 'include',\n    headers: headers,\n});\nlet answer = await response.json();",
          "type": "js"
        },
        {
          "title": "POST Meal",
          "content": "//Create a new meal\n\nlet accessToken = \"XXX\"; // if authorization is disabled, leave it blank\nlet headers = new Headers({\n    Authorization: \"AccessToken \" + accessToken,\n    \"Content-Type\": \"application/json\",\n});\n\nlet payloadRaw = {\n   id: 1,\n   name: \"New created meal\"\n};\n\nlet resource_url = \"http://localhost:3001/api/\"+\"models/Meals/\";\nresponse = await fetch(resource_url, {\n    method: \"POST\",\n    credentials: 'include',\n    headers: headers,\n    body: payloadRaw,\n});\nlet answer = await response.json();",
          "type": "js"
        },
        {
          "title": "PUT Meal",
          "content": "//Update an existing meal\n\nlet accessToken = \"XXX\"; // if authorization is disabled, leave it blank\nlet headers = new Headers({\n    Authorization: \"AccessToken \" + accessToken,\n    \"Content-Type\": \"application/json\",\n});\n\nlet payloadRaw = {\n   name: \"Renamed meal\"\n};\n\nlet resource_url = \"http://localhost:3001/api/\"+\"models/Meals/1\";\nresponse = await fetch(resource_url, {\n    method: \"PUT\",\n    credentials: 'include',\n    headers: headers,\n    body: payloadRaw,\n});\nlet answer = await response.json();",
          "type": "js"
        },
        {
          "title": "DELETE Meal",
          "content": "//Delete an existing meal\n\nlet accessToken = \"XXX\"; // if authorization is disabled, leave it blank\nlet headers = new Headers({\n    Authorization: \"AccessToken \" + accessToken,\n    \"Content-Type\": \"application/json\",\n});\n\nlet resource_url = \"http://localhost:3001/api/\"+\"models/Meals/1\";\nresponse = await fetch(resource_url, {\n    method: \"DELETE\",\n    credentials: 'include',\n    headers: headers,\n    body: {},\n});\nlet answer = await response.json();",
          "type": "js"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "doc/customDocumentation/2client.js",
    "groupTitle": "2. Clients",
    "groupDescription": "<p>To communicate with the API clients are needed. All clients just need the HTTP Methods and a network connection to the API. In the following we will focus on Javascript clients. We assume that the API is reachable at the URL: &quot;http://localhost:3001/api/&quot;, in some real cases you need to specify a port.</p>",
    "name": "IntroductionJavascriptApiCall"
  },
  {
    "type": "INTRODUCTION",
    "url": "NSFW-Connector",
    "title": "2.2 NSFW-Connector",
    "group": "2Client",
    "description": "<p>If you want to access the api on a smartphone, tablet or what ever supports JavaScript (and npm). NSFW-Connector: https://www.npmjs.com/package/nsfw-connector for more informations. With this package you can skip a lot of chapters here.</p>",
    "parameter": {
      "examples": [
        {
          "title": "NSFW-Connector Example",
          "content": "import {RequestHelper, NSFWResource, NSFWConnector, APIRequest, AuthConnector} from \"nsfw-connector\";\nNSFWConnector.reset();\nauthObject = {\n    \"authMethod\" : \"configList\",\n    \"username\" : \"admin\",\n    \"password\": \"SuperSecretPassword\",\n};\n\nawait AuthConnector.authorize(authObject,true);\nlet meal = new NSFWResource(\"Meals\");\nawait meal.loadByResource({id: 1});\nmeal.name = \"New name\";\nawait meal.save();\nawait meal.destroy();",
          "type": "js"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "doc/customDocumentation/2client.js",
    "groupTitle": "2. Clients",
    "groupDescription": "<p>To communicate with the API clients are needed. All clients just need the HTTP Methods and a network connection to the API. In the following we will focus on Javascript clients. We assume that the API is reachable at the URL: &quot;http://localhost:3001/api/&quot;, in some real cases you need to specify a port.</p>",
    "name": "IntroductionNsfwConnector"
  },
  {
    "type": "INTRODUCTION",
    "url": "NSFW-Web",
    "title": "2.1 NSFW-Web",
    "group": "2Client",
    "description": "<p>The lazy and easy way to access this API, or dont even access the api. Our web-framework handles most of things for you out of the box. NSFW-Web: https://www.npmjs.com/package/nsfw-web for more informations.</p>",
    "parameter": {
      "examples": [
        {
          "title": "NSFW-Web Example",
          "content": "import \"regenerator-runtime/runtime.js\";\nimport ServerWeb from \"./ServerWeb\";\nimport {WebStorage, MyStorage} from \"nsfw-connector\";\nimport ReactDOM from 'react-dom';\n\nconst regeneratorRuntime = require(\"regenerator-runtime\");\n\nconst config = {\n   \"title\": \"NSFW-Dev\",\n   \"titleLong\": \"NSFW-Dev\",\n   \"githubLink\": \"https://www.npmjs.com/package/nsfw-web\",\n   \"version\": \"1.0.0\",\n}\n\nMyStorage.setStorageImplementation(WebStorage); //We want to store things in the browser\nServerWeb.getNSFWConnectorMyStorage().setStorageImplementation(WebStorage); //Sync the storage\nServerWeb.setConfig(config);\nServerWeb.start(ReactDOM);",
          "type": "js"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "doc/customDocumentation/2client.js",
    "groupTitle": "2. Clients",
    "groupDescription": "<p>To communicate with the API clients are needed. All clients just need the HTTP Methods and a network connection to the API. In the following we will focus on Javascript clients. We assume that the API is reachable at the URL: &quot;http://localhost:3001/api/&quot;, in some real cases you need to specify a port.</p>",
    "name": "IntroductionNsfwWeb"
  },
  {
    "type": "INTRODUCTION",
    "url": "AuthenticationSetup",
    "title": "3.1 Setup",
    "group": "3Auth",
    "description": "<p>Here comes how to setup the server</p>",
    "parameter": {
      "examples": [
        {
          "title": "Config List",
          "content": "import {ServerAPI, AuthConfigList} from \"nsfw-api\";\n\nlet serverConfig = {\n   \"port\": 3001,\n   ...\n   \"auth\": {\n     \"disabled\": false,\n     \"methods\": {\n       \"configList\": true,\n     }\n   }\n }\n\nAuthConfigList.setAdminsFile({\n    admin: \"ThisIsTheDefaultPassword\",\n    alsoAdminUserName: \"AnOtherPassword\",\n});\n\n//for configOfModels and pathToModels see later documentation\nlet server = new ServerAPI(serverConfig, configOfModels, pathToModels, \"auto\");\nserver.start();",
          "type": "js"
        },
        {
          "title": "Custom Authenticator",
          "content": " import {ServerAPI, AuthConnector} from \"nsfw-api\";\n\n AuthConnector.registerAuthMethod(YourCustomAuthenticator);\n\n //for configOfModels and pathToModels see later documentation\n let server = new ServerAPI(serverConfig, configOfModels, pathToModels, \"auto\");\n server.start();\n\n\n class MyCustomAuth {\n\n    static AUTH_METHOD = \"customAuth\";  //Required name for auth interface\n    static AUTH_NAME = \"My Custom Auth\"; //Required displayname for auth interface\n\n    static PARAM_USERNAME = \"username\";\n    static PARAM_PASSWORD = \"password\";\n\n    static getNeededAuthParams(){\n        return {\n            name : MyCustomAuth.AUTH_NAME,\n            params: {\n                [MyCustomAuth.PARAM_USERNAME] : \"username\",\n                [MyCustomAuth.PARAM_PASSWORD]: \"password\",\n            }\n        }\n    }\n\n    static async authorize(authObject) {\n        //authObject contains all values for defined params\n\n        let isAuthorized = ...\n        if(!isAuthorized){\n            return AuthConnector.getError(AuthConnector.ERROR_CREDENTIALS_INCORRECT);\n        } else {\n            return AuthConnector.getSuccessMessage(AuthConfigList.AUTH_METHOD, MyAccessControl.roleNameAdmin, username, username,null);\n        }\n    }\n\n\n}",
          "type": "js"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "doc/customDocumentation/3auth.js",
    "groupTitle": "3. Authentication",
    "groupDescription": "<p>In fact we have some sensible areas in our application which should not be public to everyone. Therefore a authentication is needed. We will differentiate between a direct admin, and a token authentication.</p>",
    "name": "IntroductionAuthenticationsetup"
  },
  {
    "type": "INTRODUCTION",
    "url": "UserAdminRights",
    "title": "3.3 User/Admin Rights",
    "group": "3Auth",
    "description": "<p>In Order to get information which resources and attributes a specific role can access, take a look at <a href=\"#api-Permission\">Permission</a>'s</p>",
    "version": "0.0.0",
    "filename": "doc/customDocumentation/3auth.js",
    "groupTitle": "3. Authentication",
    "groupDescription": "<p>In fact we have some sensible areas in our application which should not be public to everyone. Therefore a authentication is needed. We will differentiate between a direct admin, and a token authentication.</p>",
    "name": "IntroductionUseradminrights"
  },
  {
    "type": "INTRODUCTION",
    "url": "UserAuthentication",
    "title": "3.2 User",
    "group": "3Auth",
    "description": "<p>In order to authenticate as a user, we first need a user account. The registration as a user can be read here: <a href=\"#api-User-CreateUser\">Create User</a>. After we got a valid user Id and the corresponding password, we can obtain an AccessToken.</p>",
    "parameter": {
      "examples": [
        {
          "title": "User authentication example:",
          "content": " var password = \"password\"; // user password\n var user_id = 123; // user id\n var apiURL = \"https://localhost/api\";\n async function getAccessToken(){ // function to obtain an AccessToken\n  let headers = new Headers({\n    'Content-Type': 'application/json',\n  });\n  let url = apiURL+\"/users/\"+user_id+\"/newToken\";\n  // create auth payload\n  let payloadJSON = {\n    plaintextSecret: password,\n    user_id: user_id\n  }\n  // request to server\n  let response = await fetch(url, {\n    method: 'POST',\n    Accept: 'application/json',\n    headers: headers,\n    body: JSON.stringify(payloadJSON) //with credentials\n  });\n  let responseJson = await response.json();\n  return responseJson.accessToken; //return token\n}\n async function getUserProfile(){ // function to a user profile\n  let accessToken = await getAccessToken(); //obtain AccessToken\n  // create headers\n let headers = new Headers({\n            Authorization: \"MyAccessToken \" + accessToken, //with AccessToken\n            \"Content-Type\": \"application/json\",\n        });\n let url = apiURL+\"/user/123/\"; //private profile url\n //request to server\n fetch(url, {\n    method: 'GET',\n    headers: headers,\n})\n .then((response) => response.json())\n .then((responseJson) => { // response of private profile\n    console.log(responseJson);\n});\n}",
          "type": "js"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "doc/customDocumentation/3auth.js",
    "groupTitle": "3. Authentication",
    "groupDescription": "<p>In fact we have some sensible areas in our application which should not be public to everyone. Therefore a authentication is needed. We will differentiate between a direct admin, and a token authentication.</p>",
    "name": "IntroductionUserauthentication"
  },
  {
    "type": "get",
    "url": "/api/version",
    "title": "Get the API version",
    "description": "<p>!! This Route will Never Change !! Get the actual Server API Version number</p>",
    "name": "GetAPIVersion",
    "permission": [
      {
        "name": "Anonym"
      }
    ],
    "group": "4Custom",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>The actual version of the Server API.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://localhost/api/version",
        "type": "json"
      }
    ],
    "version": "0.0.0",
    "filename": "src/module/MyExpressRouter.js",
    "groupTitle": "4. Custom",
    "groupDescription": "<p>This API uses some very important routes, which are listed here. Other Custom Routes can be found at the Section <a href=\"#api-Custom\">Custom</a>.</p>"
  },
  {
    "type": "get",
    "url": "/api/custom/showAllEndpoints",
    "title": "Get All Endpoint routes",
    "description": "<p>Shows all possible routes which could be used</p>",
    "name": "GetAllEndpoints",
    "permission": [
      {
        "name": "Admin"
      }
    ],
    "group": "Custom",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "List[Routes]",
            "optional": false,
            "field": "Routes",
            "description": "<p>All possible routes</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>The possible error that can occur. Possible Errors: INTERNAL_SERVER_ERROR, FORBIDDEN</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://localhost/api/custom/showAllEndpoints",
        "type": "json"
      }
    ],
    "version": "0.0.0",
    "filename": "src/module/MyExpressRouter.js",
    "groupTitle": "Custom",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "allowedValues": [
              "\"Authorization TOKEN\""
            ],
            "optional": false,
            "field": "authorization",
            "description": "<p>Authorization Token.</p>"
          }
        ]
      }
    }
  },
  {
    "type": "get",
    "url": "/api/custom/metrics",
    "title": "Get All route Metrics",
    "description": "<p>Shows alot of informations about the server</p>",
    "name": "GetAllMetrics",
    "permission": [
      {
        "name": "Admin"
      }
    ],
    "group": "Custom",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON[Metrics]",
            "optional": false,
            "field": "Metrics",
            "description": "<p>All metrics for the server routes</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>The possible error that can occur. Possible Errors: INTERNAL_SERVER_ERROR, FORBIDDEN</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://localhost/api/custom/metrics",
        "type": "json"
      }
    ],
    "version": "0.0.0",
    "filename": "src/module/MyExpressRouter.js",
    "groupTitle": "Custom",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "allowedValues": [
              "\"Authorization TOKEN\""
            ],
            "optional": false,
            "field": "authorization",
            "description": "<p>Authorization Token.</p>"
          }
        ]
      }
    }
  }
] });
