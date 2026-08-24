import { useEffect, useState } from "react";
import { getHealth } from "./api/health.api";

function App() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    getHealth()
      .then((data) => {
        setStatus(data.message);
      })
      .catch(() => {
        setStatus("Backend unavailable");
      });
  }, []);

  return (
    <div>
      <h1>Expense Splitter</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;