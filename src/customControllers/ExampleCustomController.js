import MyExpressRouter from "../module/MyExpressRouter";

const fetch = require("node-fetch");
const FormData = require('form-data');

export default class ExampleCustomController {

    constructor(logger, models, expressApp, myAccessControl, myExpressRouter,subRoute) {
        this.logger = logger;
        this.models = models;
        this.expressApp = expressApp;
        this.myAccessControl = myAccessControl;
        this.myExpressRouter = myExpressRouter;
        this.subRoute = subRoute;
        this.configureRoutes();
    }

    configureRoutes() {
        this.configureExampleRoute();
    }

    configureExampleRoute(){
        let functionToCall = async function(req, res) { //define the index function
            let dataJSON = {"nice":"nice"};
            MyExpressRouter.responseWithSuccessJSON(res,dataJSON);
        }

        let route = this.subRoute+"/test";
        this.expressApp.get(route, functionToCall.bind(this)); //register route in express
    }


}

