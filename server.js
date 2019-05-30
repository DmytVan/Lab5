var express = require("express");
var app = express();
var fs = require('fs');
const request = require('request');

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//serve static file (index.html, images, css)
app.use(express.static(__dirname + '/views'));

app.post('/', function (req, res) {
    fs.writeFileSync('views/weather.json', JSON.stringify(req.body))
});

var port = process.env.PORT || 3000
app.listen(port, function () {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});

var weathers = {};
var updatesCount = 0;

function getWeather() {
    request({
        method: 'GET',
        url: 'https://api.worldweatheronline.com/premium/v1/weather.ashx?key=606e7602fa92492fbc8122243192805&q=Odessa,Ukraine&num_of_days=5&tp=3&format=json',

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            updatesCount++;
            setDataInBD(body);
        }
    });

}

function setDataInBD(body) {
    weathers['updates'] = updatesCount;
    weathers['lastUpdate'] = new Date();
    var obj = JSON.parse(body);
    for (var i = 0; i < obj.data.weather.length; i++) {
        const day = obj.data.weather[i];
        weathers[day.date] = {};
        weathers[day.date]['temp_C'] = day.maxtempC;
        weathers[day.date]['astronomy'] = {};
        weathers[day.date]['astronomy']['sunrise'] = day.astronomy[0].sunrise;
        weathers[day.date]['astronomy']['sunset'] = day.astronomy[0].sunset;
        weathers[day.date]['astronomy']['moonrise'] = day.astronomy[0].moonrise;
        weathers[day.date]['astronomy']['moonset'] = day.astronomy[0].moonset;
        weathers[day.date]['hourly'] = {};
        for(var j = 0; j <day.hourly.length; j++) {
            weathers[day.date]['hourly'][day.hourly[j].time] = {};
            weathers[day.date]['hourly'][day.hourly[j].time]['tempC'] = day.hourly[j].tempC;
            weathers[day.date]['hourly'][day.hourly[j].time]['chanceofrain'] = day.hourly[j].chanceofrain;
            weathers[day.date]['hourly'][day.hourly[j].time]['weatherIconUrl'] = day.hourly[j].weatherIconUrl[0].value;
            weathers[day.date]['hourly'][day.hourly[j].time]['weatherDesc'] = day.hourly[j].weatherDesc[0].value;
        }

    }
    console.log(weathers);
    fs.writeFileSync('views/weather.json', JSON.stringify(weathers))
}

getWeather();

setInterval(getWeather,1000*60*60);




