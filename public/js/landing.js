$(document).ready(function() {
    getWelcomeMessage();
    getLandingPageImage();
    getTopStories();
    getUpdatedWeather();
    GetMarketData();
});
/**
 * Calls the AJAX function to get the latest weather
 * @param {int} [nMaxDays=5] - Max days to show
 */
function getUpdatedWeather(nMaxDays = 5) {
    var xhrWeatherRequest = new XMLHttpRequest();
    xhrWeatherRequest.onload = function() {
        var jResp = JSON.parse(this.response);
        //if we have a successful response
        if(jResp.success) {
            var jWeatherData = JSON.parse(jResp.data);
            var currentWeather = jWeatherData.currentConditions;
            var currentTemp = currentWeather.temp + " °F";
            var currentConditions = currentWeather.conditions;
            var sIcon = currentWeather.icon;
            var sIconSRC = `./weatherIcons/${sIcon}.svg`;
            //clear out the condition holder, so we can add in the updated conditions
            $(".condition-holder").empty();
            var iconImg = document.createElement("img");
            iconImg.className = "weather-icon";
            iconImg.src = sIconSRC;
            $(".condition-holder").append(iconImg);
            $("#spnCurrentTemp").text(currentTemp);
            $("#spnCurrentDesc").text(currentConditions);
            //add in the future weather elements too
            var daysData = jWeatherData.days;
            $(".future-weather").empty();
            for(var i = 0; i < Math.min(nMaxDays, daysData.length); i++) {
                var dayData = daysData[i];
                addDaysWeather(dayData);
            }
        }
    };
    xhrWeatherRequest.open("GET", "/getWeather");
    xhrWeatherRequest.send();
}

/**
 * Calls the AJAX function to get the welcome message (ex: Good Morning/Afternoon/Evening)
 */
function getWelcomeMessage() {
    var xhrWelcomeRequest = new XMLHttpRequest();
    xhrWelcomeRequest.onload = function() {
        var resp = JSON.parse(this.response);
        if(resp.success) {
            $("#welcomeMessage").text(resp.valueToUse);
        }
    }
    xhrWelcomeRequest.open("GET", "/getWelcomeMessage");
    xhrWelcomeRequest.send();
    //set the current day for this part
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    var sParsedDateVal = `Today's date is ${month}/${day}/${year}`;
    $("#dateHeader").text(sParsedDateVal);
}

/**
 * Calls the AJAX function to get a random landing page image
 */
function getLandingPageImage() {
    var xhrLandingImageReq = new XMLHttpRequest();
    xhrLandingImageReq.onload = function() {
        var img = document.createElement("img");
        img.src = this.response;
        img.className = "main-section-img";
        img.width = $(".main-section-holder").width();
        img.height = $(".main-section-holder").height();
        $(".main-section-holder").append(img);
    }
    xhrLandingImageReq.open("GET", "/getLandingImage");
    xhrLandingImageReq.send();
}

/**
 * Call the AJAX function to get the top stories
 */
function getTopStories() {
    var xhrNewsRequest = new XMLHttpRequest();
    xhrNewsRequest.onload = function() {
        $(".news-holder").empty();
        var resp = JSON.parse(this.response);
        for(var i = 0; i < resp.length; i++) {
            var story = resp[i];
            addNewsElement(story.title, story.link);
        }
        //start auto scrolling the news section if we need to
        beginAutoscrollOfNews(10);
    }
    xhrNewsRequest.open("GET", "/getTopStories");
    xhrNewsRequest.send();
}

/**
 * This function will add in a new news element to the news section
 * @param {string} title 
 * @param {string} link 
 */
function addNewsElement(title, link) {
    var storyHolder = document.createElement("div");
    var storyTitle = document.createElement("span");
    var storyLink = document.createElement("a");
    storyHolder.className = "news-article";
    storyLink.href = link;
    storyLink.target = "_blank";
    storyLink.innerText = title;
    storyTitle.appendChild(storyLink);
    storyHolder.appendChild(storyTitle);
    $(".news-holder").append(storyHolder);
}

/**
 * This function will auto scroll the news section, and will have it shift up and down to show all available stories
 * @param {int} scrollPeriodSeconds 
 */
function beginAutoscrollOfNews(scrollPeriodSeconds) {
    var newsHolder = $(".news-holder");
    var newsSectionHeight = newsHolder.outerHeight();
    var cumulativeArticleHeight = 0;
    //calculate the height of all the articles stacked up
    for(var i = 0; i < newsHolder.children().length; i++) {
        var article = newsHolder.children()[i];
        var articleHeight = $(article).outerHeight();
        cumulativeArticleHeight += articleHeight;
    }
    //if the section height is less then all the articles, then we know we need to scroll on it
    if(newsSectionHeight < cumulativeArticleHeight) {
        var distanceToScroll = cumulativeArticleHeight - newsSectionHeight;
        //divide the total by 4, since we want to run the function every quarter second
        var nAmountToScrollBy = Math.max(1, parseInt((distanceToScroll / scrollPeriodSeconds) / 4));
        var bScrollingDown = true;
        //var bAtBottom = newsHolder.scrollTop - (newsHolder.scrollHeight - newsHolder.offsetHeight) == 0;
        setInterval(function() {
            var bAtBottom = newsHolder[0].scrollTop - (newsHolder[0].scrollHeight - newsHolder[0].offsetHeight) == 0;
            var bAtTop = newsHolder[0].scrollTop == 0;
            if(!bAtBottom && bScrollingDown) {
                newsHolder[0].scrollBy(0, parseInt(nAmountToScrollBy));
            } else {
                if(bAtBottom) {
                    bScrollingDown = false;
                }
            }
            if(!bAtTop && !bScrollingDown) {
                newsHolder[0].scrollBy(0, parseInt(nAmountToScrollBy * -1));
            } else {
                if(bAtTop) {
                    bScrollingDown = true;
                }
            }
        }, 250);
    }
}

/**
 * This function will add in the day's weather to our weather section on the bottom
 * @param {JSON} jWeatherData 
 */
function addDaysWeather(jWeatherData) {
    var parsedDate = new Date(jWeatherData.datetime);
    var formattedDate = (parsedDate.getMonth() + 1) + "/" + parsedDate.getDate();
    var daysTemp = jWeatherData.temp + " °F";;
    var daysIcon = jWeatherData.icon;
    var sIconSRC = `./weatherIcons/${daysIcon}.svg`;
    var daysCondition = jWeatherData.conditions;
    var divDayHolder = document.createElement("div");
    var tempHolder = document.createElement("div");
    var conditionHolder = document.createElement("div");
    var dateHolder = document.createElement("div");
    divDayHolder.className = "weather-day-holder";
    dateHolder.innerText = formattedDate;
    dateHolder.className = "day-date";
    conditionHolder.innerText = daysCondition;
    tempHolder.innerText = daysTemp;
    tempHolder.className = "day-temp-holder";
    var dayIconHolder = document.createElement("img");
    dayIconHolder.src = sIconSRC;
    dayIconHolder.className = "day-weather-icon";
    divDayHolder.appendChild(dayIconHolder);
    divDayHolder.appendChild(tempHolder);
    divDayHolder.appendChild(conditionHolder);
    divDayHolder.appendChild(dateHolder);
    $(".future-weather").append(divDayHolder);
}

function GetMarketData() {
    var xhrMarketRequest = new XMLHttpRequest();
    xhrMarketRequest.onload = function() {
        var marketData = this.response;
        var jMarketData = JSON.parse(marketData);
        //if we have BTC market data, add it to our view
        if(jMarketData.data && jMarketData.success) {
            for(var i = 0; i < jMarketData.data.length; i++) {
                var marketData = jMarketData.data[i];
                var startVal = marketData.previousCloseVal;
                var currVal = marketData.currentVal;
                var ciu = marketData.changeInUnits;
                var nUnitChange = parseInt(ciu);
                var sGainLossClass = nUnitChange > 0 ? "market-gain" : "market-loss";
                var marketSymbol = marketData.exchangeName.toLowerCase();
                $("#" + marketSymbol + "CurrentVal").text(currVal);
                $("#" + marketSymbol + "DownUp").text("(" + ciu + ")").parent().attr("class", sGainLossClass);
            }
            
        }
    };
    xhrMarketRequest.open("GET", "/getMarketData");
    xhrMarketRequest.send();
}