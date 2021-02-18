/* eslint no-console: "off" */

import ScheduleModule from "./module/ScheduleModule";
//External Libraries
import path from "path";
import Express from "express"; //express as server
import MyAccessControl from "./module/MyAccessControl"; //Database handler
import MyExpressRouter from "./module/MyExpressRouter"; //Routing Module
import MyLogger from "./module/MyLogger"; //Logger Module
import FancyTerminal from "./helper/FancyTerminal";
import SequelizeModelLoader from "./helper/SequelizeModelLoader";

/**
 * ServerAPI Starts here
 * All needed modules will be loaded here
 * configurations will be set
 * and the server will be started
 */

let serverConfig = null;

const fs = require("fs"); //file-system

/***********************************************************************************************************************
 *********************************************** Import of Libraries ***************************************************
 **********************************************************************************************************************/

const os = require("os");
const http = require("http"); //if the server cant start as http
const helmet = require("helmet"); //Security
const cluster = require("cluster"); //distibuting this server on all cores of the server

let numCPUs = os.cpus().length;

//numCPUs = 1;
const redis = require("redis"); //for caching
const cors = require("cors"); // for cross origin allow support

let models = null;

const RedisServer = require("redis-server"); //redis server for caching requests
let redisPort = 0;

var myServerAPILogger,
    serverAPILogger,
    myBugReportLogger,
    bugReportLogger,
    myEnvironmentLogger,
    environmentLogger,
    mySystemLogger,
    systemLogger,
    expressApp,
    myAccessControl,
    myExpressRouter,
    scheduleModule,
    redisClient;

//https://manytools.org/hacker-tools/ascii-banner/
//ANSI Shadow
const motd = "\n" +
    "███╗   ██╗███████╗███████╗██╗    ██╗       █████╗ ██████╗ ██╗\n" +
    "████╗  ██║██╔════╝██╔════╝██║    ██║      ██╔══██╗██╔══██╗██║\n" +
    "██╔██╗ ██║███████╗█████╗  ██║ █╗ ██║█████╗███████║██████╔╝██║\n" +
    "██║╚██╗██║╚════██║██╔══╝  ██║███╗██║╚════╝██╔══██║██╔═══╝ ██║\n" +
    "██║ ╚████║███████║██║     ╚███╔███╔╝      ██║  ██║██║     ██║\n" +
    "╚═╝  ╚═══╝╚══════╝╚═╝      ╚══╝╚══╝       ╚═╝  ╚═╝╚═╝     ╚═╝\n";

export default class ServerAPI {

    static MESSAGE_TYPE_CONSOLE = "Console";
    static MESSAGE_TYPE_COMMAND = "Command";

    constructor(serverConfig, sequelizeConfig, pathToModels, numCPUs) {
        this.serverConfig = serverConfig;
        this.sequelizeConfig = sequelizeConfig;
        this.pathToModels = pathToModels;
        //this.sequelizeConfig = sequelizeConfig;
        //this.pathToModels = pathToModels;
        this.numCPUs = isNaN(numCPUs) ? os.cpus().length : numCPUs;
    }

    async start(){
        this.models = SequelizeModelLoader.loadModelsInstance(this.sequelizeConfig, this.pathToModels);
        models = this.models;
        numCPUs = this.numCPUs;
        serverConfig = this.serverConfig;
        redisPort = this.serverConfig.redisPort;
        await startServer();
    }

    static getWorkderId(){
        if (cluster.isWorker) {
            return cluster.worker.id;
        } else {
            return "Master"
        }
    }

}

/***********************************************************************************************************************
 *********************************************** Clustering ************************************************************
 **********************************************************************************************************************/

/**
 * Adds Logging output
 * @param workerID the worker ID or name
 * @param type the type of the message, null for console log
 * @param message The message
 * @returns {Promise<void>}
 */
async function sendToMaster(workerID, type, message) {
    if (!workerID) { // if we receive
        workerID = ServerAPI.getWorkderId();
    }
    if (cluster.isWorker) {
        process.send({workerID: workerID, type: type, message: message});
        return;
    }

    if(!type || type===ServerAPI.MESSAGE_TYPE_CONSOLE){
        FancyTerminal.addWorkerOutput(workerID, message);
    }
}

/**
 * The Main Function of the server
 * @returns {Promise<void>}
 */
async function startServer() {
    if (cluster.isMaster) { //if thats the master
        console.log("Welcome to");
        console.log(motd);
        FancyTerminal.startFancyTerminal(); //start fancy terminal

        await startRedisServer(); //start the redis server

        sendToMaster(null, null, "Models synchronizing ...");
        models.sequelize
        .sync()
        .then(async function () { //model sync finished
            sendToMaster(null, null, "Models synchronized");
            createCluster();
        })
        .catch(function (error) { //models cant be synced
            sendToMaster(null, null, "Error at Model Sync");
            console.log(error.toString());
        });
    } else { //this is not the master then we dont need to reconfigure everything
        prepareWorkerServer();
    }
}

/**
 * Start the Redis Server which caches often request answers
 * @returns {Promise<void>}
 */
async function startRedisServer() {
    if(!serverConfig.redisAlreadyRunning){
        const server = new RedisServer(redisPort);
        await server.open(err => { //start server
            if (err === null) {
                // You may now connect a client to the Redis
                // server bound to port 6379.
            } else {
                sendToMaster(null, null, "Error at starting Redis Server: " + err);
            }
        });
    }
}

/**
 * Configure a Cluster Worker
 * @param cp cluster worker
 * @returns {Promise<void>}
 */
async function configureFork(cp) {
    cp.on("exit", (code, signal) => {
        sendToMaster(null, null, "Some worker died :-(, let's revive him !");
        let revived = cluster.fork();
        configureFork(revived);
    });
    cp.on("message", msg => { //if cluster sends message to master
        const workerID = msg.workerID;
        const message = msg.message;
        const type = msg.type;
        sendToMaster(workerID, type, message); //master will add the output
    });
}

/**
 * Create Cluster with multiple workers
 * @returns {Promise<void>}
 */
async function createCluster() {
    if (cluster.isMaster) {
        sendToMaster(null, null, "Cluster Master starting");

        // Fork workers.
        let cp = null;
        for (let i = 0; i < numCPUs; i++) { //every core should become a worker
            sendToMaster(null, null, "Cluster create Worker: " + i);
            cp = cluster.fork();
            configureFork(cp); //configure it
        }
        prepareMasterServer(); //after that is finished set ourself up
    }
}

/**
 * Prepare the Master Server. The Master Server wont response any requests which are meant for the users, maybe admins
 * @returns {Promise<void>}
 */
async function prepareMasterServer() {
    sendToMaster(null, null, "prepareMasterServer");
    prepareSharedLoggerAndModules();
    createMasterLoggers(); //keep this order
    createMasterExpressApp();
    //startWorkerServer(config.metricsPort); //we will listen on 9999 and we are a "worker"
}

/**
 * Prepare shared Loggers and modules
 */
function prepareSharedLoggerAndModules() {
    createSharedLoggers();
    scheduleModule = new ScheduleModule(serverAPILogger,models,redisClient,cluster.isMaster, serverConfig);
    createSharedModules();
}

/**
 * Prepare a worker server
 * @returns {Promise<void>}
 */
async function prepareWorkerServer() {
    sendToMaster(null, null, "prepare Server");
    prepareSharedLoggerAndModules();
    createWorkerLoggers(); //keep this order
    createWorkerExpressApp();
    await createWorkerModules();
    startWorkerServer();
}

/***********************************************************************************************************************
 *********************************************** Create Loggers ********************************************************
 **********************************************************************************************************************/

/**
 * Create API Logger which everyone will use
 */
function createSharedLoggers() {
    sendToMaster(null, null, "createSharedLoggers");
    myServerAPILogger = new MyLogger("ServerAPI");
    serverAPILogger = myServerAPILogger.getLogger();
}

/**
 * Create the loggers specially for the forks/workers
 */
function createWorkerLoggers() {
    sendToMaster(null, null, "Creating Loggers");

    myBugReportLogger = new MyLogger("BugReport");
    bugReportLogger = myBugReportLogger.getLogger();
}

/**
 * Create the loggers which only the master will need
 */
function createMasterLoggers() {
    sendToMaster(null, null, "Creating Master Loggers");

    myEnvironmentLogger = new MyLogger("Environment");
    environmentLogger = myEnvironmentLogger.getLogger();

    mySystemLogger = new MyLogger("System");
    systemLogger = mySystemLogger.getLogger();
}

/***********************************************************************************************************************
 *********************************************** Create Express App with configurations ********************************
 **********************************************************************************************************************/

/**
 * Create an Express App for the master
 */
function createMasterExpressApp() {
    sendToMaster("Master", "Creating Master Express App");
    expressApp = new Express();
    expressApp.use(cors()); //we allow cross origin
    expressApp.use(cors({credentials: true, origin: true}));
}

/**
 * Create an Express App for the workers
 */
function createWorkerExpressApp() {
    sendToMaster(null, null, "Creating ExpressApp");
    expressApp = new Express();
    expressApp.use(cors()); // we allow cross orign

    expressApp.use(helmet()); //use security
    expressApp.disable("x-powered-by"); //Attackers can use this header to detect apps running Express and then launch specifically-targeted attacks.

    // use ejs templates
    expressApp.set("view engine", "ejs");
    expressApp.set("views", path.join(__dirname, "views"));

    expressApp.use(cors({credentials: true, origin: true}));

    // define the folder that will be used for static assets
    expressApp.use(Express.static(path.join(__dirname, "static")));
}

/***********************************************************************************************************************
 *********************************************** Create Modules ********************************************************
 **********************************************************************************************************************/

/**
 * Create Modules everyone will need
 */
function createSharedModules() {
    createRedisClient();
}

/**
 * Create a Redis Client
 */
function createRedisClient() {
    redisClient = redis.createClient(redisPort);
    redisClient.on("error", err => {
        sendToMaster(null, null, err);
    });
}

/**
 * Create worker Modules
 */
async function createWorkerModules() {
    sendToMaster(null, null, "creating Modules");
    myAccessControl = new MyAccessControl(serverAPILogger, models);
    myExpressRouter = new MyExpressRouter(
        serverAPILogger,
        bugReportLogger,
        expressApp,
        models,
        myAccessControl.getAccessControlInstance(),
        redisClient,
        serverConfig
    );
    await myExpressRouter.configureController(); //configure the routes
}

/***********************************************************************************************************************
 *********************************************** Start the Server ******************************************************
 **********************************************************************************************************************/

/**
 * Start a Server for the worker
 * @param customPort if a specific port if wanted, this can be used
 */
function startWorkerServer(customPort) {
    sendToMaster(null, null, "Starting Server ...");
    let port = serverConfig.port;
    if (!!customPort) {
        port = customPort;
    }

    if (cluster.isMaster) {
        sendToMaster("Master", "Master Server ready on port: " + port);
    }

    const env = process.env.NODE_ENV || "production"; //get the enviroment

    var ownPath = fs.realpathSync(".");

	http.createServer(expressApp).listen(port, err => { //well start http instead
	    if (err) {
	        return console.error(err);
	    }
	    sendToMaster(null, null, `Server running on http://localhost:${port} [${env}]}`);

	});
}
