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
import Settings from "./pages/Settings";
import AuditTrail from "./pages/AuditTrail";
import FlowImportExport from "./pages/FlowImportExport";
import PathAnalytics from "./pages/PathAnalytics";
import CustomComponents from "./pages/CustomComponents";

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

        {/* Configurações do usuário */}
        <Route path="/settings" element={<Settings />} />

        {/* Log de auditoria */}
        <Route path="/audit" element={<AuditTrail />} />

        {/* Importação e exportação de fluxos */}
        <Route path="/import-export" element={<FlowImportExport />} />

        {/* Path Analytics */}
        <Route path="/path-analytics" element={<PathAnalytics />} />

        {/* Componentes personalizados */}
        <Route path="/components" element={<CustomComponents />} />

        {/* Qualquer rota desconhecida redireciona para o Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
