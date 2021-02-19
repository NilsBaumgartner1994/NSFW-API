import MyExpressRouter from "../module/MyExpressRouter";
import ServerAPI from "../ServerAPI";
import DefaultControllerHelper from "../helper/DefaultControllerHelper";

export default class ServerController {

    static AccessControl = "SERVER"
    static AccessControl_Restart = ServerController.AccessControl+"_"+"Restart";

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
    }

    handleFinishRestart(res){
        return () => {return "Hallo"};
    }

    configureRestart(){
        let functionToHandle = async function(req, res){ //define the get function
            let accessControlResource = ServerController.AccessControl_Restart;
            let permission = DefaultControllerHelper.handleDefaultPermissionCheck(res, res, this.myAccessControl, accessControlResource, DefaultControllerHelper.CRUD_CREATE, false);
            if (permission.granted) {
                MyExpressRouter.responseWithSuccessJSON(res, {"currentTime": new Date()});
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


}
