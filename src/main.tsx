import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { AppShell } from "./react/AppShell";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("App root missing");
}

createRoot(app).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
);
