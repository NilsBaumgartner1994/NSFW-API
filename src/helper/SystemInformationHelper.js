const si = require('systeminformation');

/**
 * System Informations helper, which get information about the machine this job is running on, like CPU, Ram, Network, ...
 */
export default class SystemInformationHelper {

    /**
     * Get all informations about the Machine
     * @returns {*}
     */
    static async getAllSystemData() {
        let cpuDataJSON = await SystemInformationHelper.cpuDataJSON();
        let cpuCurrentSpeedDataJSON = await SystemInformationHelper.cpuCurrentSpeedDataJSON();
        let cpuTemperatureDataJSON = await SystemInformationHelper.cpuTemperatureDataJSON();
        let memDataJSON = await SystemInformationHelper.memDataJSON();
        let currentLoadDataJSON = await SystemInformationHelper.currentLoadDataJSON();
        let processesDataJSON = await SystemInformationHelper.processesDataJSON();
        let uptimeServerDataJSON = await SystemInformationHelper.uptimeServerDataJSON();
        let uptimeMachineDataJSON = await SystemInformationHelper.uptimeMachineDataJSON();
        let fsSize = await SystemInformationHelper.getFsSize();
        let networkStatsJSON = await SystemInformationHelper.getNetworkStatsJSON();
        let networkInterfacesJSON = await SystemInformationHelper.getNetworkInterfacesJSON();

        let allInformations = Object.assign(
            fsSize,
            cpuDataJSON,
            cpuCurrentSpeedDataJSON,
            cpuTemperatureDataJSON,
            memDataJSON,
            currentLoadDataJSON,
            processesDataJSON,
            uptimeServerDataJSON,
            uptimeMachineDataJSON,
            networkInterfacesJSON,
            networkStatsJSON,
        );

        let data = {
            "allInformations": allInformations,
            "allInformationsLastUpdateTime": new Date()
        };
        return data;
    }

    /**
     * Gets Informations about networks stats
     * @returns {Promise<{}|{networkStats: Systeminformation.NetworkStatsData[]}>}
     */
    static async getNetworkStatsJSON() {
        try {
            let data = await si.networkStats();
            return {"networkStats": data};
        } catch (e) {
            return {};
        }
    }

    /**
     * Gets informations about Network interfaces
     * @returns {Promise<{networkInterfaces: Systeminformation.NetworkInterfacesData[]}|{}>}
     */
    static async getNetworkInterfacesJSON() {
        try {
            let data = await si.networkInterfaces();
            return {"networkInterfaces": data};
        } catch (e) {
            return {};
        }
    }

    /**
     * Gets infromations about the disk utility
     * @returns {Promise<{fileSystem: Systeminformation.FsSizeData[]}|{}>}
     */
    static async getFsSize() {
        try {
            let data = await si.fsSize();
            return {"fileSystem": data};
        } catch (e) {
            return {};
        }
    }

    /**
     * Gets informations about the CPU
     * @returns {Promise<{}|{speedmax: string, speed: string}>}
     */
    static async cpuDataJSON() {
        try {
            let data = await si.cpu();
            let speed = data.speed;
            let speedmax = data.speedmax;
            return {
                "speed": speed,
                "speedmax": speedmax
            };
        } catch (e) {
            return {};
        }
    }

    /**
     * Gets information about the averate CPU Speed
     * @returns {Promise<{avg: string}|{}>}
     */
    static async cpuCurrentSpeedDataJSON() {
        try {
            let data = await si.cpuCurrentspeed();
            let avg = data.avg;
            return {
                "avg": avg
            };
        } catch (e) {
            return {};
        }
    }

    /**
     * Gets Informations about the cpu Temperature
     * @returns {Promise<{}|{max: number, main: number}>}
     */
    static async cpuTemperatureDataJSON() {
        try {
            let data = await si.cpuTemperature();
            let main = data.main;
            let max = data.max;
            return {
                "main": main,
                "max": max
            };
        } catch (e) {
            return {};
        }
    }

    /**
     * Gets information about the total memory
     * @returns {Promise<{}|{total: number, available: number}>}
     */
    static async memDataJSON() {
        try {
            let data = await si.mem();
            let total = data.total;
            let available = data.available;
            return {
                "total": total,
                "available": available
            };
        } catch (e) {
            return {};
        }
    }

    /**
     * Gets information about the used memory by the user and the average load
     * @returns {Promise<{}|{currentload_user: number, avgload: number, currentload: number}>}
     */
    static async currentLoadDataJSON() {
        try {
            let data = await si.currentLoad();
            let avgload = data.avgload;
            let currentload = data.currentload;
            let currentload_user = data.currentload_user;
            return {
                "avgload": avgload,
                "currentload": currentload,
                "currentload_user": currentload_user
            };
        } catch (e) {
            return {};
        }
    }

    /**
     * Gets information if the process is running
     * @returns {Promise<{}|{running: number}>}
     */
    static async processesDataJSON() {
        try {
            let data = await si.processes();
            let running = data.running;
            return {
                "running": running
            };
        } catch (e) {
            return {};
        }
    }

    static async uptimeServerDataJSON(){
        let uptime = process.uptime();
        return {
            "uptimeServer": uptime
        };
    }

    /**
     * Gets information about the uptime of the machine itself
     * @returns {Promise<{uptime: string}>}
     */
    static async uptimeMachineDataJSON() {
        let timeData = si.time();
        let uptime = timeData.uptime;
        return {
            "uptimeMachine": uptime
        };
    }

}
