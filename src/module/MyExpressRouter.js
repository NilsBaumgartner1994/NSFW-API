import SequelizeSchemeController from "../controllers/SequelizeSchemeController";
import HttpStatus from 'http-status-codes';
import SystemInformationSchedule from '../schedules/SystemInformationSchedule'

import SequelizeController from "../controllers/SequelizeController";
import Express from "express"; //express as server
import MetricsHelper from "../helper/MetricsHelper";
import DateHelper from "../helper/DateHelper";
import DefaultControllerHelper from "../helper/DefaultControllerHelper";
import MyAuthMiddlewares from "../auth/MyAuthMiddlewares";
import CustomControllers from "../controllers/CustomControllers";
import ServerController from "../controllers/ServerController";
import ServerAPI from "../ServerAPI";

const { promisify } = require("util");

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser'); //a parser for requests with body data

/**
 * The My Express Router which is the core functionality. It setups all controllers and handles routes
 */
export default class MyExpressRouter {

    static urlAPI = "/api"; //the api url
    static redisClient = null; //the redis client

    static days_parameter = "date"; //parameter name for dates

    /***************************************
     ************ Routes *******************
     **************************************/
    static routeVersion = MyExpressRouter.urlAPI + "/version";
    static routeTime = MyExpressRouter.urlAPI + "/time";
    static routeFunctions = MyExpressRouter.urlAPI + "/functions";
    static routeModels = MyExpressRouter.urlAPI+"/models";
    static routeSchemes = MyExpressRouter.urlAPI+"/schemes";
    static routeAuth = MyExpressRouter.urlAPI + "/auth"; //Route to authenticate
    static routeServer = MyExpressRouter.urlAPI+"/server"; //Routes to Server Functions like Restart
    static routeCustom = MyExpressRouter.urlAPI+"/custom"; //Routes to custom API Endpoints

    /**
     * 1. Declare a new Resource Name, a Parameter, AccessControll Resource, and RouteIdentifier
     */

        // Functions

    static function_backup_resource_id_parameter = "backup_id";
    static function_backup_routeIdentifier = "/backups";
    static function_backup_resourceName = "backup";
    static function_backup_accessControlResouce = "Function_Backup";

    static function_database_resourceName = "database";
    static function_database_accessControlResource = "Function_Database";

    /**
     * 2. Create the Route and Associations
     */

        //Functions
    static function_routeBackups = MyExpressRouter.routeFunctions + MyExpressRouter.function_backup_routeIdentifier;
    static function_routeBackupCreate = MyExpressRouter.function_routeBackups + "create";
    static function_routeBackup = MyExpressRouter.function_routeBackups + "/:" + MyExpressRouter.function_backup_resource_id_parameter;
    static function_routeBackupDownload = MyExpressRouter.function_routeBackup + "/download";
    static function_routeBackupRestore = MyExpressRouter.function_routeBackup + "/restore";

    /**
     * Custom Routes
     */
    static custom_routeIdentifier = "/custom";
    static custom_routeResources = MyExpressRouter.urlAPI + MyExpressRouter.custom_routeIdentifier;

    //Define a ControlResource for general purpose for admins
    static adminRoutes_accessControlResource = "AdminFunctions";

    static custom_routeMetrics = MyExpressRouter.custom_routeResources + "/metrics";
    static custom_bugReport = MyExpressRouter.custom_routeResources + "/bugReport";
    static custom_showAllEndpoints = MyExpressRouter.custom_routeResources + "/showAllEndpoints";
    static custom_routeSystemInformation = MyExpressRouter.custom_routeResources + "/systemInformation";
    static custom_routeSendPushNotification = MyExpressRouter.custom_routeResources + "/sendNotification";

    /**
     * API
     */

    /**
     * Constructor of the MyExpressRouter
     * @param logger The logger class
     * @param bugReportLogger The bug Report logger
     * @param expressApp the express app itseld
     * @param models the sequelize models
     * @param myAccessControl the access controll instance
     * @param redisClient the redis client
     */
    constructor(logger, bugReportLogger, expressApp, models, myAccessControl, redisClient, serverConfig) {
        this.logger = logger;
        this.serverConfig = serverConfig;
        this.logger.info("[MyExpressRouter] initialising");
        this.startTime = new Date();
        this.models = models;
        this.expressApp = expressApp;
        this.myAccessControl = myAccessControl;
        MyExpressRouter.redisClient = redisClient;

        this.configureExpressApp(); //configure parameters like which requests are allowed
        // !!BEFORE any other things, otherwise body content wont be parsed

        let authConfig = serverConfig["auth"];
        this.myAuthMiddlewares = new MyAuthMiddlewares(logger, expressApp, MyExpressRouter.routeAuth, authConfig);
        //create the token helper
        //!!AFTER configureExpressApp, otherwise body content wont be parsed ...

        this.configurePublicParamCheckers();
        this.configurePublicRoutes();

        this.logger.info("[MyExpressRouter] initialised");
    }

    static async saveInRedis(key, value){
        const setAsync = promisify(MyExpressRouter.redisClient.set).bind(MyExpressRouter.redisClient);
        return await setAsync(key, value);
    }

    static async deleteInRedis(key){
        const delAsync = promisify(MyExpressRouter.redisClient.del).bind(MyExpressRouter.redisClient);
        return await delAsync(key);
    }

    static async getFromRedis(key){
        const getAsync = promisify(MyExpressRouter.redisClient.get).bind(MyExpressRouter.redisClient);
        return await getAsync(key);
    }

    /**
     * Respond Helpers
     */

    /**
     * Response with JSON to a request
     * @param res The response object
     * @param status the status
     * @param jsonData the json data
     */
    static responseWithSuccessJSON(res, jsonData) {
        let envelope = {
            success: true,
            status: HttpStatus.OK,
            data: jsonData
        }
        MyExpressRouter.responseWithJSON(res, HttpStatus.OK, envelope);
    }

    /**
     * Response with JSON to a request
     * @param res The response object
     * @param status the status
     * @param jsonData the json data
     */
    static responseWithErrorJSON(res, errStatus, error) {
        let envelope = {
            success: false,
            status: errStatus,
            error: error
        }
        MyExpressRouter.responseWithJSON(res, errStatus, envelope);
    }

    /**
     * Response with JSON to a request
     * @param res The response object
     * @param status the status
     * @param jsonData the json data
     */
    static responseWithJSON(res, status, jsonData) {
        res.status(status);
        res.header('Content-Type', 'application/json');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        let jsonString = JSON.stringify(jsonData);
        res.end(jsonString);
    }

    /**
     * Response to a file Upload
     * @param res the response object
     * @param status the status
     */
    static responseToFileUpload(res, status) {
        res.status(status);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.end();
    }

    /**
     * A Parameter Checker for Dates
     * @param req the request object
     * @param res the response object
     * @param next the next function
     * @param date the date to be checked
     * @returns boolean next function on success, else response with error and false
     */
    static paramcheckerDay(req, res, next, date) {
        let matches = /^(\d{1,2})[-](\d{1,2})[-](\d{4})$/.exec(date); //does date matches the regex DD-DD-DDDD ?
        if (matches == null) return false;
        let d = matches[1]; //get day
        let m = matches[2]; //get month
        let y = matches[3]; //get year

        let validDate = DateHelper.validateAndFormatDate(d, m, y); //is this a valid date ?
        if (!validDate) { //if not valid date
            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.BAD_REQUEST, {message:'date has wrong format', date: date});
        } else { //if valid date
            req.locals.date = validDate;
            next();
        }
    }

    /**
     * Configure the Express App
     */
    configureExpressApp() {
        this.logger.info("[MyExpressRouter] configuring Routes App");

        let maxFileUploadSizeInMb = this.serverConfig.uploads.maxFileUploadSizeInMb || 50;
        let maxBodyUploadSizeInMb = this.serverConfig.uploads.maxBodyUploadSizeInMb || 50;
        this.expressApp.use(bodyParser.json({limit: maxBodyUploadSizeInMb+'mb'})); //set body limit
        this.expressApp.use(bodyParser.urlencoded({limit: maxBodyUploadSizeInMb+'mb', extended: true})); //set url limit
        this.expressApp.use(Express.json());

        this.expressApp.use(fileUpload({ //set fileupload limit
            useTempFiles: true,
            tempFileDir: '/tmp/',
            limits: {fileSize: maxFileUploadSizeInMb * 1024 * 1024}
        }));

        //Accept Uploads from Cross Origins - for accepting uploads of files/images
        this.expressApp.options("/*", function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.send(200);
        });
    }

    configurePublicParamCheckers(){
        this.expressApp.param(MyExpressRouter.days_parameter, MyExpressRouter.paramcheckerDay.bind(this)); //set date param checker
    }

    configurePublicRoutes(){
        this.expressApp.get(MyExpressRouter.custom_showAllEndpoints, this.handleCustomShowAllEndpoints.bind(this));
        //for api stress test https://loader.io/
        this.expressApp.get("/loaderio-4fffcfb2d8504b146819ec8df3a58421/", this.handleVerification.bind(this));

        this.expressApp.get(MyExpressRouter.routeVersion, this.handleVersionRequest.bind(this));
        this.expressApp.get(MyExpressRouter.routeTime, this.handleTimeRequest.bind(this));



        this.expressApp.get(MyExpressRouter.custom_routeSystemInformation, this.handleSystemInformationGetRequest.bind(this));
        //this.expressApp.get(MyExpressRouter.custom_routeMetrics, this.handleMetricsRequest.bind(this));
    }

    /**
     * Configure all Controllers which then will register the routes and handle requests
     */
    async configureController() {
        let logger = this.logger;
        let models = this.models;
        let expressApp = this.expressApp;
        let myAccessControl = this.myAccessControl;
        let instance = this;

        //Function

        // Helper
        this.defaultControllerHelper = new DefaultControllerHelper(logger, models, instance);

        this.sequelizeController = new SequelizeController(logger,models,expressApp,myAccessControl,instance);
        this.sequelizeSchemeController = new SequelizeSchemeController(logger,models,expressApp,myAccessControl,instance);

        this.serverController = new ServerController(logger,models,expressApp,myAccessControl,instance, MyExpressRouter.routeServer);

        this.customController = new CustomControllers(logger, models, expressApp, myAccessControl, instance, MyExpressRouter.routeCustom); //create controller for custom endpoints

    }

    /**
     * Handle LoaderIO verification https://loader.io/ for stress tests
     * @param req the request object
     * @param res the response object
     */
    handleVerification(req, res) {
        res.set('Content-Type', 'text/html');
        res.status(200);
        res.send("loaderio-4fffcfb2d8504b146819ec8df3a58421");

    }

    /**
     * Middlewares
     */

    /**
     * Shows route metrics of the server
     * @param req the request object
     * @param res the response object
     *
     * @api {get} /api/custom/metrics Get All route Metrics
     * @apiDescription Shows alot of informations about the server
     * @apiName GetAllMetrics
     * @apiPermission Admin
     * @apiUse MyAuthorization
     * @apiGroup Custom
     *
     * @apiSuccess {JSON[Metrics]} Metrics All metrics for the server routes
     * @apiError (Error) {String} error The possible error that can occur. Possible Errors: INTERNAL_SERVER_ERROR, FORBIDDEN
     *
     * @apiExample Example usage:
     * curl -i http://localhost/api/custom/metrics
     */
    async handleMetricsRequest(req,res){
	console.log("handleMetricsRequest");
	let metrics = await MetricsHelper.getMetrics(req);
	MyExpressRouter.responseWithSuccessJSON(res, metrics);
    }

    /**
     * Custom
     */

    /**
     * Shows all possible routes which could be used
     * @param req the request object
     * @param res the response object
     *
     * @api {get} /api/custom/showAllEndpoints Get All Endpoint routes
     * @apiDescription Shows all possible routes which could be used
     * @apiName GetAllEndpoints
     * @apiPermission Admin
     * @apiUse MyAuthorization
     * @apiGroup Custom
     *
     * @apiSuccess {List[Routes]} Routes All possible routes
     * @apiError (Error) {String} error The possible error that can occur. Possible Errors: INTERNAL_SERVER_ERROR, FORBIDDEN
     *
     * @apiExample Example usage:
     * curl -i http://localhost/api/custom/showAllEndpoints
     */
    handleCustomShowAllEndpoints(req, res) {
        let permission = this.myAccessControl
        .can(req.locals.currentUser.role)
        .readAny(MyExpressRouter.adminRoutes_accessControlResource);

        if (permission.granted) {
            try {
                console.log("handleShowAllEndpoints");
                let expressApp = this.expressApp;
                let endpoints = expressApp._router.stack;
                let answer = endpoints;
                MyExpressRouter.responseWithSuccessJSON(res, answer);
            } catch (err) {
                MyExpressRouter.responseWithErrorJSON(res, HttpStatus.INTERNAL_SERVER_ERROR, {message:err.toString()});
            }
        } else {
            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.FORBIDDEN, {
                errorCode: HttpStatus.FORBIDDEN,
                error:
                    "Forbidden to see all endpoints: "
            });
        }
    }

    /**
     * Other
     */

    /**
     * !! This Route will Never Change !! Get the actual Server API Version number.
     * @param req the request object
     * @param res the response object
     *
     * @api {get} /api/version Get the API version
     * @apiDescription !! This Route will Never Change !! Get the actual Server API Version number
     * @apiName GetAPIVersion
     * @apiPermission Anonym
     * @apiGroup 4Custom
     *
     * @apiSuccess {String} version The actual version of the Server API.
     *
     * @apiExample Example usage:
     * curl -i http://localhost/api/version
     */
    handleVersionRequest(req, res) {
        let version = this.serverConfig.serverAPIVersion; //the server version https://semver.org/
        let answer = {version: version};
        MyExpressRouter.responseWithSuccessJSON(res, answer);

    }


    /**
     * Get the starttime and current time of the current worker instance
     * @param req the request object
     * @param res the response object
     *
     * @api {get} /api/time Get the API version
     * @apiDescription Get the current time of the worker thread and the start time of the worker
     * @apiName GetAPIVersion
     * @apiPermission Anonym
     * @apiGroup 4Custom
     *
     * @apiSuccess {String} version The actual version of the Server API.
     *
     * @apiExample Example usage:
     * curl -i http://localhost/api/time
     */
    handleTimeRequest(req, res) {
        let startTime = this.startTime
        let answer = {startTime: startTime, currentTime: new Date(), workerId: ServerAPI.getWorkderId()};
        MyExpressRouter.responseWithSuccessJSON(res, answer);
    }

    /**
     * Handle System Information Request, which provide all machine based informations
     * @param req the request object
     * @param res the response object
     *
     * @api {get} /api/custom/systemInformation Get All System Informations
     * @apiDescription Handle System Information Request, which provide all machine based informations
     * @apiName GetAllSystemInformations
     * @apiPermission Admin
     * @apiUse MyAuthorization
     * @apiGroup Custom
     *
     * @apiSuccess {List[Routes]} Routes All possible routes
     * @apiError (Error) {String} error The possible error that can occur. Possible Errors: FORBIDDEN
     *
     * @apiExample Example usage:
     * curl -i http://localhost/api/custom/systemInformation
     */
    handleSystemInformationGetRequest(req, res) {
        this.logger.info("System Information Request");

        let permission = this.myAccessControl
        .can(req.locals.currentUser.role)
        .readAny(MyExpressRouter.adminRoutes_accessControlResource);

        if (permission.granted) { //can read system informations
            let answer = SystemInformationSchedule.allInformations;
            MyExpressRouter.responseWithSuccessJSON(res, answer);
        } else {
            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.FORBIDDEN, {
                errorCode: HttpStatus.FORBIDDEN,
                error: 'Forbidden to get System Informations'
            });
        }
    }
}
