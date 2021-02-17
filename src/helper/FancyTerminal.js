import SystemInformationHelper from "./SystemInformationHelper";

const clear = require("console-clear"); //to clear the console

const workerOutput = {}; //saves all output the workers want to print
const maxSavedMessagesPerWorker = 5; //saves the amount of messages per worker
const cluster = require("cluster"); //distibuting this server on all cores of the server

const motd =
    "\n" +
    "███████╗██╗    ██╗ ██████╗ ███████╗██╗   ██╗\n" +
    "██╔════╝██║    ██║██╔═══██╗██╔════╝╚██╗ ██╔╝\n" +
    "███████╗██║ █╗ ██║██║   ██║███████╗ ╚████╔╝ \n" +
    "╚════██║██║███╗██║██║   ██║╚════██║  ╚██╔╝  \n" +
    "███████║╚███╔███╔╝╚██████╔╝███████║   ██║   \n" +
    "╚══════╝ ╚══╝╚══╝  ╚═════╝ ╚══════╝   ╚═╝   \n" +
    "                                            \n";

/**
 * Warning ! Errors will be also printed into Log Files !
 *
 * Fancy Terminal is used to have a better overview in whats going on, by showing the different forks/workers of the
 * Server. This can also be modified to display the desired look. If you dont like the blocks change them here.
 * The displaying of information was moved into this class for a better structure.
 */
export default class FancyTerminal {
    static classicMode = true; //if classic output should be used
    static showMessages = false; //if the terminal should print any output

    static loopEnabled = true; //looping the output and system polling

    static cpuData = {}; //some cpu data we want to print
    static currentLoadData = {}; //some information about ram we want to print
    static uptimeData = {}; //the uptime we want to print

    /**
     * If you dont Like the Fancy Output and want to stay classic edit your desired output here. It will directly print
     * to the console
     * @param message The message of the worker
     * @returns {Promise<void>}
     */
    static async printClassicOutput(workerID, message) {
        console.log("Worker: " + workerID + " - " + message);
    }

    /**
     * A sleep helper method
     * @param millis Milliseconds to sleep
     * @returns {Promise<any>}
     */
    static async sleep(millis) {
        return new Promise(resolve => setTimeout(resolve, millis));
    }

    /**
     * Adds Workers Messages either to the master which stores it then in a buffer, or will use classic print method.
     * @param workerID The workerID
     * @param message The message of the worker
     * @returns {Promise<void>}
     */
    static async addWorkerOutput(workerID, message) {
        if (cluster.isWorker) { //if you are not the master
            process.send({workerID: "" + cluster.worker.id, message: "" + message}); //send to master
        } else { //if you are master
            if (FancyTerminal.classicMode && FancyTerminal.showMessages) { //and we want classic output
                FancyTerminal.printClassicOutput(workerID, message); //we use classic output
            } else { //and we want a fancy output
                let output = workerOutput[workerID] || []; //we get all saved messages of the worker
                if (output.length >= maxSavedMessagesPerWorker) {  //did the worker exeedet his maximum messages
                    output.shift(); //kick out oldest message
                }
                output.push(message); //add new message
                workerOutput[workerID] = output; //save back to workers output
            }
        }
    }

    /**
     * The Main Function of the Fancy Terminal. Starts the loop and other stuff
     * @returns {Promise<void>}
     */
    static async startFancyTerminal() {
        //FancyTerminal.classicMode = false; //just change this on top
        FancyTerminal.showMessages = true; //we want to see messages
        FancyTerminal.loopEnabled = true; //we want to se

        FancyTerminal.pollSystemInformation(); //start polling system informations
        FancyTerminal.mainLoop(); //start loop of printing the terminal
    }

    /**
     * Stop the continuing of polling system informations and the looping of fancy output
     */
    static stopFancyTerminal() {
        FancyTerminal.loopEnabled = false;
    }

    /**
     * Polls System Informations and cache them
     * @returns {Promise<void>}
     */
    static async pollSystemInformation() {
        FancyTerminal.cpuData = await SystemInformationHelper.cpuDataJSON(); //get cpu
        FancyTerminal.currentLoadData = await SystemInformationHelper.currentLoadDataJSON(); //get ram
        FancyTerminal.uptimeData = await SystemInformationHelper.uptimeMachineDataJSON(); //get uptime
        await FancyTerminal.sleep(500); //wait 500ms
        if (FancyTerminal.loopEnabled) { //if still alive
            FancyTerminal.pollSystemInformation(); //restart the polling
        }
    }

    /**
     * Clearing the Terminal Screen. //TODO find a better way to clear console
     */
    static clearConsole() {
        //console.log("\x1B[2J");//move cursor to top
        //console.log("\x1Bc"); //clear screen
        clear(true); //use clear console package, and also print old messages
    }

    /**
     * The main Loop will print the fancy State if classic mode is disabled, and then starts again
     * @returns {Promise<void>}
     */
    static async mainLoop() {
        if (!FancyTerminal.classicMode) { //if using fancy output
            FancyTerminal.printFancyOutput();
        }
        await FancyTerminal.sleep(100); //sleep 100ms
        if (FancyTerminal.loopEnabled) { //if still alive
            FancyTerminal.mainLoop(); //restart main loop
        }
    }


    /**
     * Prints the Fancy Output
     * @returns {Promise<void>}
     */
    static async printFancyOutput() {
        FancyTerminal.clearConsole(); //clear console print fancy output
        console.log("Welcome to");
        console.log(motd);
        FancyTerminal.printSeperator();
        await FancyTerminal.printUsageInformations();
        if (FancyTerminal.showMessages) {
            FancyTerminal.printWorkerOutputs();
        }
    }

    /**
     * Print a message surrounded by borders
     * @param message the message
     */
    static printWithBorders(message) {
        let terminalWidth = process.stdout.columns - 2; //get terminal width
        let length = message.length; //get message width
        console.log("|" + message + " ".repeat(terminalWidth - length) + "|");
    }

    /**
     * Print a horizontal line
     */
    static printSeperator() {
        console.log("+" + "-".repeat(process.stdout.columns - 2) + "+");
    }

    /**
     * Format a number with leading zeros
     * @param num the number
     * @param size the total length of the output
     * @returns {string}
     */
    static padLeadingZero(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    /**
     * parses uptime seconds into human readable format
     * @param seconds the uptime seconds as integer
     * @returns {string} a human readable format
     */
    static parseUptimeSecondsToReadableFormat(seconds) {
        if (!seconds) { //no seconds given
            return "";
        }

        let minuteInSeconds = 60;
        let hourInSeconds = minuteInSeconds * 60;
        let dayInSeconds = hourInSeconds * 24;

        let days = Math.floor(seconds / dayInSeconds); //calc days
        let hours = Math.floor((seconds - days * dayInSeconds) / hourInSeconds); //calc hours
        let minutes = Math.floor(
            (seconds - (hours * hourInSeconds + days * dayInSeconds)) / minuteInSeconds
        ); //calc minutes
        let sinceSeconds = seconds % 60; //calc remeining seconds
        return (
            days +
            " " +
            FancyTerminal.padLeadingZero(hours, 2) +
            ":" +
            FancyTerminal.padLeadingZero(minutes, 2) +
            ":" +
            FancyTerminal.padLeadingZero(sinceSeconds, 2)
        );
    }

    /**
     * Print Usage Informations like CPU and System informations
     * @returns {Promise<void>}
     */
    static async printUsageInformations() {
        FancyTerminal.printWithBorders(
            " CPU Speed: " +
            FancyTerminal.cpuData.speed +
            "/" +
            FancyTerminal.cpuData.speedmax +
            " Ghz"
        );
        FancyTerminal.printWithBorders(
            " Uptime: " +
            FancyTerminal.parseUptimeSecondsToReadableFormat(FancyTerminal.uptimeData.uptime)
        );
        FancyTerminal.printSeperator();
    }

    /**
     * Prints fancy workers output
     */
    static printWorkerOutputs() {
        let workerTest = workerOutput || {};
        let workerIDs = Object.keys(workerTest); //get workers ids
        FancyTerminal.printWithBorders(" Amount of Workers: " + workerIDs.length);
        FancyTerminal.printSeperator();
        for (let i = 0; i < workerIDs.length; i++) { //for all workers
            let workerID = workerIDs[i]; //get worker
            FancyTerminal.printWithBorders(" Worker: " + workerID); //print name
            let saved = workerTest[workerID]; //get messages
            for (let j = 0; j < saved.length; j++) { //for all messages
                FancyTerminal.printWithBorders(" " + saved[j]); //print message
            }
            FancyTerminal.printSeperator();
        }
    }
}
