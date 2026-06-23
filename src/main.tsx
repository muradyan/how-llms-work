import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LLMExplorer from "./LLMExplorer";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LLMExplorer />
  </StrictMode>
);
