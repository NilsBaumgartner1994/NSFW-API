import HttpStatus from "http-status-codes";
import MyExpressRouter from "../module/MyExpressRouter";
import SequelizeHelper from "../helper/SequelizeHelper";
import SequelizeRouteHelper from "../helper/SequelizeRouteHelper";
import SequelizeController from "./SequelizeController";
import DefaultControllerHelper from "../helper/DefaultControllerHelper";
import MyAccessControl from "../module/MyAccessControl";

export default class SequelizeAssociationController {

    // api/models/Users/1/associations/Roles
    // api/models/Users/1/associations/Role/2
    // api/models/Users/1/associations/count/Roles


    constructor(logger, models, expressApp, myAccessControl, myExpressRouter) {
        this.logger = logger;
        this.models = models;
        this.expressApp = expressApp;
        this.myAccessControl = myAccessControl;
        this.myExpressRouter = myExpressRouter;
        this.functionsForModels = {};
    }

    static getForAllModelsAllAccessControlAssociationResources(models){
        let modelList = SequelizeHelper.getModelList(models); //first get all models
        let allAccessControlAssociations = [];
        for(let i=0; i<modelList.length; i++) { //for every model
            let model = modelList[i];
            allAccessControlAssociations = allAccessControlAssociations.concat(SequelizeAssociationController.getAccessControlAssociationResourcesForModel(model));
        }
        return allAccessControlAssociations;
    }

    static getAccessControlAssociationResourcesForModel(model){
        let accessControlAssociationResources = [];

        let tableName = SequelizeHelper.getTableName(model);
        let modelAssociationNames = SequelizeAssociationController.getModelAssociationNames(model);
        for(let j=0; j<modelAssociationNames.length; j++) {
            let modelAssociationName = modelAssociationNames[j];
            let accessControlAssociationResource = MyAccessControl.getAccessControlResourceOfAssociation(tableName,modelAssociationName);
            accessControlAssociationResources = accessControlAssociationResources.concat(accessControlAssociationResource);
        }
        return accessControlAssociationResources;
    }

    static getModelAssociationNames(model){
        let tableAssociations = SequelizeHelper.getAssociationForModelJSON(model);
        return Object.keys(tableAssociations);
    }

    configureModelAssociationRoutes(model,sequelizeController){
        let tableAssociations = SequelizeHelper.getAssociationForModelJSON(model);
        let tableName = SequelizeHelper.getTableName(model);
        //console.log("Configure Associations for: "+tableName);

        let modelAssociationNames = SequelizeAssociationController.getModelAssociationNames(model);

        for(let j=0; j<modelAssociationNames.length; j++){
            let modelAssociationName = modelAssociationNames[j];
            let associationObject = tableAssociations[modelAssociationName].options;
            let associationTargetModel = tableAssociations[modelAssociationName].target;
            let pluralName = associationObject["name"]["plural"];
            let singularName = associationObject["name"]["singular"];

            //console.log("  configuring association to: "+modelAssociationName + " as ("+SequelizeHelper.getTableName(associationTargetModel)+")");

            let hasManyAssociated = pluralName === modelAssociationName;

            let accessControlAssociationResource = MyAccessControl.getAccessControlResourceOfAssociation(tableName,modelAssociationName);

            if(hasManyAssociated){ // e.G. User has many Feedbacks
                //configure the params for identifing the associated resource
                SequelizeController.configurePrimaryParamsChecker(this.expressApp,associationTargetModel,accessControlAssociationResource);

                // GET /Users/1/associations/count/Feedbacks
                this.configureMultipleAssociationCountRoute(model,pluralName,modelAssociationName);

                // GET /Users/1/associations/Feedbacks ==> Get List of all Feedbacks
                this.configureMultipleAssociationsIndexRoute(model,modelAssociationName,associationTargetModel,accessControlAssociationResource);

                // TODO POST /Users/1/associations/Feedbacks ==> Add List of all Feedbacks
                // TODO PUT /Users/1/associations/Feedbacks ==> Replace List of all Feedbacks
                // TODO DELETE /Users/1/associations/Feedbacks ==> Clear List of all Feedbacks

                // GET /Users/1/associations/Feedbacks/3 ==> Get single specific Feedback
                this.configureMultipleAssociationsGetSpecificRoute(model,modelAssociationName,associationTargetModel,accessControlAssociationResource);

                // POST /Users/1/associations/Feedbacks/3 ==> Add Association Feedback to specific
                this.configureMultipleAssociationsAddSpecificRoute(model,modelAssociationName,associationTargetModel,accessControlAssociationResource,singularName);

                // DELETE /Users/1/associations/Feedbacks/3 ==> Remove Association to Feedback
                this.configureMultipleAssociationsRemoveSpecificRoute(model,modelAssociationName,associationTargetModel,accessControlAssociationResource,singularName);
            } else {
                SequelizeController.configurePrimaryParamsChecker(this.expressApp,associationTargetModel,accessControlAssociationResource);

                // Method does not exist --> Not implemented GET /Users/1/associations/count/Feedback

                // GET /Users/1/associations/Feedback ==> Get single Feedback
                this.configureSingleAssociationGetRoute(model, singularName, modelAssociationName,accessControlAssociationResource);

                //check if there is an old association, if yes than deny, should use PUT
                // TODO POST /Users/1/associations/Feedback ==> Add Association Feedback

                // POST /Users/1/associations/Feedback/3 ==> Add Association Feedback to specific
                this.configureSingleAssociationSetRoute(model, singularName, modelAssociationName,accessControlAssociationResource,associationTargetModel);

                // TODO PUT /Users/1/associations/Feedback/3 ==> Replace Association Feedback to specific

                // DELETE /Users/1/associations/Feedback ==> Remove Association to Feedback
                this.configureSingleAssociationRemoveRoute(model, singularName, modelAssociationName,accessControlAssociationResource);
                //this.configureSingleAssociationRemoveRoute(model,modelAssociationName,associationTargetModel,accessControlAssociationResource);
            }
        }
    }



    configureMultipleAssociationCountRoute(model, pluralName, modelAssociationName){
        let methodName = SequelizeRouteHelper.METHOD_COUNT_PREFIX;

        let associationFunction = methodName+modelAssociationName;
        let tableName = SequelizeHelper.getTableName(model);
        let accessControlResource = MyAccessControl.getAccessControlResourceOfTablename(tableName);

        //console.log("Configure Count Associtation: "+tableName+" "+associationFunction+" ");
        let functionForModel = async function(req, res){ //define the get function

            //TODO Permission

            let resource = req.locals[accessControlResource];
            let amount = await resource[associationFunction]();
            let dataJSON = {
                count: amount
            };
            MyExpressRouter.responseWithSuccessJSON(res, dataJSON);
        }

        let associationRoute = SequelizeRouteHelper.getModelAssociationMethodRoute(model,methodName,modelAssociationName);
        this.expressApp.get(associationRoute, functionForModel.bind(this)); // register route in express

    }

    configureMultipleAssociationsIndexRoute(model,modelAssociationName,associationModel,accessControlAssociationResource){
        let associationFunction = "get"+modelAssociationName;
        let functionForModel = async function(req, res){ //define the get function
            //TODO maybe use: DefaultControllerHelper.handleAssociationIndex
            let resource = req.locals[accessControlAssociationResource];
            this.myExpressRouter.defaultControllerHelper.handleAssociationIndex(req,res,resource,this.myAccessControl,accessControlAssociationResource,modelAssociationName,associationFunction,false)
        }

        let associationRoute = SequelizeRouteHelper.getModelAssociationBaseRoute(model,modelAssociationName);
        //console.log("Association Route: "+associationRoute);
        this.expressApp.get(associationRoute, functionForModel.bind(this)); // register route in express

    }


    configureMultipleAssociationsGetSpecificRoute(model,modelAssociationName,associationModel,accessControlAssociationResource){
        //console.log("configure association route: configureMultipleAssociationsGetSpecificRoute");

        let functionForModel = async function(req, res) { //define the get function
            //just call the default GET
            this.myExpressRouter.defaultControllerHelper.handleGet(req, res, this.myAccessControl, accessControlAssociationResource);
        }

        let route = SequelizeRouteHelper.getModelAssociationInstanceRoute(model,modelAssociationName,accessControlAssociationResource,associationModel);
        //console.log("Association Route: "+route);
        this.expressApp.get(route, functionForModel.bind(this)); // register route in express
    }


    configureMultipleAssociationsRemoveSpecificRoute(model,modelAssociationName,associationModel,accessControlAssociationResource,singularName) {
        //console.log("configure association route: configureMultipleAssociationsGetSpecificRoute");
        let tableName = SequelizeHelper.getTableName(model);
        let accessControlResource = MyAccessControl.getAccessControlResourceOfTablename(tableName);
        let associatedTableName = SequelizeHelper.getTableName(associationModel);

        let functionForModel = async function (req, res) { //define the get function
            //just call the default GET
            let permission = DefaultControllerHelper.getPermission(req,this.myAccessControl,accessControlAssociationResource,DefaultControllerHelper.CRUD_DELETE,false);
            if(permission.granted){
                let resource = req.locals[accessControlResource];
                let associatedResource = req.locals[accessControlAssociationResource];

                let isAssociated = await resource["has"+singularName](associatedResource);
                //console.log(isAssociated);
                if(isAssociated){
                    resource["remove"+singularName](associatedResource).then(success => {
                        DefaultControllerHelper.respondWithDeleteMessage(req, res);
                    }).catch(err => {
                        DefaultControllerHelper.respondWithInternalErrorMessage(req,res,err);
                    });
                } else {
                    MyExpressRouter.responseWithErrorJSON(res, HttpStatus.NOT_FOUND, { //response with error
                        error: 'No Resource found',
                        model: modelAssociationName,
                    });
                    return;
                }
            } else {
                DefaultControllerHelper.respondWithForbiddenMessage(req,res,"Delete "+accessControlAssociationResource);
            }

        }

        let route = SequelizeRouteHelper.getModelAssociationInstanceRoute(model, modelAssociationName, accessControlAssociationResource, associationModel);
        //console.log("Association Route: " + route);
        this.expressApp.delete(route, functionForModel.bind(this)); // register route in express
    }

    configureMultipleAssociationsAddSpecificRoute(model,modelAssociationName,associationModel,accessControlAssociationResource,singularName) {
        //console.log("configure association route: configureMultipleAssociationsAddSpecificRoute");
        let tableName = SequelizeHelper.getTableName(model);
        let accessControlResource = MyAccessControl.getAccessControlResourceOfTablename(tableName);
        let associatedTableName = SequelizeHelper.getTableName(associationModel);

        let functionForModel = async function (req, res) { //define the get function
            //just call the default GET
            let permission = DefaultControllerHelper.getPermission(req,this.myAccessControl,accessControlAssociationResource,DefaultControllerHelper.CRUD_CREATE,false);
            if(permission.granted){
                let resource = req.locals[accessControlResource];
                let associatedResource = req.locals[accessControlAssociationResource];

                let isAssociated = await resource["has"+singularName](associatedResource);
                //console.log(isAssociated);
                if(!isAssociated){
                    resource["add"+singularName](associatedResource).then(success => {
                        DefaultControllerHelper.respondWithSuccessMessage(req, res); //TODO better response ? Maybe handleGet ?
                    }).catch(err => {
                        DefaultControllerHelper.respondWithInternalErrorMessage(req,res,err);
                    });
                }
            } else {
                DefaultControllerHelper.respondWithForbiddenMessage(req,res,"Add "+accessControlAssociationResource);
            }

        }

        let route = SequelizeRouteHelper.getModelAssociationInstanceRoute(model, modelAssociationName, accessControlAssociationResource, associationModel);
        //console.log("Association Route: " + route);
        this.expressApp.post(route, functionForModel.bind(this)); // register route in express
    }


    /**
     * Single Resource
     */
    configureSingleAssociationGetRoute(model, singularName, modelAssociationName, accessControlAssociationResource){
        let methodName = "get";

        let associationFunction = methodName+modelAssociationName;
        let tableName = SequelizeHelper.getTableName(model);
        let accessControlResource = MyAccessControl.getAccessControlResourceOfTablename(tableName);

        //console.log("Configure Get Associtation: "+tableName+" "+associationFunction+" ");
        let functionForModel = async function(req, res){ //define the get function

            //TODO Permission
           // console.log("handle SingleAssociationGetRoute");

            let resource = req.locals[accessControlResource];
            let associationResource = await resource[associationFunction]();
            if(!!associationResource) {
                req.locals[accessControlAssociationResource] = associationResource; //save the found resource
                await DefaultControllerHelper.setOwningState(req, accessControlAssociationResource);
                this.myExpressRouter.defaultControllerHelper.handleGet(req, res, this.myAccessControl, accessControlAssociationResource);
                return;
            } else {
                MyExpressRouter.responseWithErrorJSON(res, HttpStatus.NOT_FOUND, { //response with error
                    error: 'No Resource found',
                    model: modelAssociationName,
                });
                return;
            }
        }

        let associationRoute = SequelizeRouteHelper.getModelAssociationBaseRoute(model,modelAssociationName);
        //console.log("configureSingleAssociationGetRoute: "+associationRoute);
        this.expressApp.get(associationRoute, functionForModel.bind(this)); // register route in express
    }

    configureSingleAssociationRemoveRoute(model, singularName, modelAssociationName, accessControlAssociationResource){
        let tableName = SequelizeHelper.getTableName(model);
        let accessControlResource = MyAccessControl.getAccessControlResourceOfTablename(tableName);

        //console.log("Configure remove Associtation: "+tableName);
        let functionForModel = async function(req, res){ //define the get function
            //console.log("handle SingleAssociationRemoveRoute")
            let permission = DefaultControllerHelper.getPermission(req,this.myAccessControl,accessControlAssociationResource,DefaultControllerHelper.CRUD_DELETE,false);
            if(permission.granted){
                //console.log("Permission granted");
                let resource = req.locals[accessControlResource];
                let isAssociated = await resource["set"+singularName](null);
                //console.log(isAssociated);
                //console.log("Maybe that not correct ?");
                if(isAssociated){
                    DefaultControllerHelper.respondWithDeleteMessage(req, res);
                } else {
                    MyExpressRouter.responseWithErrorJSON(res, HttpStatus.NOT_FOUND, { //response with error
                        error: 'No Resource found',
                        model: modelAssociationName,
                    });
                    return;
                }
            } else {
                DefaultControllerHelper.respondWithForbiddenMessage(req,res,"Delete "+accessControlAssociationResource);
            }
        }

        let associationRoute = SequelizeRouteHelper.getModelAssociationBaseRoute(model,modelAssociationName);
        this.expressApp.delete(associationRoute, functionForModel.bind(this)); // register route in express
    }

    configureSingleAssociationSetRoute(model, singularName, modelAssociationName, accessControlAssociationResource,associationModel){
        let tableName = SequelizeHelper.getTableName(model);
        let accessControlResource = MyAccessControl.getAccessControlResourceOfTablename(tableName);

        let methodName = "get";
        let associationFunction = methodName+modelAssociationName;

        //console.log("Configure set Associtation: "+tableName);
        let functionForModel = async function(req, res){ //define the get function

            let permission = DefaultControllerHelper.getPermission(req,this.myAccessControl,accessControlAssociationResource,DefaultControllerHelper.CRUD_CREATE,false);
            if(permission.granted){
                let resource = req.locals[accessControlResource];

                let currentAssociationResource = await resource[associationFunction]();
                if(!!currentAssociationResource){
                    DefaultControllerHelper.respondWithForbiddenMessage(req,res,"Create "+accessControlAssociationResource+" Unassociate first or use PUT to override");
                    return;
                } else {
                    let newAssociationResource = req.locals[accessControlAssociationResource];
                    let isAssociated = await resource["set"+singularName](newAssociationResource);
                    if(isAssociated){
                        DefaultControllerHelper.respondWithSuccessMessage(req, res); //TODO better response ? Maybe handleGet ?
                    } else {
                        MyExpressRouter.responseWithErrorJSON(res, HttpStatus.NOT_FOUND, { //response with error
                            error: 'No Resource found',
                            model: modelAssociationName,
                        });
                        return;
                    }
                }
            } else {
                DefaultControllerHelper.respondWithForbiddenMessage(req,res,"Create "+accessControlAssociationResource);
            }
        }

        let associationRoute = SequelizeRouteHelper.getModelAssociationInstanceRoute(model,modelAssociationName,accessControlAssociationResource,associationModel)
        this.expressApp.post(associationRoute, functionForModel.bind(this)); // register route in express
    }

}
