const fetch = require("node-fetch");

/**
 * A Helper for Prom Metrics Parsing
 */
export default class MetricsHelper {

    static async getMetrics(req){
	let authDyn = req.headers.authorization;
		let fullUrl = req.protocol + '://' + req.get('host')+"/metrics/metrics";
        let response = await fetch(fullUrl,{
            method: 'GET',
            headers: {
                  authorization: authDyn,
            }
        });
        let text = await response.text();
        let parsed = MetricsHelper.parseMetrics(text);
	return parsed;
    }

    static parseMetrics(rawMetrics){
	rawMetrics = rawMetrics.replace(/"/g, "'");
	let splits = rawMetrics.split("\n");

	//filter comments and empty lines
	let withoutComments = [];
	for(let i=0; i<splits.length; i++){
	let row = splits[i];
	if(row.length > 0 && !row.startsWith("#")){
	    withoutComments.push(row);
	}
	}

	let keyValues = {};
	for(let i=0; i<withoutComments.length; i++){
		let rowSplit = withoutComments[i].split(" ");
		let key = rowSplit[0];
		let value = rowSplit[1];
		let matchPath = key.match(/path='.*?'/g);
		if(!!matchPath && matchPath.length > 0){
		    let pathKey = matchPath[0].replace(/path='/g,"").replace(/'/g,"");
		    keyValues["path"] = keyValues["path"] || {};
		    keyValues["path"][pathKey] = keyValues["path"][pathKey] || {};

		    let method = key.match(/method='.*?'/g)[0].replace(/method='/g,"").replace(/'/g,"");
		    keyValues["path"][pathKey][method] = keyValues["path"][pathKey][method] || {};


		    let status_code = key.match(/status_code='.*?'/g)[0].replace(/status_code='/g,"").replace(/'/g,"");
		    keyValues["path"][pathKey][method][status_code] = keyValues["path"][pathKey][method][status_code] || {};


		    if(key.startsWith("http_request_duration_seconds_bucket")){
		        let bucket = key.match(/le='.*?'/g)[0].replace(/le='/g,"").replace(/'/g,"");
		        keyValues["path"][pathKey][method][status_code]["buckets"] = keyValues["path"][pathKey][method][status_code]["buckets"] || {};
		        keyValues["path"][pathKey][method][status_code]["buckets"][bucket] = value;
		    }
		    if(key.startsWith("http_request_duration_seconds_sum")){
		        keyValues["path"][pathKey][method][status_code]["sum"] = value;
		    }
		    if(key.startsWith("http_request_duration_seconds_count")){
		        keyValues["path"][pathKey][method][status_code]["count"] = value;
		    }
		} else {
		    keyValues[key] = value;
		}
	}

        return keyValues;
    }

}
