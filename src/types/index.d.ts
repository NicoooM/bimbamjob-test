declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

type LawnMowersInstruction = "L" | "R" | "F";

type LawnMowersOrientation = "N" | "E" | "S" | "W";

type LawnMowerPosition = {
  x: number;
  y: number;
  orientation: LawnMowersOrientation;
};

type LawnMower = {
  x: number;
  y: number;
  orientation: lawnMowersOrientation;
  instructions: lawnMowersInstruction[];
};

type Instructions = {
  areaWidth: number;
  areaHeight: number;
  lawnMowers: lawnMowers[];
};
