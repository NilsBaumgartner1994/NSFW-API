import "regenerator-runtime/runtime.js";
import ServerAPI from "./ServerAPI";
import AuthConnector from "./auth/AuthConnector";

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
        }
    }
}

var currentPath = process.cwd();
let pathToModels = currentPath+"/dev"; //path to models

let server = new ServerAPI(config["server"], null, pathToModels, 1);
server.start();
