$(document).ready(function() {
    getWelcomeMessage();
    getLandingPageImage();
    getTopStories();
});

function getUpdatedWeather() {
    var xhrWeatherRequest = new XMLHttpRequest();
    xhrWeatherRequest.onload = function() {
        var jResp = JSON.parse(this.response);
        if(jResp.success) {
            var jWeatherData = JSON.parse(jResp.data);
            var currentWeather = jWeatherData.currentConditions;
            var currentTemp = currentWeather.temp + " °F";
            var currentConditions = currentWeather.conditions;
            var sIcon = currentWeather.icon;
            var sIconSRC = `./weatherIcons/${sIcon}.svg`
            $(".condition-holder").empty();
            var iconImg = document.createElement("img");
            iconImg.className = "weather-icon";
            iconImg.src = sIconSRC;
            $(".condition-holder").append(iconImg);
            $("#spnCurrentTemp").text(currentTemp);
            $("#spnCurrentDesc").text(currentConditions);
        }
        var test = "";
    };
    xhrWeatherRequest.open("GET", "/getWeather");
    xhrWeatherRequest.send();
}

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

function getTopStories() {
    var xhrNewsRequest = new XMLHttpRequest();
    xhrNewsRequest.onload = function() {
        $(".news-holder").empty();
        var resp = JSON.parse(this.response);
        for(var i = 0; i < resp.length; i++) {
            var story = resp[i];
            addNewsElement(story.title, story.link);
        }
        beginAutoscrollOfNews(10);
    }
    xhrNewsRequest.open("GET", "/getTopStories");
    xhrNewsRequest.send();
}


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
        var nAmountToScrollBy = (distanceToScroll / scrollPeriodSeconds) / 4;
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