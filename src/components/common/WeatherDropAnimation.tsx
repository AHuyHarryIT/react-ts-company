import { useEffect, useMemo, useState, type CSSProperties } from 'react';

type WeatherDropMood = 'rain' | 'sun';

type ForecastResponse = {
  current?: {
    precipitation?: number;
    rain?: number;
    showers?: number;
    weather_code?: number;
  };
};

const COMPANY_WEATHER_COORDINATES = {
  latitude: 10.8231,
  longitude: 106.6297
};

const RAIN_WEATHER_CODES = new Set([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99
]);

const getMoodFromForecast = (forecast: ForecastResponse): WeatherDropMood => {
  const current = forecast.current;
  if (!current) return 'sun';

  const hasRainAmount =
    (current.precipitation ?? 0) > 0 ||
    (current.rain ?? 0) > 0 ||
    (current.showers ?? 0) > 0;

  if (hasRainAmount) return 'rain';

  return RAIN_WEATHER_CODES.has(current.weather_code ?? -1) ? 'rain' : 'sun';
};

const fetchWeatherMood = async (
  signal: AbortSignal
): Promise<WeatherDropMood> => {
  const params = new URLSearchParams({
    latitude: String(COMPANY_WEATHER_COORDINATES.latitude),
    longitude: String(COMPANY_WEATHER_COORDINATES.longitude),
    current: 'precipitation,rain,showers,weather_code',
    timezone: 'Asia/Ho_Chi_Minh'
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    { signal }
  );

  if (!response.ok) return 'sun';

  return getMoodFromForecast((await response.json()) as ForecastResponse);
};

const getPreviewMood = (): WeatherDropMood | null => {
  const preview = new URLSearchParams(window.location.search).get(
    'weatherAnimation'
  );

  return preview === 'rain' || preview === 'sun' ? preview : null;
};

const getAnimationShownKey = () => {
  const sessionId = localStorage.getItem('auth_session_id');
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  return `weather-animation-shown:${sessionId || token || user || 'current'}`;
};

export default function WeatherDropAnimation() {
  const [mood, setMood] = useState<WeatherDropMood | null>(null);

  const drops = useMemo(
    () =>
      Array.from({ length: 32 }, (_, index) => ({
        id: index,
        delay: `${(index % 12) * 0.09}s`,
        duration: `${2.65 + (index % 5) * 0.18}s`,
        left: `${(index * 19) % 100}%`,
        size: 8 + (index % 5) * 2,
        drift: `${-10 - (index % 4) * 4}vw`,
        opacity: 0.38 + (index % 5) * 0.06
      })),
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    const previewMood = getPreviewMood();
    const shownKey = getAnimationShownKey();

    if (previewMood) {
      setMood(previewMood);
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    if (localStorage.getItem(shownKey) === '1') {
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    fetchWeatherMood(controller.signal)
      .then((nextMood) => {
        if (isMounted) {
          localStorage.setItem(shownKey, '1');
          setMood(nextMood);
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.setItem(shownKey, '1');
          setMood('sun');
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (!mood) return null;

  return (
    <div
      key={mood}
      className={`weather-drop-animation weather-drop-animation--${mood}`}
      aria-hidden="true"
    >
      {mood === 'rain'
        ? drops.map((drop, index) => (
            <span
              key={drop.id}
              className="weather-drop-animation__rain-drop"
              style={
                {
                  left: drop.left,
                  width: `${drop.size * 3}px`,
                  height: `${drop.size * 3}px`,
                  fontSize: `${drop.size * 3}px`,
                  '--weather-drop-delay': drop.delay,
                  '--weather-drop-drift': drop.drift,
                  '--weather-drop-duration': drop.duration,
                  '--weather-drop-opacity': drop.opacity + 0.18
                } as CSSProperties
              }
            >
              {index % 3 === 0 ? '⛈️' : '🌧️'}
            </span>
          ))
        : drops.map((drop, index) => (
            <span
              key={drop.id}
              className="weather-drop-animation__sun-drop"
              style={
                {
                  left: drop.left,
                  width: `${drop.size * 2.8}px`,
                  height: `${drop.size * 2.8}px`,
                  fontSize: `${drop.size * 2.8}px`,
                  '--weather-drop-delay': drop.delay,
                  '--weather-drop-drift': drop.drift,
                  '--weather-drop-duration': drop.duration,
                  '--weather-drop-opacity': drop.opacity + 0.08
                } as CSSProperties
              }
            >
              {index % 3 === 0 ? '🌤️' : '☀️'}
            </span>
          ))}
    </div>
  );
}
