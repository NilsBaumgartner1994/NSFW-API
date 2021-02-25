import MyExpressRouter from "../module/MyExpressRouter";
import ServerAPI from "../ServerAPI";
import DefaultControllerHelper from "../helper/DefaultControllerHelper";
import DatabaseBackupModule from "../module/DatabaseBackupModule";
import FileSystemHelper from "../helper/FileSystemHelper";

export default class BackupController {

    static _keyBackupFileName = "BackupController_backupFileName";

    constructor(logger, models, expressApp, myAccessControl, myExpressRouter, route) {
        this.logger = logger;
        this.models = models;
        this.expressApp = expressApp;
        this.myAccessControl = myAccessControl;
        this.myExpressRouter = myExpressRouter;
        this.route = route;
        this.backupModule = new DatabaseBackupModule(logger, models, ServerAPI.instance.sequelizeConfig);
        this.configureRoutes();
    }

    /**
     * Configure all Routes for the database
     */
    configureRoutes() {
        this.configureIndexBackups();
        this.configureBackupParamChecker();
        this.configureGetBackup();
        this.configureDeleteBackup();
        this.configureDownloadBackup();
        this.configureUpload();
    }

    configureBackupParamChecker(){
        this.expressApp.param(BackupController._keyBackupFileName, this.paramChecker.bind(this));
    }

    paramChecker(req, res, next, primaryKeyAttributeValue){
        if(this.backupModule.existBackup(primaryKeyAttributeValue)){
            let backupInformations = this.backupModule.getBackup(primaryKeyAttributeValue);
            req.locals[BackupController._keyBackupFileName] = backupInformations;
            next();
        } else {
            MyExpressRouter.responseWithNotFoundErrorJSON(res, { //response with error
                error: 'No Resource found',
                model: "Backups",
                key: BackupController._keyBackupFileName,
                value: primaryKeyAttributeValue
            })
        }
    }

    configureUpload(){
        let instance = this;
        let functionToHandle = async function(req, res){ //define the get function
            let file = MyExpressRouter.getSingleFileUpload(req, res);
            if(file){
                let filename = MyExpressRouter.getFileUploadName(file);
                let dstFilePath = DatabaseBackupModule._getPathOfBackup(filename);
                FileSystemHelper.mkdirpathForFile(dstFilePath); //Check if Folder exists
                FileSystemHelper.deleteFile(dstFilePath); //Delte the old File
                file.mv(dstFilePath, function (err) { //move the file, mayby overrite it, i dont care
                    if (err) {
                        MyExpressRouter.respondWithInternalErrorMessage(res, err);
                    } else {
                        MyExpressRouter.responseWithSuccessJSON(res, {});
                    }
                });
            }
        }
        let route = this.route + "/";
        this.myExpressRouter.withPermissionMiddleware(route, DefaultControllerHelper.CRUD_CREATE, MyExpressRouter.adminRoutes_accessControlResource, functionToHandle, false);
    }

    configureGetBackup(){
        let functionToHandle = async function(req, res){ //define the get function
            let backupInformations = req.locals[BackupController._keyBackupFileName];
            MyExpressRouter.responseWithSuccessJSON(res, backupInformations);
        }
        let route = this.route + "/:"+BackupController._keyBackupFileName;
        this.myExpressRouter.withPermissionMiddleware(route, DefaultControllerHelper.CRUD_READ, MyExpressRouter.adminRoutes_accessControlResource, functionToHandle, false);
    }

    configureDeleteBackup(){
        let instance = this;
        let functionToHandle = async function(req, res){ //define the get function
            let backupInformations = req.locals[BackupController._keyBackupFileName];
            let success = instance.backupModule.deleteBackup(backupInformations.id);
            if(success){
                DefaultControllerHelper.respondWithDeleteMessage(req, res);
            } else {
                DefaultControllerHelper.respondWithInternalErrorMessage(res,"Could not delete backup");
            }
        }
        let route = this.route + "/:"+BackupController._keyBackupFileName;
        this.myExpressRouter.withPermissionMiddleware(route, DefaultControllerHelper.CRUD_DELETE, MyExpressRouter.adminRoutes_accessControlResource, functionToHandle, false);
    }

    configureDownloadBackup(){
        let functionToHandle = async function(req, res){ //define the get function
            let backupInformations = req.locals[BackupController._keyBackupFileName];
            let backupFilePath = backupInformations.backupFilePath;
            MyExpressRouter.responseWithFiledownload(res, backupFilePath);
        }
        let route = this.route + "/:"+BackupController._keyBackupFileName+"/download";
        this.myExpressRouter.withPermissionMiddleware(route, DefaultControllerHelper.CRUD_READ, MyExpressRouter.adminRoutes_accessControlResource, functionToHandle, false);
    }

    configureIndexBackups(){
        let instance = this;
        let functionToHandle = async function(req, res){ //define the get function
                let backupFileNames = instance.backupModule.indexBackups();
                MyExpressRouter.responseWithSuccessJSON(res, backupFileNames);
        }
        let route = this.route + "";
        this.myExpressRouter.withPermissionMiddleware(route, DefaultControllerHelper.CRUD_READ, MyExpressRouter.adminRoutes_accessControlResource, functionToHandle, false);
    }

}
