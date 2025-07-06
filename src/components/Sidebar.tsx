import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Settings as SettingsIcon,
  Activity,
  FileText,
  BarChart3,
  User,
  Building2,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface SidebarLayoutProps {
  title: string;
  children: ReactNode;
}

interface NavItem {
  to: string;
  icon: JSX.Element;
  label: string;
}

const navItems: NavItem[] = [
  { to: "/", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { to: "/settings", icon: <SettingsIcon className="h-4 w-4" />, label: "Perfil" },
  { to: "/audit", icon: <Activity className="h-4 w-4" />, label: "Auditoria" },
  { to: "/import-export", icon: <FileText className="h-4 w-4" />, label: "Import/Export" },
  { to: "/path-analytics", icon: <BarChart3 className="h-4 w-4" />, label: "Path Analytics" },
  { to: "/components", icon: <User className="h-4 w-4" />, label: "Componentes" },
  { to: "/company", icon: <Building2 className="h-4 w-4" />, label: "Empresa" },
];

function NavItemLink({ to, icon, label }: NavItem) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2 p-2 rounded-md ${
          isActive
            ? "bg-secondary text-secondary-foreground font-medium"
            : "text-muted-foreground hover:bg-muted"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default function SidebarLayout({ title, children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:block w-56 border-r p-4 space-y-2">
        {navItems.map((item) => (
          <NavItemLink key={item.to} {...item} />
        ))}
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-semibold">{title}</h1>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-4 space-y-2">
              {navItems.map((item) => (
                <NavItemLink key={item.to} {...item} />
              ))}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main className="flex-1 p-6 space-y-6 pt-16 lg:pt-6">{children}</main>
    </div>
  );
}
