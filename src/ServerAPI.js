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
import DatabaseBackupModule from "./plugins/backupPlugin/DatabaseBackupModule";

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

const SIGNAL_PEACEFULL_SHUTDOWN = "SIGTERM";

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
    sequelizeConfig,
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
    static COMMAND_RESTART = "Restart";

    static instance = null;

    constructor(serverConfig, sequelizeConfig, pathToModels, numCPUs) {
        ServerAPI.instance = this;
        this.serverConfig = serverConfig;
        this.sequelizeConfig = sequelizeConfig;
        this.pathToModels = pathToModels;
        this.registeredPlugins = {};
        this.numCPUs = isNaN(numCPUs) ? os.cpus().length : Math.max(numCPUs, 1); //atleast one worker
    }

    async start(){
        this.models = await SequelizeModelLoader.loadModelsInstance(this.sequelizeConfig, this.pathToModels);
        models = this.models;
        numCPUs = this.numCPUs;
        serverConfig = this.serverConfig;
        sequelizeConfig = this.sequelizeConfig;
        redisPort = this.serverConfig.redisPort;
        await startServer();
    }

    registerPlugin(pluginName, pluginInstance){
        if(typeof pluginName==="string" && pluginName.length > 0 && !!pluginInstance && !this.registeredPlugins[pluginName]){
            if(
                typeof pluginInstance.activateMasterPlugin === "function" &&
                typeof pluginInstance.activateWorkerPlugin === "function"
            ){
                this.registeredPlugins[pluginName] = pluginInstance;
                return true;
            }
        }
        return false;
    }

    static getWorkderId(){
        if (cluster.isWorker) {
            return cluster.worker.id;
        } else {
            return "Master"
        }
    }

    /**
     * Adds Logging output
     * @param workerID the worker ID or name
     * @param type the type of the message, null for console log
     * @param message The message
     * @returns {Promise<void>}
     */
    static async sendToMaster(workerID, type, message) {
        if (!workerID) { // if we receive
            workerID = ServerAPI.getWorkderId();
        }

        if (cluster.isWorker) {
            const test = require('net').createServer();
            test.on('connection', (socket) => {
                socket.end('handled by parent');
            });
            process.send({workerID: workerID, type: type, message: message}, test);
            return;
        } else {
            if(!type || type===ServerAPI.MESSAGE_TYPE_CONSOLE){
                return await FancyTerminal.addWorkerOutput(workerID, message);
            }
            if(type === ServerAPI.MESSAGE_TYPE_COMMAND){
                if(message === ServerAPI.COMMAND_RESTART){
                    ServerAPI.sendToMaster(null, null, "Restarting all Workers");
                    await shutdownWorkers(SIGNAL_PEACEFULL_SHUTDOWN);

                    //since the workers shut down, we shouold restart our own schedule
                    scheduleModule.cancelAllSchedules();
                    createScheduleModule();

                    createCluster();
                    return;
                }
            }
        }
    }

    static async restartWorkers(){
        await ServerAPI.sendToMaster(null, ServerAPI.MESSAGE_TYPE_COMMAND, ServerAPI.COMMAND_RESTART);
    }

}

/***********************************************************************************************************************
 *********************************************** Clustering ************************************************************
 **********************************************************************************************************************/

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

        ServerAPI.sendToMaster(null, null, "Models synchronizing ...");
        models.sequelize
        .sync()
        .then(async function () { //model sync finished
            ServerAPI.sendToMaster(null, null, "Models synchronized");
            createCluster();
            prepareMasterServer(); //after that is finished set ourself up
        })
        .catch(function (error) { //models cant be synced
            ServerAPI.sendToMaster(null, null, "Error at Model Sync");
            console.log(error.toString());
        });
    } else { //this is not the master then we dont need to reconfigure everything
        prepareWorkerServer();
    }
}

function shutdownWorkers(signal){
    //https://medium.com/@gaurav.lahoti/graceful-shutdown-of-node-js-workers-dd58bbff9e30
    ServerAPI.sendToMaster(null, null, "Workers are now being shut down");
    return new Promise((resolve, reject) => {
        if (!cluster.isMaster) {  // if we are not master just skip
            return resolve()
        }

        const wIds = Object.keys(cluster.workers)
        if (wIds.length === 0) { return resolve() }
        //Filter all the valid workers
        let workers = [];
        for(let i=0; i<wIds.length; i++){
            let id = wIds[i];
            let worker = cluster.workers[id];
            workers.push(worker);
        }

        let workersAlive = 0
        let funcRun = 0

        //Count the number of alive workers and keep looping until the number is zero.
        const fn = () => {
            ++funcRun
            workersAlive = 0
            workers.forEach(worker => {
                if (!worker.isDead()) {
                    ++workersAlive
                    if (funcRun === 1) {
                        //On the first execution of the function, send the received signal to all the workers
                        worker.kill(signal);
                        worker.destroy();
                    }
                }
            })
            ServerAPI.sendToMaster(null, null, workersAlive + " workers alive");
            if (workersAlive === 0) {
                //Clear the interval when all workers are dead
                clearInterval(interval)
                return resolve()
            }
        }
        const interval = setInterval(fn, 500)
    })
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
                ServerAPI.sendToMaster(null, null, "Error at starting Redis Server: " + err);
            }
        });
    }
}

/**
 * Configure a Cluster Worker
 * @param cp cluster worker
 */
function configureFork(cp) {
    if (cluster.isMaster) {
        cp.on("exit", (code, signal) => {
            //MASTER THREAD START
            if(signal===SIGNAL_PEACEFULL_SHUTDOWN){
                ServerAPI.sendToMaster(null, null, "A worker peacefully shutdown");
            } else {
                ServerAPI.sendToMaster(null, null, "Exit of a worker");
                ServerAPI.sendToMaster(null, null, "code: "+code+" | signal: "+signal);
                ServerAPI.sendToMaster(null, null, "Let's revive him !");
                spawnWorker();
            }
            //MASTER THREAD END
        });
        cp.on("message", (msg, handle) => { //if cluster sends message to master
            const workerID = msg.workerID;
            const message = msg.message;
            const type = msg.type;
            ServerAPI.sendToMaster(workerID, type, message); //master will add the output
        });
    }
}

function spawnWorker(){
    let cp = cluster.fork();
    configureFork(cp); //configure it
}

/**
 * Create Cluster with multiple workers
 */
function createCluster() {
    if (cluster.isMaster) {
        ServerAPI.sendToMaster(null, null, "Cluster Master starting");

        // Fork workers.
        for (let i = 0; i < numCPUs; i++) { //every core should become a worker
            ServerAPI.sendToMaster(null, null, "Cluster create Worker: " + i);
            spawnWorker();
        }
    }
}

/**
 * Prepare the Master Server. The Master Server wont response any requests which are meant for the users, maybe admins
 * @returns {Promise<void>}
 */
async function prepareMasterServer() {
    ServerAPI.sendToMaster(null, null, "prepareMasterServer");
    prepareSharedLoggerAndModules();
    createMasterLoggers(); //keep this after prepareSharedLoggerAndModules()
    await activatePlugins(); //just before we would start the server
}

/**
 * Prepare shared Loggers and modules
 */
function prepareSharedLoggerAndModules() {
    createSharedLoggers();
    createScheduleModule();
    createSharedModules();
}

function createScheduleModule(){
    scheduleModule = new ScheduleModule(serverAPILogger,models,redisClient, serverConfig);
}

/**
 * Prepare a worker server
 * @returns {Promise<void>}
 */
async function prepareWorkerServer() {
    ServerAPI.sendToMaster(null, null, "prepare Server");
    prepareSharedLoggerAndModules();
    createWorkerLoggers(); //keep this order
    createWorkerExpressApp();
    await createWorkerModules();
    await activatePlugins(); //just before we would start the server
    startWorkerServer();
}

async function activatePlugins(){
    let registeredPlugins = ServerAPI.instance.registeredPlugins;
    let pluginNames = Object.keys(registeredPlugins);

    let schedule = scheduleModule.getSchedule();
    for(let i=0; i<pluginNames.length; i++){
        let pluginName = pluginNames[i];
        let plugin = registeredPlugins[pluginName];
        let pluginLogger = new MyLogger(pluginName).getLogger();
        let route = MyExpressRouter.getPluginRoute(pluginName);

        if(cluster.isMaster){
            await plugin.activateMasterPlugin(pluginLogger, models, schedule, redisClient, serverConfig, sequelizeConfig, null);
        } else {
            await plugin.activateWorkerPlugin(pluginLogger, models, schedule, redisClient, serverConfig, sequelizeConfig, myExpressRouter, route);
        }
    }
}

/***********************************************************************************************************************
 *********************************************** Create Loggers ********************************************************
 **********************************************************************************************************************/

/**
 * Create API Logger which everyone will use
 */
function createSharedLoggers() {
    ServerAPI.sendToMaster(null, null, "createSharedLoggers");
    myServerAPILogger = new MyLogger("ServerAPI");
    serverAPILogger = myServerAPILogger.getLogger();
}

/**
 * Create the loggers specially for the forks/workers
 */
function createWorkerLoggers() {
    ServerAPI.sendToMaster(null, null, "Creating Loggers");

    myBugReportLogger = new MyLogger("BugReport");
    bugReportLogger = myBugReportLogger.getLogger();
}

/**
 * Create the loggers which only the master will need
 */
function createMasterLoggers() {
    ServerAPI.sendToMaster(null, null, "Creating Master Loggers");

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
    ServerAPI.sendToMaster("Master", "Creating Master Express App");
    expressApp = new Express();
    expressApp.use(cors()); //we allow cross origin
    expressApp.use(cors({credentials: true, origin: true}));
}

/**
 * Create an Express App for the workers
 */
function createWorkerExpressApp() {
    ServerAPI.sendToMaster(null, null, "Creating ExpressApp");
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
        ServerAPI.sendToMaster(null, null, err);
    });
}

/**
 * Create worker Modules
 */
async function createWorkerModules() {
    ServerAPI.sendToMaster(null, null, "creating Modules");
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
    ServerAPI.sendToMaster(null, null, "Starting Server ...");
    let port = serverConfig.port;
    if (!!customPort) {
        port = customPort;
    }

    if (cluster.isMaster) {
        ServerAPI.sendToMaster("Master", "Master Server ready on port: " + port);
    }

    const env = process.env.NODE_ENV || "production"; //get the enviroment

    var ownPath = fs.realpathSync(".");

	http.createServer(expressApp).listen(port, err => { //well start http instead
	    if (err) {
	        return console.error(err);
	    }
	    ServerAPI.sendToMaster(null, null, `Server running on http://localhost:${port} [${env}]}`);

	});
}
