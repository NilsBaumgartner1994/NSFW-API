import SequelizeHelper from "./SequelizeHelper";
import MyExpressRouter from "../module/MyExpressRouter";

export default class SequelizeRouteHelper {

    static METHOD_COUNT_PREFIX = "count";

    /**
     * SCHEMES
     */

    static getSchemeRoute(model){
        let tableName = SequelizeHelper.getTableName(model);
        return MyExpressRouter.routeSchemes + "/" + tableName;
    }


    /**
     * MODELS
     */

    // Count Route
    /**
     * Get the Count route for a model
     * @param model the sequelize model
     * @return {string} api uri to the index
     */
    static getCountRoute(model){
        let tableName = SequelizeHelper.getTableName(model);
        return MyExpressRouter.routeModels + "/count/" + tableName;
    }

    // Index Route
    /**
     * Get the Index route for a model
     * @param model the sequelize model
     * @return {string} api uri to the index
     */
    static getIndexRoute(model){
        let tableName = SequelizeHelper.getTableName(model);
        return MyExpressRouter.routeModels + "/" + tableName;
    }

    // Instance Route
    /**
     * Get the GET route for model
     * @param model the sequelize model
     * @return {string} the api uri to the resource
     */
    static getInstanceRoute(model){
        let route = SequelizeRouteHelper.getIndexRoute(model); // get the index route
        route += SequelizeRouteHelper.getModelPrimaryKeyAttributeRoute(model);
        return route;
    }

    /**
     * IMAGES
     */

    static getInstanceImageRoute(model){
        let instanceRoute = SequelizeRouteHelper.getInstanceRoute(model);
        return instanceRoute+"/image";
    }

    /**
     * ASSOCIATIONS
     */

    static getAssociationBaseRoute(model){
        let instanceRoute = SequelizeRouteHelper.getInstanceRoute(model);
        return instanceRoute+"/associations";
    }

    static getAssociationMethodRoute(model,method){
        return SequelizeRouteHelper.getAssociationBaseRoute(model)+"/"+method;
    }


    static getModelAssociationMethodRoute(model,method,modelAssociationName){
        let baseRoute = SequelizeRouteHelper.getAssociationMethodRoute(model,method);
        return baseRoute + "/" + modelAssociationName;
    }

    static getModelAssociationBaseRoute(model,modelAssociationName){
        let baseRoute = SequelizeRouteHelper.getAssociationBaseRoute(model);
        return baseRoute + "/" + modelAssociationName;
    }

    static getModelAssociationInstanceRoute(model,modelAssociationName,accessControlAssociationResource,associationModel){
        let associationIndexRoute = SequelizeRouteHelper.getModelAssociationBaseRoute(model,modelAssociationName);
        let primaryKeyAttributeRoute = SequelizeRouteHelper.getModelPrimaryKeyAttributeRoute(associationModel,accessControlAssociationResource);
        return associationIndexRoute + primaryKeyAttributeRoute;
    }


    /**
     * MODEL FUNCTIONS
     */

    // Count Model

    // Count Associations



    /**
     * HELPER
     */

    /**
     * Get the identifier of the primary key identifier of the model
     * @param model the sequelize model
     * @param primaryKeyAttribute the specific primary key
     * @return {string} a unique composition of modelname and primary key
     */
    static getModelPrimaryKeyAttributeParameter(model,primaryKeyAttribute, reqLocalsKey=null){
        if(!reqLocalsKey){
            reqLocalsKey = SequelizeHelper.getTableName(model)
        }

        //we need the tablename, otherwise it would be ambigous for example UserRoles and UserFriends
        return reqLocalsKey+"_"+primaryKeyAttribute;
    }


    static getModelPrimaryKeyAttributeRoute(model,reqLocalsKey=null){
        let route = "";


        let primaryKeyAttributes = SequelizeHelper.getPrimaryKeyAttributes(model); // lets get all primary keys
        for(let i=0; i<primaryKeyAttributes.length; i++){ //for every primary key
            let primaryKeyAttribute = primaryKeyAttributes[i];
            route+="/:"+SequelizeRouteHelper.getModelPrimaryKeyAttributeParameter(model,primaryKeyAttribute,reqLocalsKey); //we add it to the route
        }
        return route;
    }

    static getModelRoutes(model){
        let getRoute = SequelizeRouteHelper.getInstanceRoute(model); // get the GET route
        let indexRoute = SequelizeRouteHelper.getIndexRoute(model);
        let routes = {
            "GET": getRoute,
            "INDEX": indexRoute
        };
        return routes;
    }

    static getAllModelRoutes(models){
        let allModelRoutes = {};

        let modelList = SequelizeHelper.getModelList(models); //first get all models
        for(let i=0; i<modelList.length; i++) { //for every model
            let model = modelList[i];
            let modelRoutes = SequelizeRouteHelper.getModelRoutes(model);
            let tableName = SequelizeHelper.getTableName(model);
            allModelRoutes[tableName] = modelRoutes;
        }
        return allModelRoutes;
    }

}
