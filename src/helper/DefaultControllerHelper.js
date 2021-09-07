import HttpStatus from "http-status-codes";
import MyExpressRouter from "../module/MyExpressRouter";

const { Op } = require('sequelize');

const {
    performance
} = require('perf_hooks');


const redisCacheTime = 2 * 60; //Amount of Seconds often requests will use the cache before accessing the database

/**
 * The DefaultControllerHelper provides the default CRUD Functions for Resources. It also provides some default permisssion filtering functions. This class is mostly used by all controllers
 */
export default class DefaultControllerHelper {

    static HOOK_BEFORE = "before";
    static HOOK_AFTER = "after";

    static hooks = {};

    static addHook(tablename, method, callbackFunction, before=true){
        let hookStage = before ? DefaultControllerHelper.HOOK_BEFORE : DefaultControllerHelper.HOOK_AFTER;

        let hooksForTablename = DefaultControllerHelper.hooks[tablename] || {};
        let hooksForMethod = hooksForTablename[method] || {};
        let hooksForStage = hooksForMethod[hookStage] || [];
        hooksForStage.push(callbackFunction);
        hooksForMethod[hookStage] = hooksForStage;
        hooksForTablename[method] = hooksForMethod;
        DefaultControllerHelper.hooks[tablename] = hooksForTablename;
    }

    static getHookFunctions(tablename, method, before=true){
        let hookStage = before ? DefaultControllerHelper.HOOK_BEFORE : DefaultControllerHelper.HOOK_AFTER;
        try{
            if(!!tablename && !!method){
                return DefaultControllerHelper.hooks[tablename][method][hookStage] || [];
            }
            return [];
        } catch (e){
            return [];
        }
    }

    static async executeHookFunctions(req, res, resource, tablename, method, before){
        console.log("executeHookFunctions: | tablename: "+tablename+" | method: "+method+" | before: "+before)
        //TODO Give possibility to block a request, "this action is blocked by a hook"
        let callbackFunctions = DefaultControllerHelper.getHookFunctions(tablename,method,before);
        console.log("Found "+callbackFunctions.length+" hooks");

        let allowedAction = true;
        for(let i=0; i<callbackFunctions.length && allowedAction; i++){
            let callbackFunction = callbackFunctions[i];
            let allowedActionFromCallback = await callbackFunction(resource, req, res);
            if(allowedActionFromCallback!==undefined && allowedActionFromCallback !== null){
                allowedAction = allowedActionFromCallback;
            }
        }
        return allowedAction;
    }

    static CRUD_CREATE = "CREATE";
    static CRUD_READ = "READ";
    static CRUD_UPDATE = "UPDATE";
    static CRUD_DELETE = "DELETE";

    /**
     * The Constructor of the DefaultControllerHelper
     * @param logger The Logger informations will be send to
     * @param models The models of the Database
     * @param myExpressRouter The ExpressRouter Wrapper
     */
    constructor(logger, models, myExpressRouter) {
        this.logger = logger;
        this.models = models;
        this.myExpressRouter = myExpressRouter;
    }

    /**
     * Since there exists a TableUpdateTimes Table which records the dates at which other tables where updated at, this function helps to update the entry for a given table.
     * @param tableName The table name which should be known to be updated
     * @param models The models
     * @param logger The logger which will be used to log
     * @returns {Promise<void>}
     */
    static async updateTableUpdateTimesByTableNameAndModels(tableName, models, logger) {
        try {
            let resource = await models.TableUpdateTimes.findOne({where: {tableName: tableName}}); //find the table
            if (!!resource) { //if unkown tablename in tableupdatetimes
                resource.changed('updatedAt', true);
                resource.save();
            } else {
                resource = models.TableUpdateTimes.build({tableName: tableName}); //create it
                await resource.save(); //save it
            }
        } catch (err) {
            logger.error("[DefaultControllerHelper] updateTableUpdateTimes - " + err.toString());
        }
    }


    /**
     * Get a Sequelize Resource as JSON
     * @param resource the sequelize resource
     * @returns {*}
     */
    static getResourceAsJSON(resource){
        return resource.get({plain: true});
    }

    /**
     * Filter List of Resources. Remove Attributes which are not permitted by the permission
     * @param resources List of Resources
     * @param permission The permission
     * @returns [{*}] List of Json object of the filtered resources
     */
    static filterResourcesWithPermission(resources, permission) {
        let dataJSON = resources.map((resource) => //for every item
            DefaultControllerHelper.filterResourceWithPermission(resource, permission)); //lets filter them
        return dataJSON;
    }

    /**
     * Filter single Resource. Remove Attributes which are not permitted by the permission
     * @param resource The resource
     * @param permission The permission
     * @returns {*} JSOB Object with filtered attributes
     */
    static filterResourceWithPermission(resource, permission) {
        let dataJSON = permission.filter(DefaultControllerHelper.getResourceAsJSON(resource)); //get the json resource, then filter
        return dataJSON;
    }

    /**
     * Filter List of Resources and Respond to a Request With a Success.
     * @param req The request object
     * @param res The response object
     * @param resources The list of resources
     * @param permission The permission
     */
    static respondWithPermissionFilteredResources(req, res, resources, permission) {
        let fileteredDataJSON = DefaultControllerHelper.filterResourcesWithPermission(resources, permission); //filter data
        MyExpressRouter.responseWithSuccessJSON(res, fileteredDataJSON);
    }

    /**
     * Filter a single Resources and Respond to a Request With a Success.
     * @param req The request object
     * @param res The response object
     * @param resource The resource
     * @param permission The permission
     */
    static respondWithPermissionFilteredResource(req, res, resource, permission) {
        let fileteredDataJSON = DefaultControllerHelper.filterResourceWithPermission(resource, permission); //filter data
        MyExpressRouter.responseWithSuccessJSON(res, fileteredDataJSON);
    }

    /**
     * Response a Request with the default Message for a deletion of a resource
     * @param req The request object
     * @param res The response object
     */
    static respondWithDeleteMessage(req, res) {
        DefaultControllerHelper.respondWithSuccessMessage(req, res);
    }

    /**
     * Response a Request with the default Message for a success
     * @param req The request object
     * @param res The response object
     */
    static respondWithSuccessMessage(req, res) {
        MyExpressRouter.responseWithSuccessJSON(res, null);
    }

    /**
     * Response a Request with the default Message for a deletion of a resource
     * @param req The request object
     * @param res The response object
     */
    static respondWithInternalErrorMessage(res, err) {
        MyExpressRouter.responseWithErrorJSON(res, HttpStatus.INTERNAL_SERVER_ERROR, {
            errorCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: err.toString()
        });
    }

    static respondWithForbiddenMessage(req,res,reason){
        MyExpressRouter.responseWithErrorJSON(res, HttpStatus.FORBIDDEN, {
            errorCode: HttpStatus.FORBIDDEN,
            error: 'Forbidden: ' + reason
        });
    }

    /**
     *
     * @param sequelizeModel
     * @param updateTableUpdateTimes
     * @returns {Promise<void>}
     */
    async updateTableUpdateTimes(sequelizeModel, updateTableUpdateTimes) {
        if (updateTableUpdateTimes) { //if we should update the table update times
            let tableName = sequelizeModel.name; //get the table name of the model
            await this.updateTableUpdateTimesByTableName(tableName); //update
        }
    }

    /**
     * Update the the table name in table update times
     * @param tableName The tablename
     * @returns {Promise<void>}
     */
    async updateTableUpdateTimesByTableName(tableName) {
        await DefaultControllerHelper.updateTableUpdateTimesByTableNameAndModels(tableName, this.models, this.logger);
    }

    /**
     * Parse Operators if content is provided
     * TODO write documentation for this: example ... streamviews?createdAt={"gte":"2020-06-05T08:19:31.000Z"}
     * https://sequelize.org/v5/manual/querying.html#operators-aliases
     *
     $eq: Op.eq,
     $ne: Op.ne,
     $gte: Op.gte,
     $gt: Op.gt,
     $lte: Op.lte,
     $lt: Op.lt,
     $not: Op.not,
     $in: Op.in,
     $notIn: Op.notIn,
     $is: Op.is,
     $like: Op.like,
     $notLike: Op.notLike,
     $iLike: Op.iLike,
     $notILike: Op.notILike,
     $regexp: Op.regexp,
     $notRegexp: Op.notRegexp,
     $iRegexp: Op.iRegexp,
     $notIRegexp: Op.notIRegexp,
     $between: Op.between,
     $notBetween: Op.notBetween,
     $overlap: Op.overlap,
     $contains: Op.contains,
     $contained: Op.contained,
     $adjacent: Op.adjacent,
     $strictLeft: Op.strictLeft,
     $strictRight: Op.strictRight,
     $noExtendRight: Op.noExtendRight,
     $noExtendLeft: Op.noExtendLeft,
     $and: Op.and,
     $or: Op.or,
     $any: Op.any,
     $all: Op.all,
     $values: Op.values,
     $col: Op.col
     */
    parseOperatorContent(queryFiltered){
        //console.log("parseOperatorContent");
        //console.log(Object.keys(Op));

        let queryFilteredKeys = Object.keys(queryFiltered); //for all available keys
        for(let i=0; i<queryFilteredKeys.length;i++){
            let key = queryFilteredKeys[i]; //get key like "id"
            let content = queryFiltered[key];
            if(!!content && typeof content === "object"){ //check if we have search params
                let parsedContent = content //well then parse it
		        let operatorKeys = Object.keys(parsedContent); //get all keys like: greater than: gte
                for(let j=0; j<operatorKeys.length; j++){ //for all operators
                    let operator = operatorKeys[i];
                    if(!!Op[operator]){
                        parsedContent[Op[operator]] = parsedContent[operator]; //replace specific operator
                        delete parsedContent[operator]; //delete old string "operator"
                    }
                }
                queryFiltered[key] = parsedContent; //save
            }
        }
        return queryFiltered;
    }


    /**
     * Routes
     */

    getSequelizeQuery(req,permission,includeModels){
        let queryCopy = JSON.parse(JSON.stringify(req.query)); //create a copy on that we work
        delete queryCopy.limit;
        delete queryCopy.attributes;
        delete queryCopy.offset;
        delete queryCopy.order;
        let params = req.query.params || "{}";
        params = JSON.parse(params);
        let queryFiltered = permission.filter(params); //filter all now allowed query variables
        queryFiltered = this.parseOperatorContent(queryFiltered);
        let sequelizeQuery = {include: includeModels, where: queryFiltered};

        if(req.query.limit){ //check for limit
            sequelizeQuery.limit = parseInt(req.query.limit);
        }
        if(req.query.offset){ //check for limit
            sequelizeQuery.offset = parseInt(req.query.offset);
        }
        if(req.query.order){ //check for order
            sequelizeQuery.order = JSON.parse(req.query.order);
        }
        if(req.query.attributes){ //check for selected attributes
            //sequelizeQuery.attributes = JSON.parse(req.query.attributes);
        }
        return sequelizeQuery;
    }

    static isQueryInRequest(req){
        let queryKeyLength = Object.keys(req.query).length;
        return queryKeyLength !== 0;
    }

    async handleAssociationIndex(req,res,resource,myAccessControl,accessControlResource,resourceName,functionNameToCall,isOwn,includeModels = []){

        let permission = DefaultControllerHelper.getPermission(req,myAccessControl,accessControlResource,DefaultControllerHelper.CRUD_READ,isOwn);
        if(permission.granted){
            let sequelizeQuery = this.getSequelizeQuery(req,permission,includeModels);
            resource[functionNameToCall](sequelizeQuery).then(resources => { //get resources
                let dataJSON = DefaultControllerHelper.filterResourcesWithPermission(resources, permission); //filter
                this.logger.info("[DefaultControllerHelper] handleAssociationIndex - " + resourceName);
                MyExpressRouter.responseWithSuccessJSON(res, dataJSON); //anyway answer normaly
            }).catch(err => {
                this.logger.error("[DefaultControllerHelper] handleAssociationIndex - " + resourceName + " - " + err.toString());
                DefaultControllerHelper.respondWithInternalErrorMessage(res,err);

            });
        } else {
            DefaultControllerHelper.respondWithForbiddenMessage(req,res,"Index "+resourceName);
        }
    }

    async handleCount(req, res, sequelizeModel, myAccessControl, accessControlResource, redisKey, customPermission){
        //TODO permission, maybe use the Index Permission ?
        sequelizeModel.count().then(amount => {
            let dataJSON = {count:amount};
            MyExpressRouter.responseWithSuccessJSON(res, dataJSON); //anyway answer normaly
        }).catch(err => {
            DefaultControllerHelper.respondWithInternalErrorMessage(res,err);
        });
    }
    /**
     * Default Function to Handle Index Requests for Resources.
     * @param req The request object
     * @param res The resonse object
     * @param sequelizeModel The Model we want to make an index
     * @param myAccessControl The Access Control
     * @param accessControlResource The resource name for checking in the access control
     * @param includeModels Optional include models which should be added too. Beware ! No Permission filtering for these
     * @param redisKey Optional a Redis Key, for to look up in cache.
     * @param customPermission use custom permission instead
     * @returns {Promise<Promise<* | *>|*>}
     *
     * @apiDefine DefaultControllerIndex
     * @apiError (Error) {Number} errorCode The HTTP-Code of the error. Possible Errors: FORBIDDEN, INTERNAL_SERVER_ERROR
     * @apiError (Error) {String} error A description of the error
     */
    async handleIndex(req, res, sequelizeModel, myAccessControl, accessControlResource, includeModels = [], redisKey=null, customPermission=null) {
        let permission = DefaultControllerHelper.handleDefaultPermissionCheck(req, res, myAccessControl, accessControlResource, DefaultControllerHelper.CRUD_READ, false);
        if(!!customPermission){
            permission = customPermission;
        }

        if (permission.granted) { //can you read any of this resource ?
            console.log("Permission granted");
            let redisClient = MyExpressRouter.redisClient; //get the client
            if(!!redisKey && !DefaultControllerHelper.isQueryInRequest(req)){
                let role = req.locals.currentUser.role; //get users role

                redisClient.get(role + ":" + redisKey, (err, cachedStringData) => { //search in cache
                    if (!!cachedStringData) { //if something saved in cache
                        let dataJSON =  JSON.parse(cachedStringData); //parse to json
                        this.logger.info("[DefaultControllerHelper] handleIndex - " + accessControlResource + " found in cache for role: " + role);
                        MyExpressRouter.responseWithSuccessJSON(res, dataJSON);

                    } else { //not found in cache, then lets look it up
                        sequelizeModel.findAll({include: includeModels}).then(resources => { //get resources
                            let dataJSON = DefaultControllerHelper.filterResourcesWithPermission(resources, permission); //filter
                            redisClient.setex(role + ":" + redisKey, redisCacheTime, JSON.stringify(dataJSON)); //save in cahce
                            this.logger.info("[DefaultControllerHelper] handleIndex - " + accessControlResource + " not found in cache for role: " + role);
                            MyExpressRouter.responseWithSuccessJSON(res, dataJSON); //anyway answer normaly
                        }).catch(err => {
                            console.log("Internal Error 1");
                            console.log(err);
                            this.logger.error("[DefaultControllerHelper] handleIndex - " + accessControlResource + " found in cache for role: " + role + " - " + err.toString());
                            DefaultControllerHelper.respondWithInternalErrorMessage(res,err);
                        });
                    }
                });
            } else {
                let sequelizeQuery = this.getSequelizeQuery(req,permission,includeModels);

                //lets find all resources with query
                sequelizeModel.findAll(sequelizeQuery).then(resources => {
                    //console.log(resources);
                    this.logger.info("[DefaultControllerHelper] handleIndex - " + accessControlResource + " with query: " + JSON.stringify(req.query));
                    //console.log("[DefaultControllerHelper] handleIndex found: "+resources.length);
                    DefaultControllerHelper.respondWithPermissionFilteredResources(req, res, resources, permission);
                }).catch(err => {
                    console.log("Internal Error 2");
                    console.log(sequelizeQuery);
                    console.log(err);
                    this.logger.error("[DefaultControllerHelper] handleIndex - " + accessControlResource + " with query: " + JSON.stringify(req.query) + " - " + err.toString());
                    DefaultControllerHelper.respondWithInternalErrorMessage(res,err);
                });
            }
        }
    }

    /**
     * Default Create Method to build a resource, which primary key is a ID.
     * @param req The request object
     * @param res The resonse object
     * @param sequelizeResource The pre build resource
     * @param myAccessControl The Access Control
     * @param accessControlResource The resource name for checking in the access control
     * @param updateTableUpdateTimes Boolean if the table update times should be updated
     * @param customAnswer
     * @returns {Promise<void>}
     *
     * @apiDefine DefaultControllerCreate
     * @apiError (Error) {Number} errorCode The HTTP-Code of the error. Possible Errors: FORBIDDEN, INTERNAL_SERVER_ERROR
     * @apiError (Error) {String} error A description of the error
     */
    async handleCreate(req, res, sequelizeResource, myAccessControl, accessControlResource, updateTableUpdateTimes = false, customAnswer=false) {
        let isOwn = DefaultControllerHelper.getOwningState(req,accessControlResource);
        let permission = DefaultControllerHelper.handleDefaultPermissionCheck(req, res, myAccessControl, accessControlResource, DefaultControllerHelper.CRUD_CREATE, isOwn);

        this.logger.info("[DefaultControllerHelper] handleCreate - " + accessControlResource + " currentUser: " + req.locals.currentUser.id + " granted: " + permission.granted);
        if (permission.granted) { //check if allowed to create the resource
            console.log("permission granted");
            let allowedAction = await DefaultControllerHelper.executeHookFunctions(req, res, sequelizeResource,accessControlResource,DefaultControllerHelper.CRUD_CREATE,true);
            if(allowedAction){
                return sequelizeResource.save().then(async (savedResource) => { //save resource, this will generate ids and other stuff
                    req.locals[accessControlResource] = savedResource;
                    let allowedAction = await DefaultControllerHelper.executeHookFunctions(savedResource,accessControlResource,DefaultControllerHelper.CRUD_CREATE,false);
                    if(!customAnswer){
                        this.handleGet(req, res, myAccessControl, accessControlResource);
                    }
                    this.updateTableUpdateTimes(sequelizeResource.constructor, updateTableUpdateTimes); //pass update check to function
                    return savedResource;
                }).catch(err => {
                    console.log(err);
                    this.logger.error("[DefaultControllerHelper] handleCreate - " + err.toString());
                    DefaultControllerHelper.respondWithInternalErrorMessage(res,err);
                    return null;
                });
            }
        }
    }

    static async evalOwningState(req,resource){
        try{
            //check if there is an owning function
            return await resource.isOwn(req.locals.currentUser);
        } catch(err) {
            return false; //if not, then we dont care
        }
    }

    static async setOwningStateForResource(req,accessControlResource,resource){
        req.locals["own"+accessControlResource] = await DefaultControllerHelper.evalOwningState(req,resource);
    }

    static async setOwningState(req,accessControlResource){
        await DefaultControllerHelper.setOwningStateForResource(req,accessControlResource,req.locals[accessControlResource]);
    }

    static getOwningState(req,accessControlResource){
        return req.locals["own"+accessControlResource];
    }

    /**
     * Default Get Method for a single resource
     * @param req The request object
     * @param res The resonse object
     * @param myAccessControl The Access Control
     * @param accessControlResource The resource name for checking in the access control
     * @param resourceName The resource name for logging
     * @param isOwn if the currentUser owns the resource
     * @returns {Promise<void>}
     *
     * @apiDefine DefaultControllerGet
     * @apiError (Error) {Number} errorCode The HTTP-Code of the error. Possible Errors: FORBIDDEN, NOT_FOUND
     * @apiError (Error) {String} error A description of the error
     */
    async handleGet(req, res, myAccessControl, accessControlResource) {
        let sequelizeResource = DefaultControllerHelper._getSequelizeResourceAndHandleNotFound(req, res, accessControlResource);
        if(sequelizeResource){
            let isOwn = DefaultControllerHelper.getOwningState(req,accessControlResource);

            let permission = DefaultControllerHelper.handleDefaultPermissionCheck(req, res, myAccessControl, accessControlResource, DefaultControllerHelper.CRUD_UPDATE, isOwn);
            if(permission.granted){
                let allowedAction = await DefaultControllerHelper.executeHookFunctions(req, res, sequelizeResource,accessControlResource,DefaultControllerHelper.CRUD_READ,true);
                if(allowedAction){
                    DefaultControllerHelper.respondWithPermissionFilteredResource(req, res, sequelizeResource, permission);
                    let allowedAction = await DefaultControllerHelper.executeHookFunctions(req, res, sequelizeResource,accessControlResource,DefaultControllerHelper.CRUD_READ,false);
                }
            }
        }
    }

    static _getSequelizeResourceAndHandleNotFound(req, res, accessControlResource){
        let sequelizeResource = req.locals[accessControlResource]; //get the found resource, found by paramcheckers
        if(!sequelizeResource){
            MyExpressRouter.responseWithNotFoundErrorJSON(res, {
                error: 'No Resource found',
                model: accessControlResource
            });
            return false;
        }
        return sequelizeResource;
    }

    static getFilteredReqBodyByPermission(req,myAccessControl,accessControlResource,crudOperation, isOwn){
        let permission = DefaultControllerHelper.getPermission(req,myAccessControl,accessControlResource,crudOperation,isOwn);
        return permission.filter(req.body); //get Attributes with permission
    }

    /**
     * Default Update Method for a Resource.
     * @param req The request object
     * @param res The resonse object
     * @param myAccessControl The Access Control
     * @param accessControlResource The resource name for checking in the access control
     * @param resourceName The resource name for logging
     * @param isOwn if the currentUser owns the resource
     * @param updateTableUpdateTimes Boolean if the table update times should be updated
     * @returns {Promise<void>}
     *
     *
     * @apiDefine DefaultControllerUpdate
     * @apiError (Error) {Number} errorCode The HTTP-Code of the error. Possible Errors: FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND
     * @apiError (Error) {String} error A description of the error
     */
    async handleUpdate(req, res, myAccessControl, accessControlResource, updateTableUpdateTimes = false) {
        let sequelizeResource = DefaultControllerHelper._getSequelizeResourceAndHandleNotFound(req, res, accessControlResource);
        if(sequelizeResource){
            let isOwn = DefaultControllerHelper.getOwningState(req,accessControlResource);

            let permission = DefaultControllerHelper.handleDefaultPermissionCheck(req, res, myAccessControl, accessControlResource, DefaultControllerHelper.CRUD_UPDATE, isOwn);
            if(permission.granted){
                this.logger.info("[DefaultControllerHelper] handleUpdate - " + accessControlResource + " currentUser:" + req.locals.currentUser.id + " body: " + JSON.stringify(req.body));
                let allowedAttributesToUpdate = DefaultControllerHelper.getFilteredReqBodyByPermission(req,myAccessControl,accessControlResource,DefaultControllerHelper.CRUD_UPDATE, isOwn)
                this.logger.info("[DefaultControllerHelper] handleUpdate - " + accessControlResource + " currentUser:" + req.locals.currentUser.id + " allowedAttributesToUpdate: " + JSON.stringify(allowedAttributesToUpdate));
                let allowedAction = await DefaultControllerHelper.executeHookFunctions(req, res, sequelizeResource,accessControlResource,DefaultControllerHelper.CRUD_UPDATE,true);
                if(allowedAction){
                    sequelizeResource.update(allowedAttributesToUpdate).then(async (updatedResource) => { //update resource
                        let allowedAction = await DefaultControllerHelper.executeHookFunctions(updatedResource,accessControlResource,DefaultControllerHelper.CRUD_UPDATE,false);
                        req.locals[accessControlResource] = updatedResource;
                        this.handleGet(req, res, myAccessControl, accessControlResource);
                        this.updateTableUpdateTimes(sequelizeResource.constructor, updateTableUpdateTimes);
                    }).catch(err => {
                        this.logger.error("[DefaultControllerHelper] handleUpdate - " + err.toString());
                        DefaultControllerHelper.respondWithInternalErrorMessage(res,err);
                    });
                }
            }
        }
    }


    /**
     * Default Delete Method of a Resource
     * @param req The request object
     * @param res The resonse object
     * @param myAccessControl The Access Control
     * @param accessControlResource The resource name for checking in the access control
     * @param updateTableUpdateTimes Boolean if the table update times should be updated
     * @returns {Promise<void>}
     *
     * @apiDefine DefaultControllerDelete
     * @apiSuccess {Boolean} success On success this is true
     * @apiError (Error) {Number} errorCode The HTTP-Code of the error. Possible Errors: FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND
     * @apiError (Error) {String} error A description of the error
     */
    async handleDelete(req, res, myAccessControl, accessControlResource, updateTableUpdateTimes = false) {
        let sequelizeResource = DefaultControllerHelper._getSequelizeResourceAndHandleNotFound(req, res, accessControlResource);
        if(sequelizeResource){
            let isOwn = DefaultControllerHelper.getOwningState(req,accessControlResource);
            let permission = DefaultControllerHelper.handleDefaultPermissionCheck(req, res, myAccessControl, accessControlResource, DefaultControllerHelper.CRUD_DELETE, isOwn);
            if(permission.granted){
                this.logger.info("[DefaultControllerHelper] handleDelete - " + accessControlResource + " currentUser: " + req.locals.currentUser.id + " granted: " + permission.granted);
                let constructor = sequelizeResource.constructor; //get constructor for table update times
                let allowedAction = await DefaultControllerHelper.executeHookFunctions(req, res, sequelizeResource,accessControlResource,DefaultControllerHelper.CRUD_DELETE,true);
                if(allowedAction){
                    sequelizeResource.destroy().then(async (amountDeletedResources) => { //ignoring the amount of deletions
                        let allowedAction = await DefaultControllerHelper.executeHookFunctions(req, res, sequelizeResource,accessControlResource,DefaultControllerHelper.CRUD_DELETE,false);
                        DefaultControllerHelper.respondWithDeleteMessage(req, res);
                        this.updateTableUpdateTimes(constructor, updateTableUpdateTimes);
                    }).catch(err => {
                        this.logger.error("[DefaultControllerHelper] handleDelete - " + accessControlResource + " " + err.toString());
                        DefaultControllerHelper.respondWithInternalErrorMessage(res,err);
                    });
                }
            }
        }
    }

    static handleDefaultPermissionCheck(req, res, myAccessControl,accessControlResource,crudOperation,isOwn=false){
        let permission = DefaultControllerHelper.getPermission(req,myAccessControl,accessControlResource,crudOperation,isOwn);
        if (!permission.granted){
            DefaultControllerHelper.respondWithForbiddenMessage(req,res,crudOperation+" "+accessControlResource);
            return permission;
        }
        return permission;
    }

    static getPermission(req,myAccessControl,accessControlResource,crudOperation,isOwn=false){
        crudOperation = crudOperation.toLowerCase();
        let permission = myAccessControl.can(req.locals.currentUser.role)[crudOperation+"Any"](accessControlResource);
        if (isOwn) {
            permission = myAccessControl.can(req.locals.currentUser.role)[crudOperation+"Own"](accessControlResource);
        }
        return permission;
    }
}
