var restify = require("restify");
var fs = require("fs");
var AJAXManager = require("./managers/AJAXManager");
var CacheManager = require("./managers/CacheManager");
const { resolve } = require("path");

//placeholder for the html files
var files = {};

var server = restify.createServer({
    name: "about-me",
    version: "1.0.0"
});

var config = {};

var oCache = new CacheManager();
var oAJAXManager = new AJAXManager(oCache);

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

//initial calling function
function init(callback) {
    fs.readFile(__dirname + "/public/landing.html", "utf8" , function(err,data) {
        if(err) {
            console.log(err);
        } else {
            files["landing"] = data;
        }
    });
    fs.readFile(__dirname + "/site.config", "utf8", function(err, data) {
        try {
            config = JSON.parse(data);
        } catch(e) {
            console.log("There was an error retrieving the site config:" + e);
        }
    });
    callback();
}

init(function() {
    //This will be our landing page endpoint
    server.get("/", function(req,res,next) {
        res.header("Content-Type", "text/html");
        res.write(files.landing);
        res.end();
        return next();
    });

    //this endpoint will let you add in a To-do event to our list
    server.post("/addEvent", function(req,res,next) {
        return next();
    });

    /**
     * This endpoint will return the current weather for Lincoln, NE
     */
    server.get("/getWeather", function(req,res,next) {
        oAJAXManager.GetWeather(config, function(weather) {
            res.write(JSON.stringify(weather));
            res.end();
            return next();
        });
    });

    server.get("/getLandingImage", function(req,res,next) {
        //get the landing page image from the directory
        AJAXManager.GetLandingPageImage(config, function(img) {
            res.send(200, img.data, {
                //make sure to specify the correct content type depending on the images extension
                "Content-Type": "image/" + img.ext.toLowerCase()
            });
            res.end();
            return next();
        });
    });

    server.get("/getTopStories", function(req,res,next) {
        //if we have a list of RSS feeds for the NYT to use
        if(config.NYTRssFeeds) {
            var promisesToMake = [];
            for(var i = 0; i < config.NYTRssFeeds.length; i++) {
                var rssFeedURL = config.NYTRssFeeds[i];
                //wrap each call in a promise, so that we can resolve them all at the same time
                promisesToMake.push(new Promise((resolve, reject) => {
                    AJAXManager.GetTopStories(3, rssFeedURL, function(stories) {
                        if(stories.success) {
                            resolve(stories.stories);
                        } else {
                            reject(stories);
                        }
                    });
                }));
            }
            //wait for all these promises to resolve, then concatenate the results
            Promise.all(promisesToMake).then(function(results) {
                results = results.flat();
                res.send(200, results, {
                    "Content-Type": "application/json"
                });
                res.end();
                return next();
            }).catch(function(error) {
                res.send(200, error);
                res.end();
                return next();
            });
        }
    });

    /**
     * This endpoint will return the welcome message to use on the landing page.
     */
    server.get("/getWelcomeMessage", function(req,res,next) {
        var returnObject = AJAXManager.GetWelcomeMessage();
        res.write(JSON.stringify(returnObject));
        res.end();
        return next();
    });

    server.get("/getMarketData", function(req,res,next) {
        oAJAXManager.GetMarketData(config, function(marketData) {
            res.send(200, marketData, {
                "Content-Type": "application/json"
            });
            res.end();
            return next();
        });
    });

    // catch-all for static content
    server.get("*", restify.plugins.serveStatic({
        directory: "./public"
    }));

    server.listen(process.env.PORT || 3000,function() {
        console.log("launched");
    });
});