// ToolPanel.jsx
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as ColorPaletteTool from "./tools/ColorPaletteTool";
import * as MemoryTool from "./tools/MemoryTool";
import * as WeatherTool from "./tools/WeatherTool";
import * as IssTool from "./tools/IssTool";

// If you have more tools, just import them and add to this array
const allTools = [
  ColorPaletteTool,
  MemoryTool,
  WeatherTool,
  IssTool,
  // e.g. AnotherTool...
];

ToolPanel.propTypes = {
  isSessionActive: PropTypes.bool.isRequired,
  sendClientEvent: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      response: PropTypes.shape({
        output: PropTypes.arrayOf(
          PropTypes.shape({
            type: PropTypes.string,
            name: PropTypes.string,
          }),
        ),
      }),
    }),
  ).isRequired,
};

export default function ToolPanel({
  isSessionActive,
  sendClientEvent,
  events,
}) {
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCalls, setFunctionCalls] = useState({});
  const eventIndex = useRef(0);

  useEffect(() => {
    if (!events || events.length === 0) return;

    for (let i = eventIndex.current; i < events.length; i++) {
      const { type, response } = events[i];
      switch (type) {
        case "session.created": {
          // Register all tools on the first "session.created"
          if (!functionAdded) {
            const combinedSessionUpdate = {
              type: "session.update",
              session: {
                tools: allTools.flatMap((tool) => tool.functionDefinitions),
                tool_choice: "auto",
              },
            };
            sendClientEvent(combinedSessionUpdate);
          }
          break;
        }
        case "response.done": {
          response?.output?.forEach((output) => {
            if (output.type === "function_call") {
              const functionCall = {
                ...output,
                arguments: JSON.parse(output.arguments || "{}"),
              };
              setFunctionCalls((prev) => ({
                ...prev,
                [output.name]: [functionCall, ...(prev[output.name] || [])],
              }));
            }
          });
          break;
        }
      }
    }
    eventIndex.current = events.length;
  }, [events]);

  // Reset on session end
  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
      eventIndex.current = 0;
    } else {
      setFunctionCalls({});
    }
  }, [isSessionActive]);

  return (
    <section className="flex flex-col gap-4">
      {allTools.map(({ default: ToolComponent, functionDefinitions }) => {
        const { name: key } = functionDefinitions[0];
        const toolCalls = Object.fromEntries(
          functionDefinitions.map((definition) => [
            definition.name,
            functionCalls[definition.name] || [],
          ]),
        );
        return (
          <div key={key} className="bg-gray-50 p-4 rounded">
            <ToolComponent
              toolCalls={toolCalls}
              sendClientEvent={sendClientEvent}
            />
          </div>
        );
      })}
    </section>
  );
}
