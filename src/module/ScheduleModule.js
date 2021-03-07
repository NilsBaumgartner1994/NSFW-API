import UserInactivitySchedule from "../schedules/UserInactivitySchedule";
import SystemInformationSchedule from "../schedules/SystemInformationSchedule";
import * as cluster from "cluster";

const schedule = require("node-schedule");

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
 * The ScheduleModule starts all schedules
 */
export default class ScheduleModule {

    static jsonToScheduleString(config){
        config = config || {};
        config.second = config.second ? config.second : "*";
        config.minute = config.minute ? config.minute : "*";
        config.hour = config.hour ? config.hour : "*";
        config["day of month"] = config["day of month"] ? config["day of month"] : "*";
        config.month = config.month ? config.month : "*";
        config["day of week"] = config["day of week"] ? config["day of week"] : "*";

        return config.second+" "+config.minute+" "+config.hour+" "+config["day of month"]+" "+config.month+" "+config["day of week"];
    }

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

    getAllScheduledJobs(){
        return schedule.scheduledJobs;
    }

    cancelAllSchedules(){
        let allJobs = this.getAllScheduledJobs();
        for(let i=0; i<allJobs.length; i++){
            let job = allJobs[i];
            job.cancel();
        }
    }

    getSchedule(){
        return schedule;
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
