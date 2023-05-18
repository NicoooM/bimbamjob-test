import styles from "./Lawnmower.module.css";
import useLawnmowerPosition from "../../hooks/useLawnmowerPosition";

type Props = {
  lawnMower: LawnMower;
  areaWidth: number;
  areaHeight: number;
  index: number;
  active: boolean;
  setActiveLawnMower: (index: number) => void;
};

const Lawnmower = (props: Props) => {
  const { position, showFinalPosition } = useLawnmowerPosition(props);

  return (
    <>
      <div
        className={styles.lawnmower}
        style={{
          transform: `translate(${position.x * 30}px, ${position.y * -30}px)`,
        }}
      >
        {showFinalPosition && (
          <p className={styles.finalPosition}>
            [{position.x}, {position.y}] {position.orientation}
          </p>
        )}
      </div>
    </>
  );
};

export default Lawnmower;
