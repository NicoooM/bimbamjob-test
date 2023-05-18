import { useEffect, useState } from "react";
import { executeInstruction } from "../utils/executeInstruction";

type Props = {
  lawnMower: LawnMower;
  areaWidth: number;
  areaHeight: number;
  index: number;
  active: boolean;
  setActiveLawnMower: (index: number) => void;
};

const useLawnmowerPosition = ({
  lawnMower,
  areaHeight,
  areaWidth,
  index,
  active,
  setActiveLawnMower,
}: Props) => {
  let { x, y, orientation } = lawnMower;
  const { instructions } = lawnMower;
  const delay = 500;

  const [showFinalPosition, setShowFinalPosition] = useState<boolean>(false);
  const [position, setPosition] = useState<LawnMowerPosition>({
    x,
    y,
    orientation,
  } as LawnMowerPosition);

  useEffect(() => {
    if (!active) return;
    const defaultPosition = { x, y, orientation };
    let copyPosition = { ...defaultPosition };

    instructions.forEach((instruction, instructionIndex) => {
      setTimeout(() => {
        copyPosition = executeInstruction(
          copyPosition,
          instruction,
          areaWidth,
          areaHeight
        );
        setPosition(copyPosition);
      }, instructionIndex * delay);
    });
  }, [active, areaHeight, areaWidth, instructions, orientation, x, y]);

  useEffect(() => {
    if (!active) return;
    const totalTimeoutDelay = instructions.length * delay;

    setTimeout(() => {
      setActiveLawnMower(index + 1);
      setShowFinalPosition(true);
    }, totalTimeoutDelay);
  }, [active, index, instructions.length, setActiveLawnMower]);

  return { position, showFinalPosition };
};

export default useLawnmowerPosition;
