import {ServerProxy} from "nsfw-proxy";

export default class DefaultProxyServer{

    static DEFAULT_CONFIG = {
        "ssl": {
            "privkeyPath" : "",
            "certPath": ""
        },
        "uploads": {
            "maxBodyUploadSizeInMb": 50
        },
        "server": {
            "api_server_domain": "localhost:3001",
            "server_api_metrics": "localhost:9999/metrics/metrics",
            "server_frontend_domain": "localhost:3000"
        }
    }

    static start(config=null){
        if(!config){
            config = DefaultProxyServer.DEFAULT_CONFIG;
        }

        let server = new ServerProxy(config);
        server.start();
    }

}
