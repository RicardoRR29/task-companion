/// <reference types="vite-plugin-pwa/client" />

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./index.css";
import { registerSW } from "virtual:pwa-register";

import Dashboard from "./pages/Dashboard";
import FlowPlayer from "./pages/FlowPlayer";
import Analytics from "./pages/Analytics";
import FlowEditor from "./pages/FlowEditor";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Home - lista todos os fluxos */}
        <Route path="/" element={<Dashboard />} />

        {/* Editor visual de um fluxo */}
        <Route path="/flows/:id/edit" element={<FlowEditor />} />

        {/* Player (execução) de um fluxo */}
        <Route path="/flows/:id/play" element={<FlowPlayer />} />

        {/* Analytics de um fluxo */}
        <Route path="/flows/:id/analytics" element={<Analytics />} />

        {/* Qualquer rota desconhecida redireciona para o Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
