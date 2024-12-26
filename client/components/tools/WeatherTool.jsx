// MemoryTool.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export const functionDefinitions = [
  {
    type: "function",
    name: "get_weather",
    description:
      "Retrieves the weather for a given lat, lng coordinate pair. Specify a label for the location.",
    parameters: {
      type: "object",
      properties: {
        lat: {
          type: "number",
          description: "Latitude",
        },
        lng: {
          type: "number",
          description: "Longitude",
        },
        location: {
          type: "string",
          description: "Name of the location",
        },
      },
      required: ["lat", "lng", "location"],
    },
  },
];

WeatherTool.propTypes = {
  toolCalls: PropTypes.shape({
    get_weather: PropTypes.arrayOf(
      PropTypes.shape({
        call_id: PropTypes.string.isRequired,
        arguments: PropTypes.shape({
          lat: PropTypes.number.isRequired,
          lng: PropTypes.number.isRequired,
          location: PropTypes.string.isRequired,
        }),
      }),
    ),
  }).isRequired,
  sendClientEvent: PropTypes.func.isRequired,
};

// Actual UI for rendering the palette
export default function WeatherTool({ toolCalls, sendClientEvent }) {
  const [weather, setWeather] = useState({});
  const functionCalls = toolCalls.get_weather;

  useEffect(() => {
    const fetchWeather = async () => {
      if (!functionCalls || functionCalls.length === 0) {
        setWeather({});
        return;
      }

      const latestFunctionCall = functionCalls[0];
      const { lat, lng, location } = latestFunctionCall.arguments;

      const result = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`,
      );
      const json = await result.json();
      const temperature = `${json.current.temperature_2m} ${json.current_units.temperature_2m}`;
      const wind_speed = `${json.current.wind_speed_10m} ${json.current_units.wind_speed_10m}`;
      setWeather((prev) => ({
        ...prev,
        [location]: { lat, lng, temperature, wind_speed },
      }));

      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: latestFunctionCall.call_id,
          output: JSON.stringify({ location, temperature, wind_speed }),
        },
      });
      sendClientEvent({
        type: "response.create",
      });
    };

    fetchWeather();
  }, [functionCalls]);

  if (!functionCalls || functionCalls.length === 0) {
    return <p>Ask to get the weather...</p>;
  }

  return (
    <div className="p-2 border rounded">
      <h4 className="font-bold">Weather Tool</h4>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(weather).map(([key, value]) => (
          <div key={key} className="flex flex-col p-4 bg-white shadow rounded">
            <span className="font-semibold text-gray-700">{key}</span>
            <span className="text-gray-600">{JSON.stringify(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
