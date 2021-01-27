import DatabaseBackupSchedule from "../schedules/DatabaseBackupSchedule";
import UserInactivitySchedule from "../schedules/UserInactivitySchedule";
import SystemInformationSchedule from "../schedules/SystemInformationSchedule";

const schedule = require("node-schedule");

/**
 * The ScheduleModule starts all schedules
 */
export default class ScheduleModule {

    static SCHEDULES = [];

    static registerSchedule(CustomSchedule){
        ScheduleModule.SCHEDULES.push(CustomSchedule);
    }

    /**
     * Constructor of the ScheduleModule
     * @param logger The logger class
     * @param models the sequelize models
     */
    constructor(logger,models, redisClient, isMaster) {
        this.logger = logger;
        this.logger.info("[ScheduleModule] initialising");
        this.models = models;
        this.redisClient = redisClient;
        this.createSchedules(isMaster);
        this.logger.info("[ScheduleModule] initialised");
    }

    /**
     * Initializes all schedules
     */
    createSchedules(isMaster){
        if(isMaster) {
            this.databaseBackupSchedule = new DatabaseBackupSchedule(this.logger, this.models, schedule); //we need a database backup schedule
            this.userInactiviySchedule = new UserInactivitySchedule( //a user inactivity checker
                this.logger,
                this.models,
                schedule,
            );
            let customSchedules = ScheduleModule.SCHEDULES;
            for(let i=0; i<customSchedules.length; i++){
                let CustomSchedule = customSchedules[i];
                new CustomSchedule(this.logger, this.models, schedule, this.redisClient);
            }
        }
        this.systemInformationSchedule = new SystemInformationSchedule(this.logger, this.models, schedule, this.redisClient);
    }

}
