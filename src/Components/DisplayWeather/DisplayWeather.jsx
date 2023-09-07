import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import '../../styles/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faLocationDot,
  faMagnifyingGlass,
  faTemperatureFull,
} from '@fortawesome/free-solid-svg-icons';

const DisplayWeather = () => {
  const [weather, setWeather] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState('');

  const getWeatherData = async () => {
    const response = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=e009e2c5965449e2b07123559232707&q=${location}&days=3&aqi=yes&alerts=no`
    );
    if (response.status === 200) {
      const data = await response.json();
      if (data.location) {
        setWeather(data);
        setIsLoading(false);
      }
    }
  };

  const handleLocationInputChange = (event) => {
    setLocation(event.target.value);
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      getWeatherData();
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    const options = { weekday: 'long' };
    const dayName = new Intl.DateTimeFormat('en-US', options).format(date);

    return `${dayName}, ${day}-${month}`;
  };

  const calculateAQI = (concentration) => {
    return (concentration / 25) * 100;
  };

  let maxAQI = 0;

  let airQualityCategory = '';

  if (weather.current && weather.current['air_quality']) {
    const airQualityData = weather.current['air_quality'];

    const pm2_5Concentration = airQualityData['pm2_5'];
    maxAQI = calculateAQI(pm2_5Concentration);

    if (maxAQI >= 0 && maxAQI <= 50) {
      airQualityCategory = 'Good';
    } else if (maxAQI >= 51 && maxAQI <= 100) {
      airQualityCategory = 'Moderate';
    } else if (maxAQI >= 101 && maxAQI <= 150) {
      airQualityCategory = 'Unhealthy for Sensitive Groups';
    } else if (maxAQI >= 151 && maxAQI <= 200) {
      airQualityCategory = 'Unhealthy';
    } else if (maxAQI >= 201 && maxAQI <= 300) {
      airQualityCategory = 'Very Unhealthy';
    } else if (maxAQI >= 301 && maxAQI <= 500) {
      airQualityCategory = 'Hazardous';
    }
  }

  const calculateUVIndexCategory = (uvIndex) => {
    if (uvIndex <= 2) {
      return 'Low';
    } else if (uvIndex <= 5) {
      return 'Moderate';
    } else if (uvIndex <= 7) {
      return 'High';
    } else if (uvIndex <= 10) {
      return 'Very High';
    } else {
      return 'Extreme';
    }
  };

  const uvIndexCategory = calculateUVIndexCategory(weather?.current?.uv);

  const formatDateTime = (dateTime) => {
    const formattedDateTime = new Date(dateTime);

    const day = formattedDateTime.getDate().toString().padStart(2, '0');
    const month = (formattedDateTime.getMonth() + 1)
      .toString()
      .padStart(2, '0');
    const year = formattedDateTime.getFullYear();
    const hours = formattedDateTime.getHours().toString().padStart(2, '0');
    const minutes = formattedDateTime.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  const getCurrentHourIndex = () => {
    const currentHour = new Date().getHours();
    return weather?.forecast?.forecastday[0]?.hour.findIndex((item) => {
      const itemHour = parseInt(item.time.split(' ')[1].split(':')[0], 10);
      return itemHour === currentHour;
    });
  };

  const currentHourIndex = getCurrentHourIndex();

  const getHourlyData = () => {
    if (currentHourIndex !== undefined && currentHourIndex !== -1) {
      const currentDayHours = weather?.forecast?.forecastday[0]?.hour;
      const nextDayHours = weather?.forecast?.forecastday[1]?.hour.slice(0, 12);

      const hourlyData = [
        ...currentDayHours.slice(currentHourIndex),
        ...nextDayHours,
      ];

      return hourlyData;
    }

    return [];
  };

  const hourlyData = getHourlyData();

  return (
    <div className="p-5 appBackground">
      <div className="mainContainer">
        <Col md={3}>
          <div className="weatherDisplayContainer">
            <div className="my-3 searchDiv">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                onClick={getWeatherData}
                size="lg"
                className="ml-2 searchIconZoom"
              />
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Search city"
                value={location}
                onChange={handleLocationInputChange}
                onKeyDown={handleEnterKeyPress}
                className="m-2 searchBar"
              />
            </div>
            {weather?.current?.condition?.icon &&
            weather?.current?.condition?.text ? (
              <>
                <img
                  className="iconConditionSize"
                  alt="icon"
                  src={weather.current.condition.icon}
                />
              </>
            ) : null}
            {Object.keys(weather).length === 0 ? null : isLoading ? (
              <div>Currently Loading</div>
            ) : (
              <>
                <div className="weatherDataContainer">
                  <div className="weatherInfoText">
                    <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                    {weather.location.name}
                  </div>
                  <div className="weatherTempText">
                    <FontAwesomeIcon
                      icon={faTemperatureFull}
                      className="mr-1"
                    />
                    {`${weather.current['temp_c']}°C`}
                  </div>
                  <div className="weatherInfoText">
                    <FontAwesomeIcon icon={faCalendarDays} className="mr-1" />
                    {formatDateTime(
                      weather.location.localtime,
                      'dd-mm-yyyy, hh:mm'
                    )}
                  </div>
                </div>
                <div className="my-3 w-100 weatherInfoText">
                  The Next Days Forecast
                </div>
                {weather.forecast.forecastday.length > 0 ? (
                  <div className="d-flex align-items-center flex-column w-100">
                    <Row className="align-items-center w-100">
                      <Col md={3} className="d-flex justify-content-lg-around">
                        <img
                          className="iconConditionSize"
                          alt="icon"
                          src={
                            weather.forecast.forecastday[1]?.day.condition.icon
                          }
                        />
                      </Col>
                      <Col md={9}>
                        <div className="weatherInfoText">
                          <div>
                            {formatDate(weather.forecast.forecastday[1]?.date)}
                          </div>
                          <div>
                            {
                              weather.forecast.forecastday[1]?.day.condition
                                .text
                            }
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row className="align-items-center w-100">
                      <Col md={3} className="d-flex justify-content-lg-around">
                        <img
                          className="iconConditionSize"
                          alt="icon"
                          src={
                            weather.forecast.forecastday[2]?.day.condition.icon
                          }
                        />
                      </Col>
                      <Col md={9}>
                        <div className="weatherInfoText">
                          <div>
                            {formatDate(weather.forecast.forecastday[2]?.date)}
                          </div>
                          <div>
                            {
                              weather.forecast.forecastday[2]?.day.condition
                                .text
                            }
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <p>No data available</p>
                )}
              </>
            )}
          </div>
        </Col>
        <Col className="text-white" md={9}>
          {Object.keys(weather).length === 0 ? null : isLoading ? (
            <div>Currently Loading</div>
          ) : (
            <>
              <Row className="h-50 w-100">
                <div className="scrollableDiv">
                  <h1 className="text-left">
                    {weather?.current?.condition?.text}
                  </h1>
                  {hourlyData.length > 0 ? (
                    <div className="d-flex">
                      {hourlyData.map((hour, index) => (
                        <Col key={index} className="hourlyInfoContainer">
                          <div className="border-bottom">
                            {hour.time.split(' ')[1]}
                          </div>
                          <img
                            className="iconConditionSize"
                            alt="icon"
                            src={hour.condition.icon}
                          />
                          <div>{Math.ceil(hour.temp_c)}°C</div>
                        </Col>
                      ))}
                    </div>
                  ) : (
                    <p>No data available</p>
                  )}
                </div>
              </Row>
              <Row className="flex-column h-50 w-100">
                <div>
                  <h1 className="text-left">Today's Highlights</h1>
                  <Row>
                    <Col className="highlightsContainer">
                      <div className="highlightsText">
                        UV Index - {weather.current?.uv}
                        {` (${uvIndexCategory})`}
                      </div>
                      <div className="highlightsText">
                        Wind speed - {`${weather.current['wind_kph']} Km/h`}
                      </div>
                      <div className="highlightsText">
                        Sunrise -{weather.forecast.forecastday[0].astro.sunrise}
                      </div>
                      <div className="highlightsText">
                        Sunset - {weather.forecast.forecastday[0].astro.sunset}
                      </div>
                    </Col>
                    <Col className="highlightsContainer">
                      <div className="highlightsText">
                        {`Humidity - ${weather.current.humidity} %`}
                      </div>
                      <div className="highlightsText">
                        Visibility - {`${weather.current['vis_km']} Km`}
                      </div>
                      <div className="highlightsText">
                        Air Quality -
                        {`${Math.ceil(maxAQI)} (${airQualityCategory})`}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Row>
            </>
          )}
        </Col>
      </div>
    </div>
  );
};

export default DisplayWeather;
