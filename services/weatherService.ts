// Weather Service - Integrates with weather API
// TODO: Replace with actual weather API (OpenWeatherMap, WeatherAPI, etc.)

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  condition: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';
  description: string;
  icon: string;
  uvIndex: number;
  visibility: number;
  pressure: number;
  feelsLike: number;
  forecast: ForecastDay[];
  lastUpdated: Date;
}

export interface ForecastDay {
  date: Date;
  high: number;
  low: number;
  condition: WeatherData['condition'];
  precipitation: number;
}

// Mock weather data generator
export const fetchWeatherData = async (): Promise<WeatherData> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=YourCity&appid=YOUR_API_KEY`);
  
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour <= 18;
  
  const conditions: WeatherData['condition'][] = ['clear', 'cloudy', 'rain', 'storm', 'fog'];
  const condition = conditions[Math.floor(Math.random() * 3)]; // Bias towards good weather
  
  const baseTemp = isDay ? 24 : 18;
  const temperature = baseTemp + (Math.random() - 0.5) * 10;
  
  return {
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.round(45 + Math.random() * 30),
    windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10,
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    condition,
    description: getWeatherDescription(condition),
    icon: getWeatherIcon(condition, isDay),
    uvIndex: isDay ? Math.round(Math.random() * 11) : 0,
    visibility: Math.round(8 + Math.random() * 12),
    pressure: Math.round(1010 + (Math.random() - 0.5) * 20),
    feelsLike: Math.round((temperature + (Math.random() - 0.5) * 4) * 10) / 10,
    forecast: generateForecast(),
    lastUpdated: new Date(),
  };
};

const getWeatherDescription = (condition: WeatherData['condition']): string => {
  const descriptions = {
    clear: 'Clear skies',
    cloudy: 'Partly cloudy',
    rain: 'Light rain',
    storm: 'Thunderstorm',
    snow: 'Light snow',
    fog: 'Foggy conditions',
  };
  return descriptions[condition];
};

const getWeatherIcon = (condition: WeatherData['condition'], isDay: boolean): string => {
  const icons = {
    clear: isDay ? 'sun' : 'moon',
    cloudy: isDay ? 'cloud-sun' : 'cloud-moon',
    rain: 'cloud-rain',
    storm: 'cloud-lightning',
    snow: 'cloud-snow',
    fog: 'cloud-fog',
  };
  return icons[condition];
};

const generateForecast = (): ForecastDay[] => {
  const forecast: ForecastDay[] = [];
  const conditions: WeatherData['condition'][] = ['clear', 'cloudy', 'rain', 'clear', 'cloudy'];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    
    forecast.push({
      date,
      high: Math.round(22 + Math.random() * 8),
      low: Math.round(14 + Math.random() * 6),
      condition: conditions[i],
      precipitation: conditions[i] === 'rain' ? Math.round(Math.random() * 80) : Math.round(Math.random() * 20),
    });
  }
  
  return forecast;
};

// Weather impact on building calculations
export const calculateWeatherImpact = (weather: WeatherData) => {
  return {
    hvacLoad: weather.temperature > 26 ? 'high' : weather.temperature < 18 ? 'high' : 'normal',
    lightingNeeds: weather.condition === 'cloudy' || weather.condition === 'rain' ? 'increased' : 'normal',
    solarGeneration: weather.condition === 'clear' ? 'optimal' : weather.condition === 'cloudy' ? 'reduced' : 'minimal',
    ventilationAlert: weather.condition === 'storm' || weather.condition === 'fog',
  };
};

