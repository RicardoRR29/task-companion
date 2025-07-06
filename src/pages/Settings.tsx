import { Link } from "react-router-dom";
import {
  Home,
  Settings as SettingsIcon,
  Activity,
  FileText,
  BarChart3,
} from "lucide-react";

import CustomComponentManager from "../components/CustomComponentManager";

interface NavItemProps {
  to: string;
  icon: JSX.Element;
  label: string;
  active?: boolean;
}

function NavItem({ to, icon, label, active }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 p-2 rounded-md ${
        active
          ? "bg-secondary text-secondary-foreground font-medium"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function Settings() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r p-4 space-y-2">
        <NavItem to="/" icon={<Home className="h-4 w-4" />} label="Dashboard" />
        <NavItem
          to="/settings"
          icon={<SettingsIcon className="h-4 w-4" />}
          label="Perfil"
          active
        />
        <NavItem
          to="/audit"
          icon={<Activity className="h-4 w-4" />}
          label="Auditoria"
        />
        <NavItem
          to="/import-export"
          icon={<FileText className="h-4 w-4" />}
          label="Import/Export"
        />
        <NavItem
          to="/path-analytics"
          icon={<BarChart3 className="h-4 w-4" />}
          label="Path Analytics"
        />
      </aside>

      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold">Configurações</h1>

        <CustomComponentManager />
      </main>
    </div>
  );
}
