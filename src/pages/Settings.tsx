import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Settings as SettingsIcon,
  Activity,
  FileText,
  BarChart3,
  Menu,
} from "lucide-react";

import CustomComponentManager from "../components/CustomComponentManager";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Button } from "@/components/ui/button";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:block w-56 border-r p-4 space-y-2">
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

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-semibold">Configurações</h1>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-4 space-y-2">
              <NavItem
                to="/"
                icon={<Home className="h-4 w-4" />}
                label="Dashboard"
              />
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
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main className="flex-1 p-6 space-y-6 pt-16 lg:pt-6">
        <h1 className="text-2xl font-bold">Configurações</h1>

        <CustomComponentManager />
      </main>
    </div>
  );
}
