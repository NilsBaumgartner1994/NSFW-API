import DateHelper from "../helper/DateHelper";

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
 * User Incacitivity Schedule will delete old users when they are inactive
 */

export default class UserInactivitySchedule {

    /**
     * Constructor of User Inactivity Schedule
     * @param logger the loggers
     * @param models the sequelize models
     * @param firebaseAPI the firebaseapi to inform users
     */
    constructor(logger, models, schedule, serverConfig) {
        this.logger = logger;
        this.models = models;
        this.schedule = schedule;
        this.usersConfig = serverConfig["users"];
        this.logger.info("[UserInactivitySchedule] initialising");
        this.configureParams();
        this.initializeSchedule();
        this.logger.info("[UserInactivitySchedule] initialised");
    }

    configureParams(){
        this.minutesOfInactivityUntilDeletion = 60 * 24 * this.usersConfig.DaysOfInactivityUntilDeletion;
        this.minutesOfInactiviyAfterInactivityMessage = 60 * 24 * this.usersConfig.DaysOfInactivityUntilWarningOfDeletion;
    }

    initializeSchedule() {
        let instance = this;
        //check this once a day at 18:00
        //                                        S M H D M DW
        let checkSchedule = this.schedule.scheduleJob("0 0 18 * * *", function () {
            instance.runUserInactivitySchedule();
        });
        this.checkSchedule = checkSchedule;
    }

    /**
     * Checks for all Users the inactivity
     * @returns {Promise<void>}
     */
    async runUserInactivitySchedule() {
        let now = new Date();
        this.models.User.findAll()
        .then(users => { //get all users
            for (let i = 0; i < users.length; i++) {
                let user = users[i]; //get users
                this.checkUserInactiviy(user, now); //check for user
            }
        })
        .catch(err => {
        });
    }

    /**
     * Check for user inactivity
     * @param user
     * @param now
     * @returns {Promise<void>}
     */
    async checkUserInactiviy(user, now) {
        let userLastTimeOnline = user.online_time; //get users last online time

        if (!!userLastTimeOnline) { //if there is an online time
            let diffMinutes = DateHelper.diff_minutes_abs(now, userLastTimeOnline); //get online time in minutes

            if (diffMinutes > this.minutesOfInactivityUntilDeletion) { //longer than allowed
                //well we will delete the User
                await this.deleteInactiveUser(user);
            } else if (diffMinutes > this.minutesOfInactiviyAfterInactivityMessage) {
                //well we should inform the User about this deletion in the next days
                await this.sendUserInactivityMessage(user, "due inactivity your Account will be deleted in the next days!");
            }

        } else {
            // user was never online ?
            //TODO we should set it to now ?
        }
    }

    /**
     * Send User an inactivity message
     * @param user
     * @param message
     * @returns {Promise<void>}
     */
    async sendUserInactivityMessage(user, message) {
        let pseudonym = user.pseudonym || "User";
        let device = await user.getDevice();
        if (!device) {
            //well user has no device?, then we cant send it anywhere
            return;
        }
        let pushNotificationToken = device.pushNotificationToken;

        if (!pushNotificationToken) {
            //well no where to send to
            return;
        }

        message = "Hey '" + pseudonym + "', " + message;
        //this.firebaseAPI.sendPushNotification([pushNotificationToken], "Inactiviy", message, 0);
    }

    /**
     * Delete an inactive user and sends a message to him
     * @param user the user instance
     * @returns {Promise<void>}
     */
    async deleteInactiveUser(user) {
        let pseudonym = user.pseudonym || "User";
        let pushNotificationToken = null;
        let device = await user.getDevice(); //get the device before we delete it
        if (!!device) {
            pushNotificationToken = device.pushNotificationToken; //save the token if it exists
        }

        user.destroy().then(success => { //destroy the user
            if (!!pushNotificationToken) { //send message if possible
                let message = "Hey '" + pseudonym + "', you are now deleted :-( Goodby !";
                //this.firebaseAPI.sendPushNotification([pushNotificationToken], "Account Deletion", message, 0);
            }
        }).catch(err => {
            if (!!pushNotificationToken) { //on any error
                let message = "Hey '" + pseudonym + "', we coudnt you delete !? Please report this to us";
                //this.firebaseAPI.sendPushNotification([pushNotificationToken], "Account Deletion", message, 0);
            }
            this.logger.error("UserInactivitySchedule");
            this.logger.error(err);
        });
    }
}
