import FileSystemHelper from "../helper/FileSystemHelper";

const path = require('path');

export default class SqLiteDatabaseBackupModule {

    static async loadBackup(backupFileName, backupFilePath, sequelizeConfig, models, logger){
        logger.info("[SqLiteDatabaseBackupModule] loadBackup: "+backupFileName);
        let currentDB = SqLiteDatabaseBackupModule._getCurrentDB(sequelizeConfig)
        await FileSystemHelper.copy(backupFilePath, currentDB);
    }

    static async createBackup(backupFileName, backupFilePath, sequelizeConfig, models, logger){
        logger.info("[SqLiteDatabaseBackupModule] createBackup: "+backupFileName);
        let currentDB = SqLiteDatabaseBackupModule._getCurrentDB(sequelizeConfig);
        await FileSystemHelper.copy(currentDB, backupFilePath);
    }

    static _getCurrentDB(sequelizeConfig){
        let rootFolder = fs.realpathSync('.');
        let storage = sequelizeConfig.storage;
        FileSystemHelper.mkdirpath(storage); //create it if it does not exist
        return path.join(rootFolder, storage);
    }

}
