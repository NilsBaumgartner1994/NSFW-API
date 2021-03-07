/**
 * The DatabaseBackup Schedule

 "backups": {
            "schedule": {
                "second" : "0",
                "minute" : "0",
                "hour" : "0",
                "day of month" : "0",
                "month" : "0",
                "day of week": "0"
            }
        }

 */
import ScheduleModule from "../../module/ScheduleModule";

export default class DatabaseBackupSchedule {

    /**
     * Constructor of Schedule
     * @param logger the logger for general purpose
     * @param models
     * @param schedule
     * @param redisClient the redis client
     */
    constructor(logger, schedule, backupModule, backupConfig) {
        this.logger = logger;
        this.schedule = schedule;
        this.backupModule = backupModule;
        this.backupConfig = backupConfig;
        this.logger.info("[DatabaseBackupSchedule] initialising");
        this.initializeSchedule();
        this.logger.info("[DatabaseBackupSchedule] initialised");
    }

    /**
     * Method to prepare everything for the shedule
     * @returns {Promise<void>}
     */
    async initializeSchedule() {
        this.initializeBackupSchedule();
    }

    /**
     * Initialize the machine shedule
     * @returns {Promise<void>}
     */
    async initializeBackupSchedule() {
        //Execute a cron job every ten seconds
        const instance = this;
        const scheduleTime = ScheduleModule.jsonToScheduleString(this.backupConfig.schedule);
        let job = this.schedule.scheduleJob(scheduleTime, function () {
            instance.logger.info("[DatabaseBackupSchedule] creating backup");
            instance.backupModule.createBackup();
        });
        this.job = job;
    }

}