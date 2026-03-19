import React, { useState, useEffect } from "react";
import "./App.css";

import cloudImg from "./assets/cloud.png";
import sunImg from "./assets/sun.png";
import moonImg from "./assets/moon.png";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [time, setTime] = useState(new Date());
  const [isCelsius, setIsCelsius] = useState(true);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const fetchWeather = async () => {
    if (!city) return;

    try {
      setLoading(true);
      setError("");
      setWeather(null);

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`
      );

      const data = await res.json();

      if (res.ok) {
        setWeather(data);
      } else {
        setError(data.message || "Cidade não encontrada");
      }
    } catch {
      setError("Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async (lat, lon) => {
    try {
      setLoading(true);
      setError("");
      setWeather(null);

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`
      );

      const data = await res.json();

      if (res.ok) {
        setWeather(data);
      } else {
        setError(data.message || "Erro na localização");
      }
    } catch {
      setError("Erro ao buscar localização");
    } finally {
      setLoading(false);
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByLocation(
          pos.coords.latitude,
          pos.coords.longitude
        );
      },
      () => setError("Permissão de localização negada")
    );
  };

  const toggleUnit = () => setIsCelsius(!isCelsius);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTemperature = () => {
    if (!weather) return "";

    const tempC = weather.main.temp;

    return isCelsius
      ? `${tempC.toFixed(1)}°C`
      : `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
  };

  const getWeatherIcon = () => {
    if (!weather) return "";

    const icon = weather.weather[0].icon;
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  const isDayTime = () => {
    if (!weather) return true;

    const nowUTC = Date.now() / 1000;
    const localTime = nowUTC + weather.timezone;

    const sunrise = weather.sys.sunrise;
    const sunset = weather.sys.sunset;

    return localTime >= sunrise && localTime < sunset;
  };

  const getBackgroundClass = () => {
    if (!weather) return "default";

    const main = weather.weather[0].main.toLowerCase();

    if (main.includes("cloud")) return "cloudy";
    if (main.includes("rain")) return "rainy";
    if (main.includes("clear")) return "sunny";

    return "default";
  };

  return (
    <div className={`app ${getBackgroundClass()} ${!isDayTime() ? "dark" : "light"}`}>
      <div className="sky">
        <img
          src={isDayTime() ? sunImg : moonImg}
          className="sun"
          alt="astro"
        />

        <img src={cloudImg} className="cloud cloud1" alt="cloud" />
        <img src={cloudImg} className="cloud cloud2" alt="cloud" />
      </div>

      <header className="header glass">
        <h1>Weather</h1>
      </header>

      <div className="search glass">
        <input
          placeholder="Digite a cidade..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
        />

        <button onClick={fetchWeather}>Buscar</button>
        <button onClick={handleLocation}>📍</button>
      </div>

      {loading && <div className="spinner"></div>}
      {error && <p className="error">{error}</p>}

      {weather && !loading && (
        <div className="card glass">
          <h2>{weather.name}</h2>

          <img src={getWeatherIcon()} alt="clima" />

          <div className="temp-row">
            <p className="temp">{getTemperature()}</p>

            <div
              className={`unit-toggle ${!isCelsius ? "fahrenheit" : ""}`}
              onClick={toggleUnit}
            >
              <span>°C</span>
              <span>°F</span>
            </div>
          </div>

          <p className="desc">{weather.weather[0].description}</p>
        </div>
      )}

      <footer className="footer">
        <div className="time-box">
          <div>
            {time.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
          <div className="hour">
            {time.toLocaleTimeString("pt-BR")}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;