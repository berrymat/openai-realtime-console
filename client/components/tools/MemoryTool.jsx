// MemoryTool.jsx
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

export const functionDefinitions = [
  {
    type: "function",
    name: "set_memory",
    description: "Saves important data about the user into memory.",
    parameters: {
      type: "object",
      properties: {
        key: {
          type: "string",
          description:
            "The key of the memory value. Always use lowercase and underscores, no other characters.",
        },
        value: {
          type: "string",
          description: "Value can be anything represented as a string",
        },
      },
      required: ["key", "value"],
    },
  },
];

MemoryTool.propTypes = {
  toolCalls: PropTypes.shape({
    set_memory: PropTypes.arrayOf(
      PropTypes.shape({
        call_id: PropTypes.string.isRequired,
        arguments: PropTypes.shape({
          key: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        }),
      }),
    ),
  }).isRequired,
  sendClientEvent: PropTypes.func.isRequired,
};

// Actual UI for rendering the palette
export default function MemoryTool({ toolCalls, sendClientEvent }) {
  const [memory, setMemory] = useState({});
  const functionCalls = toolCalls.set_memory;

  useEffect(() => {
    if (!functionCalls || functionCalls.length === 0) {
      setMemory({});
      return;
    }

    const latestFunctionCall = functionCalls[0];
    const { key, value } = latestFunctionCall.arguments;

    setMemory((prev) => ({ ...prev, [key]: value }));
  }, [functionCalls]);

  if (!functionCalls || functionCalls.length === 0) {
    return <p>Ask to save a memory...</p>;
  }

  return (
    <div className="p-2 border rounded">
      <h4 className="font-bold">Memory Tool</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(memory).map(([key, value]) => (
          <div key={key} className="flex flex-col p-4 bg-white shadow rounded">
            <span className="font-semibold text-gray-700">{key}</span>
            <span className="text-gray-600">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
