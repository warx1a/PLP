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

    static GetWeather() {
        var returnObject = {
            success: false,
            message: ""
        };
        //this function will call the weather API, and return it in a format we like
        if(config.OpenWeatherMapAPIKey) {
            if(config.LincolnNELatLon) {
                var lat = config.LincolnNELatLon.Lat;
                var lon = config.LincolnNELatLon.Lon;
                var key = config.OpenWeatherMapAPIKey;
                var returnData = [];
                var ajaxCall = https.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`, function(ajaxRes) {
                    ajaxRes.on("data", function(chunk) {
                        returnData.push(chunk);
                    });
                    ajaxRes.on("error", function(e) {
                        console.log(e);
                    });
                    ajaxRes.on("end", function() {
                        var body = Buffer.concat(returnData).toString();
                        //TODO: figure out what to do w/ this body
                        returnObject.success = true;
                        return returnObject;
                    });
                    ajaxCall.on("error", function(err) {
                        returnObject.message = err;
                    });
                }).on("error", function(err2) {
                    returnObject.message = err2;
                });
            } else {
                returnObject.message = "The latitude/longitude couldn't be retrieved for the current location"
            }
        } else {
            returnObject.message = "We couldn't parse the config file, so the API key is invalid"
        }
        return returnObject;
    }

}

module.exports = AJAXManager;