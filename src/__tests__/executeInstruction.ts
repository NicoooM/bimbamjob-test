import { executeInstruction } from "../utils/executeInstruction";

describe("executeInstruction", () => {
  it("should return the position with the good orientation", () => {
    const position: LawnMowerPosition = {
      x: 1,
      y: 2,
      orientation: "N",
    };
    const instruction: LawnMowersInstruction = "L";
    const areaWidth = 5;
    const areaHeight = 5;
    const result = executeInstruction(
      position,
      instruction,
      areaWidth,
      areaHeight
    );
    expect(result).toEqual({
      x: 1,
      y: 2,
      orientation: "W",
    });
  });

  it("should return the position with the good coordinate", () => {
    const position: LawnMowerPosition = {
      x: 1,
      y: 2,
      orientation: "N",
    };
    const instruction: LawnMowersInstruction = "F";
    const areaWidth = 5;
    const areaHeight = 5;
    const result = executeInstruction(
      position,
      instruction,
      areaWidth,
      areaHeight
    );
    expect(result).toEqual({
      x: 1,
      y: 3,
      orientation: "N",
    });
  });

  it("should return the same position if it goes out of the area", () => {
    const position: LawnMowerPosition = {
      x: 3,
      y: 5,
      orientation: "N",
    };
    const instruction: LawnMowersInstruction = "F";
    const areaWidth = 5;
    const areaHeight = 5;
    const result = executeInstruction(
      position,
      instruction,
      areaWidth,
      areaHeight
    );
    expect(result).toEqual(position);
  });
});
