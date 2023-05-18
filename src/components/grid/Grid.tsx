import Cell from "../cell/Cell";
import styles from "./Grid.module.css";

type Props = {
  areaWidth: number;
  areaHeight: number;
};

const Grid = ({ areaWidth, areaHeight }: Props) => {
  const widthArray = Array.from(Array(areaWidth).keys());
  const heightArray = Array.from(Array(areaHeight).keys());

  return (
    <>
      {heightArray.map((y) => (
        <div className={styles.row} key={y}>
          <p className={styles.rowInfo}>{heightArray.length - y}</p>
          {widthArray.map((x) => (
            <Cell key={`${y} ${x}`} />
          ))}
        </div>
      ))}
      <div className={styles.columnInfo}>
        {widthArray.map((x) => (
          <p key={x}>{x + 1}</p>
        ))}
      </div>
    </>
  );
};

export default Grid;
