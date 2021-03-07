import "regenerator-runtime/runtime.js";
import ServerAPI from "./ServerAPI";
import AuthConnector from "./auth/AuthConnector";
import BackupPlugin from "./plugins/backupPlugin/BackupPlugin";

const config = {
    "server": {
        "port": 3001,
        "redisPort": 6379,
        "serverAPIVersion": "1.0.0",
        "uploads": {
            "maxFileUploadSizeInMb": 50,
            "maxBodyUploadSizeInMb": 50
        },
        "redisAlreadyRunning":false,
        "auth": {
            "disabled": true,
        },
        "users": {
            "DaysOfInactivityUntilDeletion": 180,
            "DaysOfInactivityUntilWarningOfDeletion": 178
        },
        "backups": {
            //"folder" : ["backups", "database"],
            "schedule": {
                "second" : "0",
                "minute" : "0",
                "hour" : "0",
                "day of month" : "0",
                "month" : "0",
                "day of week": "0"
            }
        }
    }
}

var currentPath = process.cwd();
let pathToModels = currentPath+"/dev"; //path to models

let server = new ServerAPI(config["server"], null, pathToModels, 1);
server.registerPlugin("BackupPlugin", new BackupPlugin());
server.start();
