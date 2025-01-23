const CITY_API_KEY = 'HtDEbMZesRApQvlbxQ6BrA==HIBsT0Tp53svxQaE';
const WEATHER_API_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const CITY_API_BASE_URL = 'https://api.api-ninjas.com/v1/city';

const temp = document.getElementById("temp");
const dateTime = document.getElementById("date-time");
const mainIcon = document.getElementById("icon");
const currentLocation = document.getElementById("location");
const windSpeed = document.querySelector(".wind-speed");
const humidity = document.querySelector(".humidity");
const humidityStatus = document.querySelector(".humidity-status");
const searchForm = document.querySelector("#search");
const search = document.querySelector("#query");
const weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";

function getIcon(code) {
    const baseIconPath = "https://www.amcharts.com/wp-content/themes/amcharts4/css/img/icons/weather/animated/";
    const iconMapping = {
        0: `${baseIconPath}day.svg`, 
        1: `${baseIconPath}cloudy-day-1.svg`, 
        2: `${baseIconPath}cloudy-day-2.svg`, 
        3: `${baseIconPath}cloudy.svg`,
        45: `${baseIconPath}thunder.svg`, 
        48: `${baseIconPath}rainy-3.svg`,
        51: `${baseIconPath}rainy-1.svg`, 
        53: `${baseIconPath}rainy-2.svg`, 
        55: `${baseIconPath}rainy-3.svg`,
        61: `${baseIconPath}rainy-1.svg`, 
        63: `${baseIconPath}rainy-2.svg`, 
        65: `${baseIconPath}rainy-3.svg`,
        71: `${baseIconPath}snowy-1.svg`, 
        73: `${baseIconPath}snowy-2.svg`, 
        75: `${baseIconPath}snowy-3.svg`,
        95: `${baseIconPath}thunder.svg`
    };
    return iconMapping[code] || `${baseIconPath}day.svg`;
}

async function fetchCity(cityName) {
    try {
        const response = await fetch(`${CITY_API_BASE_URL}?name=${cityName}`, {
            headers: { 'X-Api-Key': CITY_API_KEY }
        });
        const data = await response.json();
        if (data.length === 0) throw new Error('Ville non trouvée');
        return data[0];
    } catch (error) {
        alert(error.message);
        return null;
    }
}

async function fetchWeather(lat, lon) {
    const url = `${WEATHER_API_BASE_URL}?latitude=${lat}&longitude=${lon}`
        + `&current_weather=true&hourly=temperature_2m,weathercode,relativehumidity_2m`
        + `&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    
    const response = await fetch(url);
    return await response.json();
}


function getMostFrequentWeatherCode(hourly, startTime) {
    const startIndex = hourly.time.findIndex(time => time.startsWith(startTime));
    const endIndex = startIndex + 24; 
    
    const dayWeatherCodes = hourly.weathercode.slice(startIndex, endIndex);
    const weatherCodeCounts = {};
    
    dayWeatherCodes.forEach(code => {
        weatherCodeCounts[code] = (weatherCodeCounts[code] || 0) + 1;
    });
    
    return parseInt(Object.keys(weatherCodeCounts).reduce((a, b) => 
        weatherCodeCounts[a] > weatherCodeCounts[b] ? a : b
    ));
}

async function getWeatherData(city) {
    try {
        const cityData = await fetchCity(city);
        if (!cityData) return;

        const weatherData = await fetchWeather(cityData.latitude, cityData.longitude);
        const current = weatherData.current_weather;
        const hourly = weatherData.hourly;
        const daily = weatherData.daily;
        const currentHourIndex = new Date(current.time).getHours();

        temp.innerText = Math.round(current.temperature);
        currentLocation.innerText = `${cityData.name}, ${cityData.country}`;
        windSpeed.innerText = Math.round(current.windspeed);
        
        humidity.innerText = `${hourly.relativehumidity_2m[currentHourIndex]}%`;
        humidityStatus.innerText = 
            hourly.relativehumidity_2m[currentHourIndex] <= 30 ? "Faible" : 
            hourly.relativehumidity_2m[currentHourIndex] <= 60 ? "Normal" : "Élevé";
        
        mainIcon.src = getIcon(current.weathercode);

        updateForecast(weatherData);

    } catch (error) {
        alert("Erreur de récupération des données météo");
    }
}

function updateForecast(weatherData) {
    const daily = weatherData.daily;
    const hourly = weatherData.hourly;
    weatherCards.innerHTML = "";
    
    for (let i = 0; i < 7; i++) {
        const card = document.createElement("div");
        card.classList.add("card", "text-center", "m-1");
        
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString("fr-FR", { weekday: "short" });
        const dayTemp = Math.round(daily.temperature_2m_max[i]);
        
        const weatherCode = getMostFrequentWeatherCode(hourly, daily.time[i]);
        
        card.innerHTML = `
            <div class="card-body">
                <h6 class="card-title">${dayName}</h6>
                <img src="${getIcon(weatherCode)}" class="card-img-top" style="max-height: 70px; object-fit: contain;">
                <p class="card-text">${dayTemp}°C</p>
            </div>
        `;
        weatherCards.appendChild(card);
    }
}


searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentCity = search.value.trim();
    getWeatherData(currentCity);
});



// getWeatherData("Paris");git init
