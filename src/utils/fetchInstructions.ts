import { formatInstructions } from "./formatInstructions";

export const fetchInstructions = async () => {
  const res = await fetch("/instructions.txt");
  const text = await res.text();
  const instructions: Instructions = formatInstructions(text);
  return instructions;
};
