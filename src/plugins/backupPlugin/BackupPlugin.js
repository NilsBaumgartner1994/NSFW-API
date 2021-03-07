import DatabaseBackupModule from "./DatabaseBackupModule";
import BackupController from "./BackupController";
import DatabaseBackupSchedule from "./DatabaseBackupSchedule";

export default class BackupPlugin {

    static backupConfig = {
        folder: ["backups", "database"],
        schedule: {
            "second": "0",
            "minute": "0",
            "hour": "10",
            "day of month": "*",
            "month": "*",
            "day of week": "*",
        }
    };

    constructor() {
    }

    /**
     * The Master thread activates this
     */
    activateMasterPlugin(logger, models, schedule, redisClient, serverConfig, sequelizeConfig){
        if(DatabaseBackupModule._supportForSequelizeConfig(sequelizeConfig)){
            let backupModule = this.getBackupModule(logger, models, sequelizeConfig);
            this.backupSchedule = new DatabaseBackupSchedule(logger, schedule, backupModule, BackupPlugin.backupConfig);
        } else {
            this.logNoSupportForSequelizeConfig(logger);
        }
    }

    logNoSupportForSequelizeConfig(logger){
        logger.error("[BackupPlugin] No support for given sequelizeConfig");
    }

    /**
     * Each worker
     */
    activateWorkerPlugin(logger, models, schedule, redisClient, serverConfig, sequelizeConfig, myExpressRouter, route){
        if(DatabaseBackupModule._supportForSequelizeConfig(sequelizeConfig)) {
            let backupModule = this.getBackupModule(logger, models, sequelizeConfig);
            this.backupController = new BackupController(logger, models, myExpressRouter, route, backupModule);
        } else {
            this.logNoSupportForSequelizeConfig(logger);
        }
    }

    getBackupModule(logger, models, sequelizeConfig){
        return new DatabaseBackupModule(logger, models, sequelizeConfig, BackupPlugin.backupConfig);
    }

}
