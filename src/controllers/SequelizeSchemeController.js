import HttpStatus from "http-status-codes";
import MyExpressRouter from "../module/MyExpressRouter";
import SequelizeHelper from "../helper/SequelizeHelper";
import SequelizeRouteHelper from "../helper/SequelizeRouteHelper";
import DefaultControllerHelper from "../helper/DefaultControllerHelper";
import MyAccessControl from "../module/MyAccessControl";

export default class SequelizeSchemeController {

    constructor(logger, models, expressApp, myAccessControl, myExpressRouter) {
        this.logger = logger;
        this.models = models;
        this.expressApp = expressApp;
        this.myAccessControl = myAccessControl;
        this.myExpressRouter = myExpressRouter;
        this.functionsForModels = {};
        this.configureRoutes();
    }

    configureRoutes() {
        let modelList = SequelizeHelper.getModelList(this.models); //first get all models
        for(let i=0; i<modelList.length; i++) { //for every model
            let model = modelList[i];
            this.configureModelSchemeRoute(model); //configure routes for the model
            this.configureModelSchemeAssociationsRoute(model);
            this.configureModelSchemeRoutesRoute(model);
        }

        this.configureModelSchemesIndex();
    }

    configureModelSchemesIndex(){
        const grants = this.myAccessControl.getGrants();
        const tableNames = SequelizeHelper.getModelTableNames(this.models);
        const allModelRoutes = SequelizeRouteHelper.getAllModelRoutes(this.models);

        let functionForModel = function(req, res){
            let modelsWithPermission = Object.keys(grants[req.locals.currentUser.role]); //all permission groups

            let intersection = [];
            for(let i=0; i<tableNames.length; i++){
                let tableName = tableNames[i];
                let accessControlResource = MyAccessControl.getAccessControlResourceOfTablename(tableName);
                if(modelsWithPermission.includes(accessControlResource)){
                    intersection.push(tableName);
                }
            }
            let allowedModelRoutes = {};
            for(let i=0; i<intersection.length;i++){
                let tableName = intersection[i];
                allowedModelRoutes[tableName] = allModelRoutes[tableName];
            }

            MyExpressRouter.responseWithSuccessJSON(res, allowedModelRoutes);
        }

        this.expressApp.get(MyExpressRouter.routeSchemes, functionForModel.bind(this)); // register route in express
    }

    configureModelSchemeRoute(model){
        let route = SequelizeRouteHelper.getSchemeRoute(model);
        let tableName = SequelizeHelper.getTableName(model);
        let accessControlResource = MyAccessControl.getAccessControlResourceOfTablename(tableName);

        let functionForModel = function(req, res){
            let rawAttributes = SequelizeHelper.getModelAttributes(model);

            let permission = DefaultControllerHelper.getPermission(req,this.myAccessControl,accessControlResource,DefaultControllerHelper.CRUD_READ,false);
            if (permission.granted || true) {
                let fileteredDataJSON = permission.filter(rawAttributes);
                MyExpressRouter.responseWithSuccessJSON(res, fileteredDataJSON);
            } else {
                MyExpressRouter.responseWithErrorJSON(res, HttpStatus.FORBIDDEN, {
                    errorCode: HttpStatus.FORBIDDEN,
                    error: 'Forbidden to read Resource',
                    "scheme": tableName
                });

            }
        }

        this.expressApp.get(route, functionForModel.bind(this)); // register route in express
    }

    configureModelSchemeAssociationsRoute(model){
        let route = SequelizeRouteHelper.getSchemeRoute(model)+"/associations";
        const tableAssociations = SequelizeHelper.getAssociationForModelJSON(model);
        let tableName = SequelizeHelper.getTableName(model);

        const grants = this.myAccessControl.getGrants();
        //console.log("configureModelSchemeAssociationsRoute: route: "+route);

        let functionForModel = function(req, res){
            let modelsWithPermission = Object.keys(grants[req.locals.currentUser.role]);
            console.log(modelsWithPermission);
            let filteredAssociationData = {};

            let modelAssociationNames = Object.keys(tableAssociations);

            for(let j=0; j<modelAssociationNames.length; j++) {
                let modelAssociationName = modelAssociationNames[j];
                let associationObject = tableAssociations[modelAssociationName].options;
                let associationTargetModel = tableAssociations[modelAssociationName].target;

                let accessControlAssociationResource = MyAccessControl.getAccessControlResourceOfAssociation(tableName,modelAssociationName);
                let pluralName = associationObject["name"]["plural"];
                if(modelsWithPermission.includes(accessControlAssociationResource)){
                    filteredAssociationData[modelAssociationName] = {
                        "associationName": modelAssociationName,
                        "target": SequelizeHelper.getTableName(associationTargetModel)
                    }
                }
            }

            MyExpressRouter.responseWithSuccessJSON(res, filteredAssociationData);
        }

        this.expressApp.get(route, functionForModel.bind(this)); // register route in express
    }

    configureModelSchemeRoutesRoute(model){
        let route = SequelizeRouteHelper.getSchemeRoute(model)+"/routes";
        let routes = SequelizeRouteHelper.getModelRoutes(model);

        let functionForModel = function(req, res){
            MyExpressRouter.responseWithSuccessJSON(res, routes);
        }

        this.expressApp.get(route, functionForModel.bind(this)); // register route in express
    }



}
