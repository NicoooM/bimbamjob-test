import styles from "./Area.module.css";
import Lawnmower from "../lawnmower/Lawnmower";
import { useState } from "react";
import Grid from "../grid/Grid";

type Props = {
  instructions: Instructions;
};

const Area = ({ instructions }: Props) => {
  const [activeLawnMower, setActiveLawnMower] = useState<number>(0);

  return (
    <div className={styles.area}>
      <Grid
        areaWidth={instructions.areaWidth}
        areaHeight={instructions.areaHeight}
      />

      {instructions.lawnMowers.map((lawnMower: LawnMower, index: number) => {
        return (
          <Lawnmower
            key={index}
            lawnMower={lawnMower}
            areaWidth={instructions.areaWidth}
            areaHeight={instructions.areaWidth}
            index={index}
            active={index === activeLawnMower}
            setActiveLawnMower={setActiveLawnMower}
          />
        );
      })}
    </div>
  );
};

export default Area;
