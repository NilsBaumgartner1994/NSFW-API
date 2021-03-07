"use strict";
/**
 * Well Done you've found the first API Documentation :-)
 */

/**
 * @apiDefine 1Overview 1. Overview
 * Welcome to the API Documentation of NSFW-API. There are a lot of informations in here. I recommend you to read at least the small 4 Chapters 1-4 and then you should be good enough prepared
 * to handle this API. This Document can be found in /doc/customDocumentation/1overview.js.
 * ! If you make any changes in the documentation please run the command "npm run doc" to generate this document.
 */

/**
 * @api {INTRODUCTION} REST/API 1.1 REST API Choice
 * @apiGroup 1Overview
 * @apiDescription A lot of systems communicate with them self. To support this communication a REST API is a good possibility. A REST API can combine multiple interface and task, so that a shared access from anywhere in a network is possible. Every device which supports a network communication can use the REST API. Further functions can be implemented with low effort.
 */

/**
 * @api {INTRODUCTION} Function/Overview 1.2 Function overview
 * @apiGroup 1Overview
 * @apiDescription This API contains some neat things out of the box, but lets you adapt it for your purposes.
 *
 * @apiParam Models Define models and get access to auto generated REST routes with permission system. Use Hooks (pre- and post-creation) for models, to customize the behavior of default controllers.
 * @apiParam Authentication Use default minimalistic authentications or use/create custom authentication modules. With an RBAC (Role-Based-Access-Control) you can check even for attributes.
 * @apiParam Backups Profit of automatic generated backups (of models) for SqLite. You can create own support for your desired database management tool.
 * @apiParam Schedules Register own multi- or single-threaded schedules. We use the standard node-schedule ;-).
 * @apiParam Custom-Controllers Not enough control of the flow ? Create you own custom controllers with easy permission checks.
 */

/**
 * @api {INTRODUCTION} Quickstart 1.3 Quickstart
 * @apiGroup 1Overview
 * @apiDescription If you want to start and test a bit, look at the /src/development.js file ;-)
 *
 * @apiParam TODO Create a small project with multiple examples for every Function overview
 */