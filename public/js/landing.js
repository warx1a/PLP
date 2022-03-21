$(document).ready(function() {

});

function getUpdatedWeather() {
    var xhrWeatherRequest = new XMLHttpRequest();
    xhrWeatherRequest.onload = function() {
        var body = this;
        var test = "";
    };
    xhrWeatherRequest.open("GET", "/getWeather");
}