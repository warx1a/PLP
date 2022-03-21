var https = require("https");

class AJAXManager {

    

    constructor() {}

    static GetWelcomeMessage() {
        var currentTimeOfDay = new Date(Date.now());
        var currentHour = currentTimeOfDay.getHours();
        var startOfString = "";
        //determine which starting to use for the message
        if(currentHour >= 0 && currentHour < 12) {
            startOfString = "Good morning"
        } else if(currentHour >= 12 && currentHour < 18) {
            startOfString = "Good afternoon"
        } else {
            startOfString = "Good evening"
        }
        var returnObject= {
            success: true,
            valueToUse: (startOfString + " Luther Jensen")
        };
        return returnObject;
    }

    static GetWeather(config, callback) {
        var returnObject = {};
        //this function will call the weather API, and return it in a format we like
        if(config.OpenWeatherMapAPIKey) {
            if(config.LincolnNELatLon) {
                var lat = config.LincolnNELatLon.Lat;
                var lon = config.LincolnNELatLon.Lon;
                var key = config.OpenWeatherMapAPIKey;
                var returnData = [];
                var urlToUse = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Lincoln%2C%20NE?unitGroup=metric&include=current%2Cdays&key=VHHD6G35YZ6VVD976WCDCQ2HS&contentType=json"
                var ajaxCall = https.get(urlToUse, function(ajaxRes) {
                    ajaxRes.on("data", function(chunk) {
                        returnData.push(chunk);
                    });
                    ajaxRes.on("error", function(e) {
                        console.log(e);
                    });
                    ajaxRes.on("end", function() {
                        var body = Buffer.concat(returnData).toString();
                        returnObject.data = body;
                        returnObject.success = true;
                        callback(returnObject);
                    });
                }).on("error", function(err2) {
                    returnObject.message = err2.message;
                    callback(returnObject);
                });
            } else {
                returnObject.message = "The latitude/longitude couldn't be retrieved for the current location"
                callback(returnObject);
            }
        } else {
            returnObject.message = "We couldn't parse the config file, so the API key is invalid"
            callback(returnObject);
        }
    }

}

module.exports = AJAXManager;