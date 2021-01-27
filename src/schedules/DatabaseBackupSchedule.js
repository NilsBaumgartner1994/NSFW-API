//import DatabaseBackupModule from "../module/DatabaseBackupModule";

/**
 *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    │
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, OPTIONAL)
 */

/**
 * A Shedule to export the database in periodic times
 */
export default class DatabaseBackupSchedule {

    /**
     * Constructor of the Backup shedule
     * @param logger
     */
    constructor(logger, models, schedule) {
        this.logger = logger;
        this.models = models;
        this.schedule = schedule;
        //this.databaseBackupModule = new DatabaseBackupModule(logger); //the backup module itself
        //this.databaseBackupModule.exportDatabase(); //make a backup every server start
        this.initializeSchedule();
    }

    /**
     * Method to prepare everything for the shedule
     * @returns {Promise<void>}
     */
    async initializeSchedule() {
        this.logger.info("[DatabaseBackupSchedule] initialising");
        await this.initializeBackupchedule();
        this.logger.info("[DatabaseBackupSchedule] initialised");
    }

    /**
     * Initialize the Backup shedule
     * @returns {Promise<void>}
     */
    async initializeBackupchedule() {
        //Execute a cron job at 02 am every day
        const instance = this;
        let computerSchedule = this.schedule.scheduleJob("0 0 2 * * *", function () {
            //instance.databaseBackupModule.exportDatabase();
        });
        this.computerSchedule = computerSchedule;
    }
}
