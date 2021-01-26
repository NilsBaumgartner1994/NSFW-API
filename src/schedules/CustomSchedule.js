/**
 * This custom Schedule can handle work like renaming things or running tasks once
 */
export default class CustomSchedule {

    /**
     * Constructor for Custom shedule
     * @param logger the logger
     * @param models the sequelize models
     */
    constructor(logger, models) {
        this.logger = logger;
        this.logger.info("[CustomSchedule] initialising");
        this.models = models;
        this.runCustomMethod();
        this.logger.info("[CustomSchedule] initialised");
    }

    async runCustomMethod(){

    }

}
