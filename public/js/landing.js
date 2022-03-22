$(document).ready(function() {
    getWelcomeMessage();
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