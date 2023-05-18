import "./App.css";
import { useEffect, useState } from "react";
import Area from "./components/area/Area";
import { fetchInstructions } from "./utils/fetchInstructions";

function App() {
  const [instructions, setInstructions] = useState<Instructions>({
    areaHeight: 0,
    areaWidth: 0,
    lawnMowers: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const instructions = await fetchInstructions();
        setInstructions(instructions);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  return (
    <div className="App">
      <Area instructions={instructions} />
    </div>
  );
}

export default App;
