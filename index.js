const express = require("express");
const app = express();
const axios = require("axios");
const base_Url_city = "http://dataservice.accuweather.com/locations/v1/cities/search";
const base_Url_forecast = "http://dataservice.accuweather.com/forecasts/v1/daily/5day/";
const base_Url_Current = "http://dataservice.accuweather.com/currentconditions/v1/";
let port = process.env.PORT || 6969;

let cors = require("cors");
app.use(cors());
async function citySearch(city, api_key) {
	//! ------------------------------------------------ get city code form city name and timezone of the city--------------------------------------------------
	let url = `${base_Url_city}?apikey=${api_key}&q=${city}`;
	console.log(url);
	let response = await axios({
		url: url,
		method: "GET",
	});
	let key = response.data[0].Key;
	let timezone = response.data[0].TimeZone.Name;
	let localNameCity = response.data[0].EnglishName;
	let localNameCountry = response.data[0].Country.EnglishName;

	return [key, timezone, localNameCity, localNameCountry];
}
async function getForecast(code, temp, api_key) {
	//! -----------------------------------------------------get  5 days forecast data form accuweather ------------------------------------------------------
	let url = `${base_Url_forecast}${code}?apikey=${api_key}&details=true&metric=${temp}`;
	let response = await axios({
		url: url,
		method: "GET",
	});
	forecasts = response.data.DailyForecasts;
	return forecasts;
}

async function getCurrent(code, temp, api_Key) {
	//! ------------------------------------------------------ get current weather condition -----------------------------------------------------------------
	let url = `${base_Url_Current}${code}?apikey=${api_Key}&details=true`;
	let response = await axios({
		url: url,
		method: "GET",
	});
	let data = response.data[0];

	let Text = data.WeatherText;
	let Icon = data.WeatherIcon;
	let RelativeHumidity = data.RelativeHumidity;
	let Temperature = {};
	let FeelsLike = {};
	if (temp === "true") {
		Temperature = data.Temperature.Metric;
		FeelsLike = data.RealFeelTemperature.Metric;
	} else {
		Temperature = data.Temperature.Imperial;
		FeelsLike = data.RealFeelTemperature.Imperial;
	}
	return { Text, Icon, Temperature, FeelsLike, RelativeHumidity };
}

app.get("/citySearch", (req, res) => {
	let city = req.query.city;
	let temp = req.query.temp;
	let rand = Math.floor(Math.random() * 4) + 1;
	const API_KEY_ARR = [
		"I1jaBZ5gT5eW3J1UyA3zuYw5srDEvUGq",
		"98YADjlrd46gWHjmyd4hMeVEQsiPXJc9",
		"ZDIVyJU1slw3G2xM2vx35wVAEEChQVBx",
		"tPLxGepNrDQa6tnRo59SGGOif89Guy5s",
	];
	try {
		//! ------------------------------------------------------------- randomly select api  keys -------------------------------------------------------
		let api_Key = API_KEY_ARR[rand];
		citySearch(city, api_Key).then((data) => {
			console.log(api_Key);
			let citycode = data[0];
			let timezoneG = data[1];
			let localNameCity = data[2];
			let localNameCountry = data[3];
			getCurrent(citycode, temp, api_Key).then((data) => {
				let current = data;
				getForecast(citycode, temp, api_Key).then((data) => {
					let formattedData = data.map((data) => ({
						Date: data.Date,
						Temperature: data.Temperature,
						DayForecast: data.Day, // use only Icon for DayForecast
						SunTime: data.Sun,
						TimeZone: timezoneG,
						City: localNameCity,
						Country: localNameCountry,
						Current: current,
					}));
					res.json(formattedData); // provide formatted response.
					console.log("response send");
				});
			});
		});
	} catch (error) {
		// console.log(error);
	}
});

app.use("/", (req, res) => {
	res.send("homepage weather");
});
app.get("*", (req, res) => {
	res.sendStatus(404);
});
app.listen(port, () => {
	console.log("Server started at port 6969");
});
