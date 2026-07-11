import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AudioBusProvider } from "./lib/audioBus";
import "./index.css";
import "./ui.css";
import "./studio.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AudioBusProvider>
      <App />
    </AudioBusProvider>
  </React.StrictMode>,
);
