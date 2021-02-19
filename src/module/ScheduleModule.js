import UserInactivitySchedule from "../schedules/UserInactivitySchedule";
import SystemInformationSchedule from "../schedules/SystemInformationSchedule";
import * as cluster from "cluster";

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
     * @param redisClient
     * @param serverConfig
     */
    constructor(logger,models, redisClient, serverConfig) {
        this.logger = logger;
        this.logger.info("[ScheduleModule] initialising");
        this.models = models;
        this.redisClient = redisClient;
        this.serverConfig = serverConfig;
        this.createSchedules();
        this.logger.info("[ScheduleModule] initialised");
    }

    /**
     * Initializes all schedules
     */
    createSchedules(){
        if(cluster.isMaster) {
            this.userInactiviySchedule = new UserInactivitySchedule( //a user inactivity checker
                this.logger,
                this.models,
                schedule,
                this.serverConfig
            );
            let customSchedules = ScheduleModule.SCHEDULES;
            for(let i=0; i<customSchedules.length; i++){
                let CustomSchedule = customSchedules[i];
                new CustomSchedule(this.logger, this.models, schedule, this.redisClient, this.serverConfig);
            }
        }
        this.systemInformationSchedule = new SystemInformationSchedule(this.logger, this.models, schedule, this.redisClient, this.serverConfig);
    }

}
