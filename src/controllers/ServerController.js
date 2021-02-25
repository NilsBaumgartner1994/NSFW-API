import MyExpressRouter from "../module/MyExpressRouter";
import ServerAPI from "../ServerAPI";
import DefaultControllerHelper from "../helper/DefaultControllerHelper";
import SystemInformationSchedule from "../schedules/SystemInformationSchedule";
import BackupController from "./BackupController";

export default class ServerController {

    static AccessControl = "SERVER"

    constructor(logger, models, expressApp, myAccessControl, myExpressRouter, route) {
        this.logger = logger;
        this.models = models;
        this.expressApp = expressApp;
        this.myAccessControl = myAccessControl;
        this.myExpressRouter = myExpressRouter;
        this.route = route;
        this.configureRoutes();
    }

    /**
     * Configure all Routes for the database
     */
    configureRoutes() {
        this.configureRestart();
        //this.configureCrash();
        this.configureGetTime();
        this.configureGetSystemInformations();

        this.backupController = new BackupController(this.logger, this.models, this.expressApp, this.myAccessControl, this.myExpressRouter, this.route+"/backups")
    }

    configureRestart(){
        let instance = this;
        let functionToHandle = async function(req, res){ //define the get function
            let accessControlResource = MyExpressRouter.adminRoutes_accessControlResource;
            let permission = DefaultControllerHelper.handleDefaultPermissionCheck(req, res, this.myAccessControl, accessControlResource, DefaultControllerHelper.CRUD_CREATE, false);
            if (permission.granted) {
                instance.handleTimeRequest(req,res);
                await ServerAPI.restartWorkers();
            }
        }
        let route = this.route + "/restart";
        this.expressApp.get(route, functionToHandle.bind(this)); // register route in express
    }

    configureCrash(){
        let functionToHandle = async function(req, res){ //define the get function
            await ServerAPI.sendToMaster(null, null, "Callback test");
            MyExpressRouter.responseWithSuccessJSON(res, {test: "crash"});
            process.exit(1337);
        }
        let route = this.route + "/crash";
        this.expressApp.get(route, functionToHandle.bind(this)); // register route in express
    }

    configureGetTime(){
        let route = this.route + "/time";
        this.expressApp.get(route, this.handleTimeRequest.bind(this));
    }

    handleTimeRequest(req, res) {
        let startTime = this.myExpressRouter.startTime;
        let answer = {startTime: startTime, currentTime: new Date(), workerId: ServerAPI.getWorkderId()};
        MyExpressRouter.responseWithSuccessJSON(res, answer);
    }

    configureGetSystemInformations(){
        let route = this.route + "/systemInformation";
        this.expressApp.get(route, this.handleSystemInformationGetRequest.bind(this));
    }

    handleSystemInformationGetRequest(req, res) {
        let accessControlResource = MyExpressRouter.adminRoutes_accessControlResource;
        let permission = DefaultControllerHelper.handleDefaultPermissionCheck(req, res, this.myAccessControl, accessControlResource, DefaultControllerHelper.CRUD_READ, false);
        if (permission.granted) { //can read system informations
            let answer = SystemInformationSchedule.allInformations;
            MyExpressRouter.responseWithSuccessJSON(res, answer);
        }
    }


}
