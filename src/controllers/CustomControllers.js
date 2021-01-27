
export default class CustomControllers {

    /**
     * ["example"] : ExampleCustomController
     */
    static CONTROLLERS = {

    };

    /**
     * Adds a custom controller with given subroute
     * @param subRoute desired subRoute /api/custom/subRoute/...
     * @param ControllerClass The Controller Class which will be called with given params
     * @returns {boolean} successfully allowed to add subRoute Controller
     */
    static registerController(subRoute, ControllerClass){
        if(!!CustomControllers.CONTROLLERS[subRoute]){
            return false;
        } else {
            CustomControllers.CONTROLLERS[subRoute] = ControllerClass;
            return true;
        }
    }

    /**
     * Returns a list of all defined subRoutes
     * @returns {string[]}
     */
    static getSubRoutes(){
        return Object.keys(CustomControllers.CONTROLLERS);
    }

    constructor(logger, models, expressApp, myAccessControl, myExpressRouter, route) {
        this.logger = logger;
        this.models = models;
        this.expressApp = expressApp;
        this.myAccessControl = myAccessControl;
        this.myExpressRouter = myExpressRouter;
        this.route = route;
        this.configureRoutes();
    }

    configureRoutes() {
        this.instanceControllers = {};
        let subRoutes = CustomControllers.getSubRoutes();
        for(let i=0; i<subRoutes.length; i++){
            let subRoute = subRoutes[i];
            let controller = CustomControllers.CONTROLLERS[subRoute];
            let controllerRoute = this.route+"/"+subRoute;
            this.instanceControllers[subRoute] = new controller(this.logger, this.models, this.expressApp, this.myAccessControl, this.myExpressRouter,controllerRoute);
        }
    }


}
