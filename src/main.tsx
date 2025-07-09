/// <reference types="vite-plugin-pwa/client" />

import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import "./index.css";
import { registerSW } from "virtual:pwa-register";

import Dashboard from "./pages/Dashboard";
import FlowPlayer from "./pages/FlowPlayer";
import FlowEditor from "./pages/FlowEditor";
import Company from "./pages/Company";
import Audit from "./pages/Audit";
import ImportExport from "./pages/ImportExport";
import PathAnalytics from "./pages/PathAnalytics";
import CustomComponents from "./pages/CustomComponents";
import Settings from "./pages/Settings";
import { useCompanySettings } from "./hooks/useCompanySettings";
import { applyBrandColors } from "./utils/theme";
import Analytics from "./pages/Analytics/EnhancedAnalytics";

registerSW({ immediate: true });

function App() {
  const { primary, secondary } = useCompanySettings();
  useEffect(() => {
    applyBrandColors(primary, secondary);
  }, [primary, secondary]);

  return (
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
        <Route path="/components" element={<CustomComponents />} />
        {/* Configurações da empresa */}
        <Route path="/company" element={<Company />} />

        {/* Log de auditoria */}
        <Route path="/audit" element={<Audit />} />

        {/* Importação e exportação de fluxos */}
        <Route path="/import-export" element={<ImportExport />} />

        {/* Path Analytics */}
        <Route path="/path-analytics" element={<PathAnalytics />} />

        {/* Backup e Restauração */}
        <Route path="/settings" element={<Settings />} />

        {/* Componentes personalizados */}
        <Route path="/components" element={<CustomComponents />} />

        {/* Qualquer rota desconhecida redireciona para o Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);
