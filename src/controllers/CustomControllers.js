import ExampleCustomController from "../customControllers/ExampleCustomController";

export default class CustomControllers {

    /**
     * ["example"] : ExampleCustomController
     */
    static CONTROLLERS = {
        "example" : ExampleCustomController,
    };

    constructor(logger, models, expressApp, myAccessControl, myExpressRouter, route) {
        this.logger = logger;
        this.models = models;
        this.expressApp = expressApp;
        this.myAccessControl = myAccessControl;
        this.myExpressRouter = myExpressRouter;
        this.route = route;
        this.functionsForModels = {};
        this.configureRoutes();
    }

    configureRoutes() {
        this.instanceControllers = {};
        let subRoutes = Object.keys(CustomControllers.CONTROLLERS);
        for(let i=0; i<subRoutes.length; i++){
            let subRoute = subRoutes[i];
            let controller = CustomControllers.CONTROLLERS[subRoute];
            let controllerRoute = this.route+"/"+subRoute;
            this.instanceControllers[subRoute] = new controller(this.logger, this.models, this.expressApp, this.myAccessControl, this.myExpressRouter,controllerRoute);
        }
    }


}
