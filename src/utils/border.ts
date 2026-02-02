/**
 * Symbolic Border Geometry and Parsing Utilities
 * Extracted to separate pure logic from DOM manipulation (SRP)
 */

/**
 * Safely converts a value to a number.
 * @param value - The value to convert
 * @param fallback - Fallback value if conversion fails
 */
export function toNumber(value: unknown, fallback = 0): number {
  const parsedNumber = Number(value);
  return isFinite(parsedNumber) ? parsedNumber : fallback;
}

/**
 * Formats a coordinate to a string with 2 decimal places.
 * @param value - The coordinate value
 */
export function formatCoordinate(value: number): string {
  return isFinite(value) ? (+value).toFixed(2) : "0";
}

/**
 * Parses a pixel string (e.g. "10px") or number to a raw number.
 * @param value - The value to parse
 * @param fallback - Fallback value
 */
export function parsePixels(value: unknown, fallback: number): number {
  if (!value) return fallback;
  if (typeof value === "number") return value;
  const match = String(value).match(/^([0-9.]+)px$/);
  if (match) return parseFloat(match[1]);
  const parsedNumber = parseFloat(String(value));
  return isFinite(parsedNumber) ? parsedNumber : fallback;
}

/**
 * Generates the SVG path data for a border side or section.
 */
export function buildSidePath(
  positionX: unknown,
  positionY: unknown,
  width: unknown,
  height: unknown,
  radius: unknown,
  sides: string[],
): string {
  const normalizedX = toNumber(positionX, 0);
  const normalizedY = toNumber(positionY, 0);
  const normalizedWidth = toNumber(width, 0);
  const normalizedHeight = toNumber(height, 0);
  const normalizedRadius = toNumber(radius, 0);

  if (normalizedWidth <= 0 || normalizedHeight <= 0) return "";

  // Normalize sides
  const sideSet = new Set(sides.map((side) => String(side).toLowerCase()));
  let targetSides: string[];

  if (sideSet.has("full")) {
    targetSides = ["top", "right", "bottom", "left"];
  } else {
    targetSides = ["top", "right", "bottom", "left"].filter((side) =>
      sideSet.has(side),
    );
  }

  const left = normalizedX,
    top = normalizedY,
    right = normalizedX + normalizedWidth,
    bottom = normalizedY + normalizedHeight;
  const radiusX = Math.min(
    normalizedRadius,
    normalizedWidth / 2,
    normalizedHeight / 2,
  );

  const include = {
    top: targetSides.includes("top"),
    right: targetSides.includes("right"),
    bottom: targetSides.includes("bottom"),
    left: targetSides.includes("left"),
  };

  const order = ["top", "right", "bottom", "left"];
  const startSide = order.find((side) => include[side as keyof typeof include]);

  if (!startSide) return "";

  let centerX, centerY;

  if (startSide === "top") {
    centerX = left + radiusX;
    centerY = top;
  } else if (startSide === "right") {
    centerX = right;
    centerY = top + radiusX;
  } else if (startSide === "bottom") {
    centerX = right - radiusX;
    centerY = bottom;
  } else {
    centerX = left;
    centerY = bottom - radiusX;
  }

  const cmd: string[] = [];
  cmd.push(`M ${formatCoordinate(centerX)} ${formatCoordinate(centerY)}`);

  function appendSide(side: string) {
    if (side === "top" && include.top) {
      cmd.push(`H ${formatCoordinate(right - radiusX)}`);
      if (include.right)
        cmd.push(
          `A ${formatCoordinate(radiusX)} ${formatCoordinate(radiusX)} 0 0 1 ${formatCoordinate(right)} ${formatCoordinate(top + radiusX)}`,
        );
      else cmd.push(`L ${formatCoordinate(right)} ${formatCoordinate(top)}`);
    }
    if (side === "right" && include.right) {
      cmd.push(`V ${formatCoordinate(bottom - radiusX)}`);
      if (include.bottom)
        cmd.push(
          `A ${formatCoordinate(radiusX)} ${formatCoordinate(radiusX)} 0 0 1 ${formatCoordinate(right - radiusX)} ${formatCoordinate(bottom)}`,
        );
      else cmd.push(`L ${formatCoordinate(right)} ${formatCoordinate(bottom)}`);
    }
    if (side === "bottom" && include.bottom) {
      cmd.push(`H ${formatCoordinate(left + radiusX)}`);
      if (include.left)
        cmd.push(
          `A ${formatCoordinate(radiusX)} ${formatCoordinate(radiusX)} 0 0 1 ${formatCoordinate(left)} ${formatCoordinate(bottom - radiusX)}`,
        );
      else cmd.push(`L ${formatCoordinate(left)} ${formatCoordinate(bottom)}`);
    }
    if (side === "left" && include.left) {
      cmd.push(`V ${formatCoordinate(top + radiusX)}`);
      if (include.top)
        cmd.push(
          `A ${formatCoordinate(radiusX)} ${formatCoordinate(radiusX)} 0 0 1 ${formatCoordinate(left + radiusX)} ${formatCoordinate(top)}`,
        );
      else cmd.push(`L ${formatCoordinate(left)} ${formatCoordinate(top)}`);
    }
  }

  const index = order.indexOf(startSide);
  for (let i = 0; i < 4; i++) {
    appendSide(order[(index + i) % 4]);
  }

  if (include.top && include.right && include.bottom && include.left) {
    cmd.push("Z");
  }

  return cmd.join(" ");
}
