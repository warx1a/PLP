var https = require("https");
var fs = require("fs");
var xmlParser = require("fast-xml-parser");
const { syncBuiltinESMExports } = require("module");

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
                var urlToUse = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Lincoln%2C%20NE?unitGroup=us&include=current%2Cdays&key=VHHD6G35YZ6VVD976WCDCQ2HS&contentType=json"
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

    static GetLandingPageImage(config, callback) {
        var returnImg = {};
        if(config.PhotoStorageDirectory) {
            var allFiles = [];
            var files = fs.readdirSync(config.PhotoStorageDirectory);
            files.forEach(function(file) {
                allFiles.push(file);
            });
            var randIdx = parseInt(Math.random() * allFiles.length);
            var chosenFile = allFiles[randIdx];
            var imgBuffer = fs.readFileSync(config.PhotoStorageDirectory + chosenFile, "base64");
            returnImg.data = "data:image/png;base64," + imgBuffer;
            returnImg.ext = chosenFile.substr(chosenFile.indexOf(".") + 1);
            callback(returnImg);
        }
    }

    static GetTopStories(storyCount, callback) {
        var sNYTRSSFeed = "https://rss.nytimes.com/services/xml/rss/nyt/World.xml";
        var returnData = [];
        var ajaxCall = https.get(sNYTRSSFeed, function(ajaxRes) {
            ajaxRes.on("data", function(chunk) {
                returnData.push(chunk);
            });
            ajaxRes.on("error", function(e) {
                console.log(e);
            });
            ajaxRes.on("end", function() {
                var retData = Buffer.concat(returnData).toString();
                var oParser = new xmlParser.XMLParser();
                var jResp = oParser.parse(retData);
                var jDataToReturn = {
                    stories: []
                };
                //if we have a RSS channel returned, and if it has items
                if(jResp.rss.channel) {
                    if(jResp.rss.channel.item.length > 0) {
                        for(var i = 0; i < Math.min(jResp.rss.channel.item.length, storyCount); i++) {
                            var oStory = jResp.rss.channel.item[i];
                            jDataToReturn.stories.push({
                                title: oStory.title,
                                link: oStory.link,
                                from: oStory["dc:creator"]
                            });
                        }
                        callback(jDataToReturn);
                    }
                }
            });
        }).on("error", function(err) {
            callback(err);
        });
    }

}

module.exports = AJAXManager;