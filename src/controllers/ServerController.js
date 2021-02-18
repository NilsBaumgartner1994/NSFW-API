import MyExpressRouter from "../module/MyExpressRouter";
import ServerAPI from "../ServerAPI";
import * as cluster from "cluster";

export default class ServerController {

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
    }

    configureRestart(){
        let functionToHandle = async function(req, res){ //define the get function
            await ServerAPI.sendToMaster(null, ServerAPI.MESSAGE_TYPE_COMMAND, "Happy Restart");
            MyExpressRouter.responseWithSuccessJSON(res, {test: "pending"});
        }
        let route = this.route + "/restart";
        this.expressApp.get(route, functionToHandle.bind(this)); // register route in express
    }


}
