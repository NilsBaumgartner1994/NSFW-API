import MyExpressRouter from "../../module/MyExpressRouter";
import DefaultControllerHelper from "../../helper/DefaultControllerHelper";

export default class BackupController {

    static _keyBackupFileName = "PluginBackup_backupFileName";

    constructor(logger, models, myExpressRouter, route, backupModule) {
        this.logger = logger;
        this.models = models;
        this.expressApp = myExpressRouter.expressApp;
        this.myAccessControl = myExpressRouter.myAccessControl;
        this.myExpressRouter = myExpressRouter;
        this.route = route;
        this.backupModule = backupModule;
        this.configureRoutes();
    }

    /**
     * Configure all Routes for the database
     */
    configureRoutes() {
        this.configureIndexBackups();
        this.configureBackupParamChecker();
        this.configureCreateBackup();
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
        let functionToHandle = async function(req, res){ //define the get function
            let file = MyExpressRouter.getSingleFileUpload(req, res);
            if(file){
                let filename = MyExpressRouter.getFileUploadName(file);
                this.backupModule.uploadBackup(filename, file).then(success => {
                    MyExpressRouter.responseWithSuccessJSON(res, {});
                }).catch(err => {
                    MyExpressRouter.respondWithInternalErrorMessage(res, err);
                })
            }
        }
        let route = this.route + "/upload";
        this.myExpressRouter.withPermissionMiddleware(route, DefaultControllerHelper.CRUD_CREATE, MyExpressRouter.adminRoutes_accessControlResource, functionToHandle, false);
    }

    configureCreateBackup(){
        let functionToHandle = async function(req, res){ //define the get function
            let filename = req.body.filename || this.backupModule.createBackupFilename("custom");
            this.backupModule.createBackup(filename).then(success => {
                MyExpressRouter.responseWithSuccessJSON(res, {});
            }).catch(err => {
                MyExpressRouter.respondWithInternalErrorMessage(res, err);
            })
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
