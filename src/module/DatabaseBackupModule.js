import FileSystemHelper from "../helper/FileSystemHelper";
import SqLiteDatabaseBackupModule from "./SqLiteDatabaseBackupModule";

const path = require('path');
const fs = require("fs"); //file-system

export default class DatabaseBackupModule {

    static DIALECT_SQLITE = "sqlite";

    static BackupFolder = path.join(fs.realpathSync('.'), "backups", "database");

    static ImplementationDatabaseModule = null;

    constructor(logger,models, sequelizeConfig) {
        this.logger = logger;
        this.sequelizeConfig = sequelizeConfig;
        this.logger.info("[ScheduleModule] initialising");
        this.models = models;
        this.logger.info("[ScheduleModule] initialised");
        this._createFolders();
    }

    _getDatabaseModuleImplementation(){
        if(!!DatabaseBackupModule.ImplementationDatabaseModule){
            return DatabaseBackupModule.ImplementationDatabaseModule;
        }
        if(!!this.sequelizeConfig && this.sequelizeConfig.dialect === DatabaseBackupModule.DIALECT_SQLITE){
            return SqLiteDatabaseBackupModule;
        }
    }

    implementationFound(){
        let implementation = this._getDatabaseModuleImplementation();
        return !!implementation;
    }

    async loadBackup(backupFileName){
        if(this.implementationFound()){
            let backupFilePath = DatabaseBackupModule._getPathOfBackup(backupFileName);
            let implementation = this._getDatabaseModuleImplementation();
            await implementation.loadBackup(backupFileName, backupFilePath, this.sequelizeConfig, this.models, this.logger);
        }
        return false;
    }

    async createBackup(backupFileName){
        if(this.implementationFound()){
            let backupFilePath = DatabaseBackupModule._getPathOfBackup(backupFileName);
            let implementation = this._getDatabaseModuleImplementation();
            await implementation.createBackup(backupFileName, backupFilePath, this.sequelizeConfig, this.models, this.logger);
        }
        return false;
    }

    async _callImplementationFunction(functionName, backupFileName){
        if(this.implementationFound()){
            let backupFilePath = DatabaseBackupModule._getPathOfBackup(backupFileName);
            let implementation = this._getDatabaseModuleImplementation();
            await implementation[functionName](backupFileName, backupFilePath, this.sequelizeConfig, this.models, this.logger);
        }
        return false;
    }

    async uploadBackup(backupFileName, backup){
        let pathToPlaceBackup = DatabaseBackupModule._getPathOfBackup(backupFileName);
        if(FileSystemHelper.doesPathExist(pathToPlaceBackup)){
            this.deleteBackup(backupFileName);
        }
        let promise = new Promise(function(resolve, reject) {
            backup.mv(pathToPlaceBackup, function (err){
                if(err){
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        })
        return await promise;
    }

    existBackup(backupFileName){
        return FileSystemHelper.doesPathExist(DatabaseBackupModule._getPathOfBackup(backupFileName));
    }

    deleteBackup(backupFileName){
        return FileSystemHelper.deleteFile(DatabaseBackupModule._getPathOfBackup(backupFileName)); //delete old raw file
    }

    getBackup(backupFileName){
        return this._getBackupInformation(backupFileName);
    }

    indexBackups(){
         //get all files in this backup folder
        let backupFilenamess = FileSystemHelper.getAllFilesFormPath(DatabaseBackupModule.BackupFolder);
        let backupResources = [];
        for(let i=0; i<backupFilenamess.length; i++){
            let backupFileName = backupFilenamess[i];
            let backupInformation = this.getBackup(backupFileName);
            backupResources.push(backupInformation);
        }
        return backupResources;
    }

    static _getPathOfBackup(backupFileName){
        return path.join(DatabaseBackupModule.BackupFolder, backupFileName);
    }

    _createFolders(){
        FileSystemHelper.mkdirpath(DatabaseBackupModule.BackupFolder); //create it if it does not exist
    }

    /**
     * Get Informations about a Backup file
     * @param backupFileName A backup file name
     * @returns {{createdAt: Date, id: *, backupFilePath: string, updatedAt: Date}}
     */
    _getBackupInformation(backupFileName) {
        let backupFilePath = DatabaseBackupModule._getPathOfBackup(backupFileName); //get the path of a backup
        let createdAt = FileSystemHelper.getCreatedDate(backupFilePath);
        let updatedAt = FileSystemHelper.getFileUpdatedDate(backupFilePath);
        return {
            id: backupFileName,
            backupFilePath: backupFilePath,
            createdAt: createdAt,
            updatedAt: updatedAt
        }
    }


}
