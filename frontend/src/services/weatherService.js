const axios = require('axios');

class WeatherService {
  constructor() {
    // Using OpenWeatherMap API (free tier available)
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.apiKey = process.env.OPENWEATHER_API_KEY; // Get from openweathermap.org
  }

  async getForecast(city, state) {
    try {
      // Get coordinates first
      const geoResponse = await axios.get(`${this.baseURL}/weather`, {
        params: {
          q: `${city},${state},IN`,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const { lat, lon } = geoResponse.data.coord;

      // Get 5-day forecast
      const forecastResponse = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.formatForecastData(forecastResponse.data);
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      
      // Fallback to mock data
      return this.getMockForecastData();
    }
  }

  formatForecastData(data) {
    const dailyForecasts = {};

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: item.dt * 1000,
          temp: {
            min: item.main.temp_min,
            max: item.main.temp_max,
            avg: item.main.temp
          },
          humidity: item.main.humidity,
          weather: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          windSpeed: item.wind.speed,
          rainfall: item.rain ? item.rain['3h'] || 0 : 0
        };
      } else {
        dailyForecasts[date].temp.min = Math.min(dailyForecasts[date].temp.min, item.main.temp_min);
        dailyForecasts[date].temp.max = Math.max(dailyForecasts[date].temp.max, item.main.temp_max);
        dailyForecasts[date].rainfall += item.rain ? item.rain['3h'] || 0 : 0;
      }
    });

    return Object.values(dailyForecasts).slice(0, 5);
  }

  getMockForecastData() {
    const forecasts = [];
    const weatherTypes = ['Clear', 'Clouds', 'Rain', 'Thunderstorm'];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecasts.push({
        date: date.getTime(),
        temp: {
          min: 20 + Math.random() * 5,
          max: 30 + Math.random() * 5,
          avg: 25 + Math.random() * 5
        },
        humidity: 60 + Math.random() * 20,
        weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
        description: 'Partly cloudy',
        icon: '02d',
        windSpeed: 5 + Math.random() * 10,
        rainfall: Math.random() > 0.7 ? Math.random() * 10 : 0
      });
    }

    return forecasts;
  }

  async getCurrentWeather(city, state) {
    try {
      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          q: `${city},${state},IN`,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return {
        temp: response.data.main.temp,
        feelsLike: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        weather: response.data.weather[0].main,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        windSpeed: response.data.wind.speed
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }
}

module.exports = new WeatherService();