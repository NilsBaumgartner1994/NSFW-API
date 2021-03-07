import FileSystemHelper from "../../helper/FileSystemHelper";
import SqLiteDatabaseBackupModule from "./SqLiteDatabaseBackupModule";
import DateHelper from "../../helper/DateHelper";

const path = require('path');
const fs = require("fs"); //file-system

export default class DatabaseBackupModule {

    static DIALECT_SQLITE = "sqlite";

    static BackupFolder = null;

    static ImplementationDatabaseModule = null;

    constructor(logger,models, sequelizeConfig, backupConfig) {
        this.logger = logger;
        this.sequelizeConfig = sequelizeConfig;
        this.backupConfig = backupConfig;
        this.configureBackupFolder();
        this.logger.info("[ScheduleModule] initialising");
        this.models = models;
        this.logger.info("[ScheduleModule] initialised");
        this._createFolders();
    }

    configureBackupFolder(){
        let ownPath = fs.realpathSync('.');
        let backupConfig = this.backupConfig || {};
        let folder = backupConfig["folder"] || ["backups", "database"];
        if(Array.isArray(folder)){
            folder.unshift(ownPath);
            DatabaseBackupModule.BackupFolder = path.join.apply(folder); // apply() --> pass array as argument list
        } else {
            DatabaseBackupModule.BackupFolder = folder;
        }
    }

    _getDatabaseModuleImplementation(){
        return DatabaseBackupModule._getDatabaseModuleImplementation(this.sequelizeConfig);
    }

    static _getDatabaseModuleImplementation(sequelizeConfig){
        if(!!DatabaseBackupModule.ImplementationDatabaseModule){
            return DatabaseBackupModule.ImplementationDatabaseModule;
        }

        if(!!sequelizeConfig && sequelizeConfig.dialect === DatabaseBackupModule.DIALECT_SQLITE){
            return SqLiteDatabaseBackupModule;
        }

        return null;
    }

    static _supportForSequelizeConfig(sequelizeConfig){
        return !!DatabaseBackupModule._getDatabaseModuleImplementation(sequelizeConfig);
    }

    implementationFound(){
        let implementation = this._getDatabaseModuleImplementation();
        return !!implementation;
    }

    async loadBackup(backupFileName){
        if(this.implementationFound()){
            let backupFilePath = this._getPathOfBackup(backupFileName);
            let implementation = this._getDatabaseModuleImplementation();
            await implementation.loadBackup(backupFileName, backupFilePath, this.sequelizeConfig, this.models, this.logger);
        }
        return false;
    }

    createBackupFilename(prefix="auto"){
        let timestamp = DateHelper.dateToYYYY_MM_DD_HH_MM_SS_MSMS(new Date());
        return prefix+"-"+timestamp;
    }

    async createBackup(backupFileName){
        backupFileName = !!backupFileName ? backupFileName : this.createBackupFilename();

        let instance = this;
        let promise = new Promise(async function(resolve, reject) {
            if(instance.implementationFound()){
                let backupFilePath = this._getPathOfBackup(backupFileName);
                let implementation = instance._getDatabaseModuleImplementation();
                try{
                    let answer = await implementation.createBackup(backupFileName, backupFilePath, this.sequelizeConfig, this.models, this.logger);
                    resolve(answer);
                } catch (err){
                    reject(err);
                }
            } else {
                reject("No implementation found");
            }
        })
        return await promise;
    }

    async _callImplementationFunction(functionName, backupFileName){
        if(this.implementationFound()){
            let backupFilePath = this._getPathOfBackup(backupFileName);
            let implementation = this._getDatabaseModuleImplementation();
            await implementation[functionName](backupFileName, backupFilePath, this.sequelizeConfig, this.models, this.logger);
        }
        return false;
    }

    async uploadBackup(backupFileName, backup){
        let pathToPlaceBackup = this._getPathOfBackup(backupFileName);
        FileSystemHelper.mkdirpathForFile(pathToPlaceBackup); //Check if Folder exists
        let instance = this;

        let promise = new Promise(function(resolve, reject) {
            if(FileSystemHelper.doesPathExist(pathToPlaceBackup)){
                instance.deleteBackup(backupFileName);
            }
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
        return FileSystemHelper.doesPathExist(this._getPathOfBackup(backupFileName));
    }

    deleteBackup(backupFileName){
        return FileSystemHelper.deleteFile(this._getPathOfBackup(backupFileName)); //delete old raw file
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

    _getPathOfBackup(backupFileName){
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
        let backupFilePath = this._getPathOfBackup(backupFileName); //get the path of a backup
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
