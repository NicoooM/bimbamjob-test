export const executeInstruction = (
  position: LawnMowerPosition,
  instruction: LawnMowersInstruction,
  areaWidth: number,
  areaHeight: number
) => {
  const copyPosition = { ...position };
  switch (instruction) {
    case "L":
      switch (copyPosition.orientation) {
        case "N":
          copyPosition.orientation = "W";
          break;
        case "E":
          copyPosition.orientation = "N";
          break;
        case "S":
          copyPosition.orientation = "E";
          break;
        case "W":
          copyPosition.orientation = "S";
          break;
      }
      break;
    case "R":
      switch (copyPosition.orientation) {
        case "N":
          copyPosition.orientation = "E";
          break;
        case "E":
          copyPosition.orientation = "S";
          break;
        case "S":
          copyPosition.orientation = "W";
          break;
        case "W":
          copyPosition.orientation = "N";
          break;
      }
      break;
    case "F":
      switch (copyPosition.orientation) {
        case "N":
          if (copyPosition.y + 1 > areaHeight) break;
          copyPosition.y = copyPosition.y + 1;
          break;
        case "E":
          if (copyPosition.x + 1 > areaWidth) break;
          copyPosition.x = copyPosition.x + 1;
          break;
        case "S":
          if (copyPosition.y - 1 < 0) break;
          copyPosition.y = copyPosition.y - 1;
          break;
        case "W":
          if (copyPosition.x - 1 < 0) break;
          copyPosition.x = copyPosition.x - 1;
          break;
      }
      break;
  }
  return copyPosition;
};
