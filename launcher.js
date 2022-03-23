var restify = require("restify");
var fs = require("fs");
var AJAXManager = require("./managers/AJAXManager");

//placeholder for the html files
var files = {};

var server = restify.createServer({
    name: "about-me",
    version: "1.0.0"
});

var config = {};

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
        AJAXManager.GetWeather(config, function(weather) {
            res.write(JSON.stringify(weather));
            res.end();
            return next();
        });
    });

    server.get("/getLandingImage", function(req,res,next) {
        //TODO: add in logic to read the collage directory
        AJAXManager.GetLandingPageImage(config, function(img) {
            res.send(200, img.data, {
                "Content-Type": "image/" + img.ext.toLowerCase()
            });
            res.end();
            return next();
        });
    });

    server.get("/getTopStories", function(req,res,next) {
        AJAXManager.GetTopStories(3, function(stories) {
            res.send(200, stories, {
                "Content-Type": "application/json"
            });
            res.end();
            return next();
        });
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

    // catch-all for static content
    server.get("*", restify.plugins.serveStatic({
        directory: "./public"
    }));

    server.listen(process.env.PORT || 3000,function() {
        console.log("launched");
    });
});