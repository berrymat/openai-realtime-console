// ColorPaletteTool.jsx
import { useEffect } from "react";
import PropTypes from "prop-types";

export const functionDefinitions = [
  {
    type: "function",
    name: "display_color_palette",
    description:
      "Call this to display a color palette with hex values based on a theme.",
    parameters: {
      type: "object",
      strict: true,
      properties: {
        theme: { type: "string" },
        colors: {
          type: "array",
          minItems: 6,
          items: { type: "string" },
        },
      },
      required: ["theme", "colors"],
    },
  },
];

ColorPaletteTool.propTypes = {
  toolCalls: PropTypes.shape({
    display_color_palette: PropTypes.arrayOf(
      PropTypes.shape({
        call_id: PropTypes.string.isRequired,
        arguments: PropTypes.shape({
          theme: PropTypes.string.isRequired,
          colors: PropTypes.arrayOf(PropTypes.string).isRequired,
        }),
      }),
    ),
  }).isRequired,
  sendClientEvent: PropTypes.func.isRequired,
};

// Actual UI for rendering the palette
export default function ColorPaletteTool({ toolCalls, sendClientEvent }) {
  const functionCalls = toolCalls.display_color_palette;

  useEffect(() => {
    if (!functionCalls || functionCalls.length === 0) return;

    setTimeout(() => {
      sendClientEvent({
        type: "response.create",
        response: {
          instructions: "ask if user likes these colors—no need to repeat them",
        },
      });
    }, 500);
  }, [functionCalls]);

  if (!functionCalls || functionCalls.length === 0) {
    return <p>Ask for a color palette...</p>;
  }

  const latestFunctionCall = functionCalls[0];
  const { theme, colors } = latestFunctionCall.arguments;

  return (
    <div className="p-2 border rounded">
      <h4 className="font-bold">Color Palette Tool</h4>
      <p>Theme: {theme}</p>
      <div className="grid grid-cols-5 gap-2 mt-2">
        {colors.map((color) => (
          <div
            key={color}
            className="h-12 border flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <span className="bg-white px-1 py-0.5 text-sm">{color}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
