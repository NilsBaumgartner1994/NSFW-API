import CustomSchedule from "../schedules/CustomSchedule";
import DatabaseBackupSchedule from "../schedules/DatabaseBackupSchedule";
import UserInactivitySchedule from "../schedules/UserInactivitySchedule";
import SystemInformationSchedule from "../schedules/SystemInformationSchedule";

/**
 * The ScheduleModule starts all schedules
 */
export default class ScheduleModule {

    /**
     * Constructor of the ScheduleModule
     * @param logger The logger class
     * @param firebaseAPI the firebase api
     * @param models the sequelize models
     */
    constructor(logger,models,firebaseAPI, redisClient, isMaster) {
        this.logger = logger;
        this.logger.info("[ScheduleModule] initialising");
        this.models = models;
        this.firebaseAPI = firebaseAPI;
        this.redisClient = redisClient;
        this.createSchedules(isMaster);
        this.logger.info("[ScheduleModule] initialised");
    }

    /**
     * Initializes all schedules
     */
    createSchedules(isMaster){
        if(isMaster) {
            this.customSchedule = new CustomSchedule(this.logger, this.models); //we may want to run our own things
            this.databaseBackupSchedule = new DatabaseBackupSchedule(this.logger, this.models); //we need a database backup schedule
            this.userInactiviySchedule = new UserInactivitySchedule( //a user inactivity checker
                this.logger,
                this.models,
                this.firebaseAPI
            );
        }
        this.systemInformationSchedule = new SystemInformationSchedule(this.logger, this.redisClient);
    }

}
