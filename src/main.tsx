import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { dailyScheduler } from "./lib/dailyScheduler";
import { scheduledMessageService } from "./lib/scheduledMessageService";

// Initialize daily automation scheduler
dailyScheduler.initializeScheduler();

// Start scheduled message service
scheduledMessageService.start();

createRoot(document.getElementById("root")!).render(<App />);
