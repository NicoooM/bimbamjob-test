export const formatInstructions = (instructions: string): Instructions => {
  const lines = instructions.split("\n");
  const area = lines[0].split(" ");
  const lawnMowers = [];
  for (let i = 1; i < lines.length; i += 2) {
    const lawnMower = lines[i].split(" ");
    lines[i + 1] = lines[i + 1].replaceAll("\r", "");
    const instructions = lines[i + 1].split("");
    lawnMowers.push({
      x: parseInt(lawnMower[0][0]),
      y: parseInt(lawnMower[0][1]),
      orientation: lawnMower[1][0] as LawnMowersOrientation,
      instructions: instructions as LawnMowersInstruction[],
    });
  }

  return {
    areaHeight: Number(area[0][0]),
    areaWidth: Number(area[0][1]),
    lawnMowers,
  };
};
