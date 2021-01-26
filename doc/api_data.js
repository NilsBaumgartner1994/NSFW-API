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
    "groupDescription": "<p>Welcome to the API Documentation of GEG. There are a lot of informations in here. I recommend you to read at least the small 4 Chapters 1-4 and then you should be good enough prepared to handle this API. This Document can be found in /GEG/API/doc/customDocumentation/1overview.js. ! If you make any changes in the documentation please run the command &quot;npm run doc&quot; to generate this document.</p>",
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
    "groupDescription": "<p>Welcome to the API Documentation of GEG. There are a lot of informations in here. I recommend you to read at least the small 4 Chapters 1-4 and then you should be good enough prepared to handle this API. This Document can be found in /GEG/API/doc/customDocumentation/1overview.js. ! If you make any changes in the documentation please run the command &quot;npm run doc&quot; to generate this document.</p>",
    "name": "IntroductionRestApi"
  },
  {
    "type": "INTRODUCTION",
    "url": "JavascriptGet",
    "title": "2.1 GET Request",
    "group": "2Client",
    "description": "<p>In this example our client want to receive a meal from the API. Therefore we assume we got authentication headers, which will be explained in the next section.</p>",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "var server = \"https://localhost/api/\";\nvar mealID = 123;\nvar resource_url = \"meals/\"+mealID+\"/\";\nasync function getMeal(){\n   // define the content type of our sending information\n   let headers = new Headers({\n       'Content-Type': 'application/json'\n   });\n   // create request to the server\n   let response = await fetch(server+resource_url, {\n       method: \"GET\",\n       credentials: 'include',\n       headers: headers,\n   });\n   // return our response\n   return response.json();\n}",
          "type": "js"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "doc/customDocumentation/2client.js",
    "groupTitle": "2. Clients",
    "groupDescription": "<p>To communicate with the API clients are needed. All clients just need the HTTP Methods and a network connection to the API. In the following we will focus on Javascript clients. We assume that the API is reachable at the URL: &quot;https://localhost&quot;, in some real cases you need to specify a port.</p>",
    "name": "IntroductionJavascriptget"
  },
  {
    "type": "INTRODUCTION",
    "url": "JavascriptPost",
    "title": "2.2 POST Request",
    "group": "2Client",
    "description": "<p>In this example our client want to update a meal with a new name. Beseide POST Request there are also DELETE and PUT requests. In our API instead of PUT request, we use POST requests.</p>",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "var payload_json = {name: \"new name\"};\nvar payload = JSON.stringify(payload_json);\nvar server = \"https://localhost/api/\";\nvar mealID = 123;\nvar resource_url = \"meals/\"+mealID+\"/\";\nasync function updateMeal(){\n    // create request to the server\n    let response = await fetch(server+resource_url, {\n           method: \"POST\",\n           credentials: 'include',\n           headers: headers,\n           body: payload,\n    });\n    // return our response\n    return response.json();\n }",
          "type": "js"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "doc/customDocumentation/2client.js",
    "groupTitle": "2. Clients",
    "groupDescription": "<p>To communicate with the API clients are needed. All clients just need the HTTP Methods and a network connection to the API. In the following we will focus on Javascript clients. We assume that the API is reachable at the URL: &quot;https://localhost&quot;, in some real cases you need to specify a port.</p>",
    "name": "IntroductionJavascriptpost"
  },
  {
    "type": "INTRODUCTION",
    "url": "AdminAuthentication",
    "title": "3.1 Admin",
    "group": "3Auth",
    "description": "<p>To get an admin role you need to run request on the same machine/IP. This can be achieved via an proxy server which has a basic authentication. In this repository there is a proxy server already installed, which only needs to be started.</p>",
    "parameter": {
      "examples": [
        {
          "title": "Admin authentication example:",
          "content": "let username = \"admin\";\nlet password = \"password\";\nlet portProxy = 3002;\nlet url = \"https://localhost:\"+portProxy+\"/api/secretArea\";\nlet encoded = btoa(username+\":\"+password); //encoded username and password\n//header creation with username and password\nlet headers = new Headers({\n   'Content-Type': 'application/json',\n   'Authorization': 'Basic ' + encoded\n});\nfetch(url, {\n   method: 'GET',\n   Accept: 'application/json',\n   headers: headers, //adding headers\n})\n.then((response) => response.json())\n.then((responseJson) => {\n   console.log(responseJson); //receiving response\n});",
          "type": "js"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "doc/customDocumentation/3auth.js",
    "groupTitle": "3. Authentication",
    "groupDescription": "<p>In fact we have some sensible areas in our application which should not be public to everyone. Therefore a authentication is needed. We will differentiate between a direct admin, and a token authentication.</p>",
    "name": "IntroductionAdminauthentication"
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
    "type": "MODEL",
    "url": "Role",
    "title": "Role",
    "name": "ModelRole",
    "group": "5Models",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Resource ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>The name of the role</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "createdAt",
            "description": "<p>The date the resource was created</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "updatedAt",
            "description": "<p>The date the resource was updated</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "models/role.js",
    "groupTitle": "5. Models",
    "groupDescription": "<p>All models are listed below. All models got a Field &quot;createdAt&quot; and &quot;updatedAt&quot;, these Fields update automatically, dont change them unless you realy need it !</p>"
  },
  {
    "type": "MODEL",
    "url": "User",
    "title": "User",
    "name": "ModelUser",
    "group": "5Models",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Resource ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": false,
            "field": "privacyPoliceReadDate",
            "description": "<p>The last date the user read the privacy policy</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "CanteenId",
            "description": "<p><a href=\"#api-1._Models-ModelCanteen\">Canteen</a>'s Id in which a user eats</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "ResidenceId",
            "description": "<p><a href=\"#api-1._Models-ModelResidence\">Residence</a>'s Id in which a user lives</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "pseudonym",
            "description": "<p>The nickname a user choosed</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"l\"",
              "\"g\"",
              "\"f\""
            ],
            "optional": true,
            "field": "typefood",
            "description": "<p>The foodtags a user likes</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "language",
            "description": "<p>The language a user uses</p>"
          },
          {
            "group": "Parameter",
            "type": "JSON",
            "optional": true,
            "field": "avatar",
            "description": "<p>The avatar of the user</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "online_time",
            "description": "<p>The last time the user was online</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "createdAt",
            "description": "<p>The date the resource was created</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "updatedAt",
            "description": "<p>The date the resource was updated</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "models/user.js",
    "groupTitle": "5. Models",
    "groupDescription": "<p>All models are listed below. All models got a Field &quot;createdAt&quot; and &quot;updatedAt&quot;, these Fields update automatically, dont change them unless you realy need it !</p>"
  },
  {
    "type": "MODEL",
    "url": "UserRole",
    "title": "UserRole",
    "name": "ModelUserRole",
    "group": "5Models",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "UserId",
            "description": "<p><a href=\"#api-1._Models-ModelUser\">UserId</a>'s Id</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "RoleId",
            "description": "<p><a href=\"#api-1._Models-ModelRole\">Role</a>'s Id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "beginnAt",
            "description": "<p>The date the authorization is starting</p>"
          },
          {
            "group": "Parameter",
            "type": "JSON",
            "optional": true,
            "field": "endAt",
            "description": "<p>The date the authorization will expired</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "createdAt",
            "description": "<p>The date the resource was created</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "updatedAt",
            "description": "<p>The date the resource was updated</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "models/userrole.js",
    "groupTitle": "5. Models",
    "groupDescription": "<p>All models are listed below. All models got a Field &quot;createdAt&quot; and &quot;updatedAt&quot;, these Fields update automatically, dont change them unless you realy need it !</p>"
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
  },
  {
    "type": "get",
    "url": "/api/custom/systemInformation",
    "title": "Get All System Informations",
    "description": "<p>Handle System Information Request, which provide all machine based informations</p>",
    "name": "GetAllSystemInformations",
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
            "description": "<p>The possible error that can occur. Possible Errors: FORBIDDEN</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i http://localhost/api/custom/systemInformation",
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
    "url": "/api/custom/sendNotification",
    "title": "Get All System Informations",
    "description": "<p>Sends Push Notifications to the given Devices</p>",
    "name": "GetSendPushNotification",
    "permission": [
      {
        "name": "Admin"
      }
    ],
    "group": "Custom",
    "parameter": {
      "fields": {
        "Request message body": [
          {
            "group": "Request message body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>The title for the push notification</p>"
          },
          {
            "group": "Request message body",
            "type": "String",
            "optional": false,
            "field": "body",
            "description": "<p>The body text for the push notification</p>"
          },
          {
            "group": "Request message body",
            "type": "String",
            "optional": false,
            "field": "badge",
            "description": "<p>for iOS Devices the App Notifier number</p>"
          },
          {
            "group": "Request message body",
            "type": "List[String]",
            "optional": false,
            "field": "listOfDeviceIDs",
            "description": "<p>The list of recipients</p>"
          }
        ]
      }
    },
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
