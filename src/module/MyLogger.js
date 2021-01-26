const {createLogger, format, transports} = require('winston');
require('winston-daily-rotate-file');
const {combine, timestamp, label, printf} = format;
import FileSystemHelper from '../helper/FileSystemHelper';

/**
 * MyLogger is a Wrapper for winston logger https://www.npmjs.com/package/winston
 * This logger simply creates just a format and handles the folder structure
 */
export default class MyLogger {

    /**
     * Constructor of a logger
     * @param folderName the folder name
     * @param workerID the workerID
     */
    constructor(folderName, workerID) {
        const pathToGeneralLogFolder = "./logs/"; //get path of logs
        FileSystemHelper.mkdirpath(pathToGeneralLogFolder); //create it if it does not exist

        const pathToLogFolder = pathToGeneralLogFolder + folderName;
        FileSystemHelper.mkdirpath(pathToLogFolder); //create specific folder

        // CREATING THE LOGGER
        const myFormat = printf(({level, message, label, timestamp}) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
        });

        let transportsList = [];
        transportsList.push(
            new transports.DailyRotateFile({ //each day a new file
                filename: 'logs/' + folderName + '/error-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: false,
                maxSize: '20m',
                maxFiles: '14d',
                level: 'error',
            })
        );
        transportsList.push(
            new transports.DailyRotateFile({ //each day a new file
                filename: 'logs/' + folderName + '/combined-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: false,
                maxSize: '20m',
                maxFiles: '14d'
            })
        );

        const customLabel = "Worker: " + workerID + " - " + folderName; //the format will be defined here

        this.logger = createLogger({
            format: combine(
                label({label: customLabel}),
                timestamp(),
                myFormat
            ),
            defaultMeta: {service: 'user-service'},
            transports: transportsList
        });

        this.logger.info("[" + folderName + "] Logger Created"); //first logger message :D
    }

    /**
     * Returns the logger instance
     */
    getLogger() {
        return this.logger;
    }

}