import { createRoot } from "react-dom/client";
import App from "./AppClean.tsx";
import "./index.css";
import { dailyScheduler } from "./lib/dailyScheduler";

// Initialize daily automation scheduler
dailyScheduler.initializeScheduler();

createRoot(document.getElementById("root")!).render(<App />);
