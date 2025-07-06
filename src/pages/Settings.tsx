import { Link } from "react-router-dom";
import {
  Home,
  Settings as SettingsIcon,
  User,
  Activity,
  FileText,
  BarChart3,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
        <h1 className="text-2xl font-bold">Seu perfil</h1>

        <section className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              Alterar foto
            </Button>
            <Button variant="ghost" size="sm">
              Remover foto
            </Button>
          </div>
        </section>

        <section className="bg-background rounded-md shadow p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input placeholder="Seu nome" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" placeholder="Seu email" />
          </div>
        </section>

        <section className="bg-background rounded-md shadow p-4 space-y-2">
          <label className="block text-sm font-medium mb-1">Uso do sistema</label>
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Escolha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pessoal">Pessoal</SelectItem>
              <SelectItem value="empresa">Empresa</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Defina como pretende usar o sistema
          </p>
        </section>

        <section className="pt-4 border-t">
          <h2 className="font-semibold mb-3">Contas conectadas</h2>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span>Google</span>
            <Button size="sm" variant="outline">
              Desconectar
            </Button>
          </div>
        </section>

        <section className="pt-4 border-t">
          <h2 className="font-semibold mb-3">Componentes personalizados</h2>
          <Button asChild size="sm" variant="outline">
            <Link to="/components">Gerenciar componentes</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}

