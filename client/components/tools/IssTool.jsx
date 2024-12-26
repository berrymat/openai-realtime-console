// IssTool.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export const functionDefinitions = [
  {
    type: "function",
    name: "get_iss_location",
    description:
      "Retrieves the current location of the International Space Station (ISS).",
    parameters: {},
  },
];

IssTool.propTypes = {
  toolCalls: PropTypes.shape({
    get_iss_location: PropTypes.arrayOf(
      PropTypes.shape({
        call_id: PropTypes.string.isRequired,
      }),
    ),
  }),
  sendClientEvent: PropTypes.func.isRequired,
};

// Actual UI for rendering the palette
export default function IssTool({ toolCalls, sendClientEvent }) {
  const [location, setLocation] = useState({});
  const functionCalls = toolCalls.get_iss_location;

  useEffect(() => {
    const fetchIssLocation = async () => {
      if (!functionCalls || functionCalls.length === 0) {
        setLocation({});
        return;
      }

      const latestFunctionCall = functionCalls[0];

      const result = await fetch(`http://api.open-notify.org/iss-now.json`);
      const json = await result.json();
      console.log(json);
      setLocation(json);

      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: latestFunctionCall.call_id,
          output: JSON.stringify(json),
        },
      });
      sendClientEvent({
        type: "response.create",
      });
    };

    fetchIssLocation();
  }, [functionCalls]);

  if (!functionCalls || functionCalls.length === 0) {
    return <p>Ask to get the location of the ISS...</p>;
  }

  return (
    <div className="p-2 border rounded">
      <h4 className="font-bold">ISS Tool</h4>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(location).map(([key, value]) => (
          <div key={key} className="flex flex-col p-4 bg-white shadow rounded">
            <span className="font-semibold text-gray-700">{key}</span>
            <span className="text-gray-600">{JSON.stringify(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
