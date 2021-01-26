import HttpStatus from "http-status-codes";
import MyExpressRouter from "../module/MyExpressRouter";
import SequelizeHelper from "../helper/SequelizeHelper";
import SequelizeRouteHelper from "../helper/SequelizeRouteHelper";
import SequelizeAssociationController from "./SequelizeAssociationController";
import DefaultControllerHelper from "../helper/DefaultControllerHelper";

export default class SequelizeController {

    constructor(logger, models, expressApp, myAccessControl, myExpressRouter) {
        this.logger = logger;
        this.models = models;
        this.expressApp = expressApp;
        this.myAccessControl = myAccessControl;
        this.myExpressRouter = myExpressRouter;
        this.associationController = new SequelizeAssociationController(logger, models, expressApp, myAccessControl, myExpressRouter);
        this.configureRoutes();
    }

    /**
     * Configure all Routes for the database
     */
    configureRoutes() {
        let modelList = SequelizeHelper.getModelList(this.models); //first get all models
        for(let i=0; i<modelList.length; i++) { //for every model
            let model = modelList[i];

            this.configureModelRoutes(model); //configure routes for the model
            this.associationController.configureModelAssociationRoutes(model);
            //console.log("");
        }
    }

    /**
     * Configure all routes for a model
     * @param model the given sequelize moodel
     */
    configureModelRoutes(model){
        this.configureCount(model); //configure the index route
        this.configureIndex(model); //configure the index route
        this.configureGet(model); //configure the get route
        this.configureDelete(model);
        this.configureUpdate(model);
        this.configureCreate(model);
        SequelizeController.configurePrimaryParamsChecker(this.expressApp,model); //configure the params for identifing the resource
    }

    configureCount(model){
        let tableName = SequelizeHelper.getTableName(model);

        let functionForModel = function(req, res) { //define the index function
            //just call the default index
            this.myExpressRouter.defaultControllerHelper.handleCount(req, res, model, this.myAccessControl, tableName);
        }

        let route = SequelizeRouteHelper.getCountRoute(model); //get the index route
        this.expressApp.get(route, functionForModel.bind(this)); //register route in express

    }

    /**
     * Configure the Index Route for a model
     * @param model the sequelize model
     */
    configureIndex(model){
        let tableName = SequelizeHelper.getTableName(model);

        let functionForModel = function(req, res) { //define the index function
            //just call the default index
            this.myExpressRouter.defaultControllerHelper.handleIndex(req, res, model, this.myAccessControl, tableName);
        }

        let route = SequelizeRouteHelper.getIndexRoute(model); //get the index route
        this.expressApp.get(route, functionForModel.bind(this)); //register route in express
    }

    /**
     * Configure the Create Route for a model
     * @param model the sequelize model
     */
    configureCreate(model){
        let tableName = SequelizeHelper.getTableName(model);

        let functionForModel = async function(req, res) { //define the index function
            let isOwn = false;

            try{
                let modelForOwnTest = model.build(req.body); //play as everything would be allowed
                await DefaultControllerHelper.setOwningStateForResource(req,tableName,modelForOwnTest)
            } catch(err){
                console.log("If the error is isOwn is not found, then ignore"); //TODO remove after testing
                console.log(err);
            }
            //console.log("Handle Create");

            //get the allowed attributes to change
            //console.log("passed req");
            //console.log(req);
            let allowedAttributes = DefaultControllerHelper.getFilteredReqBodyByPermission(req,this.myAccessControl,tableName,DefaultControllerHelper.CRUD_CREATE,isOwn);
            let sequelizeResource = model.build(allowedAttributes); //build model with allowed attributes
            //console.log(sequelizeResource);

            //create them
            this.myExpressRouter.defaultControllerHelper.handleCreate(req, res, sequelizeResource, this.myAccessControl, tableName);
        }

        let route = SequelizeRouteHelper.getIndexRoute(model); //get the index route
        this.expressApp.post(route, functionForModel.bind(this)); //register route in express
    }

    /**
     * Configure the GET Route for a model
     * @param model the sequelize model
     */
    configureGet(model){
        let tableName = SequelizeHelper.getTableName(model);

        let functionForModel = function(req, res){ //define the get function
            //just call the default GET
            this.myExpressRouter.defaultControllerHelper.handleGet(req, res, this.myAccessControl, tableName);
        }

        let route = SequelizeRouteHelper.getInstanceRoute(model); // get the GET route
        //console.log(route);
        this.expressApp.get(route, functionForModel.bind(this)); // register route in express
    }

    /**
     * Configure the DELETE Route for a model
     * @param model the sequelize model
     */
    configureDelete(model){
        let tableName = SequelizeHelper.getTableName(model);

        let functionForModel = function(req, res){ //define the get function
            //just call the default DELETE
            this.myExpressRouter.defaultControllerHelper.handleDelete(req, res, this.myAccessControl, tableName);
        }

        let route = SequelizeRouteHelper.getInstanceRoute(model); // get the GET route
        this.expressApp.delete(route, functionForModel.bind(this)); // register route in express
    }

    /**
     * Configure the Update Route for a model
     * @param model the sequelize model
     */
    configureUpdate(model){
        let tableName = SequelizeHelper.getTableName(model);

        let functionForModel = function(req, res){ //define the get function
            //just call the default UPDATE
            this.myExpressRouter.defaultControllerHelper.handleUpdate(req, res, this.myAccessControl, tableName);
        }

        let route = SequelizeRouteHelper.getInstanceRoute(model); // get the GET route
        this.expressApp.put(route, functionForModel.bind(this)); // register route in express
    }

    /**
     * Configure the primary params checker
     * @param model the sequelize model
     * @param reqLocalsKey the key the found resource will be saved in req.locals
     */
    static configurePrimaryParamsChecker(expressApp, model, reqLocalsKey = null){
        let primaryKeyAttributes = SequelizeHelper.getPrimaryKeyAttributes(model); // get primary key attributes
        for(let i=0; i<primaryKeyAttributes.length; i++){ //for every primary key
            let primaryKeyAttribute = primaryKeyAttributes[i];
            SequelizeController.configurePrimaryParamChecker(expressApp, model,primaryKeyAttribute, reqLocalsKey); //configure param checker
            //console.log("configurePrimaryParamsChecker: reqLocalsKey: "+reqLocalsKey);
        }
    }

    /**
     * Configure a primary param checker
     * @param model
     * @param reqLocalsKey the key the found resource will be saved in req.locals
     * @param primaryKeyAttribute
     */
    static configurePrimaryParamChecker(expressApp, model, primaryKeyAttribute, reqLocalsKey = null){
        // get the identifier
        let modelPrimaryKeyAttributeParameter = SequelizeRouteHelper.getModelPrimaryKeyAttributeParameter(model,primaryKeyAttribute,reqLocalsKey);
        // link identifier to paramchecker
        expressApp.param(modelPrimaryKeyAttributeParameter, SequelizeController.paramPrimaryParamChecker.bind(this,primaryKeyAttribute,reqLocalsKey,model));
    }

    /**
     * Primary param checker
     * @param primaryKeyAttribute the key attribute name
     * @param reqLocalsKey the key the found resource will be saved in req.locals
     * @param model the sequelize model
     * @param req the request
     * @param res the response
     * @param next the next middleware
     * @param primaryKeyAttributeValue the primary key value to check
     */
    static paramPrimaryParamChecker(primaryKeyAttribute, reqLocalsKey = null, model, req, res, next, primaryKeyAttributeValue) {
        let tableName = SequelizeHelper.getTableName(model);
        if(!reqLocalsKey){
            reqLocalsKey = tableName
        }

        // define a search clause for the model
        let searchJSON = req.locals.searchJSON || {}; // get or init
        let modelSearchJSON = searchJSON[reqLocalsKey] || {}; // get for model
        modelSearchJSON[primaryKeyAttribute] = primaryKeyAttributeValue; // set search param
        searchJSON[reqLocalsKey] = modelSearchJSON; // save for model
        req.locals.searchJSON = searchJSON; // save in locals for later use

        //we search for all, since there are maybe multiple primary keys
        model.findAll({where: modelSearchJSON}).then(async resources => {
            if(!resources || resources.length === 0){ //if no resources found
                MyExpressRouter.responseWithErrorJSON(res, HttpStatus.NOT_FOUND, { //response with error
                    error: 'No Resource found',
                    model: tableName,
                    key: primaryKeyAttribute,
                    value: primaryKeyAttributeValue
                });
                return;
            } else { // resource was found
                if(resources.length===1){ //exactly one was found
                    req.locals[reqLocalsKey] = resources[0]; //save the found resource
                    await DefaultControllerHelper.setOwningState(req,reqLocalsKey);
                }
                next();
            }
        }).catch(err => { //handle error
            //console.log("[SequelizeController] paramPrimaryParamChecker - " + err.toString());
            MyExpressRouter.responseWithErrorJSON(res, HttpStatus.INTERNAL_SERVER_ERROR, {message:err.toString()});
        });
    };

}
