import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import { Panel } from "./Panel.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Panel />
  </React.StrictMode>
);
