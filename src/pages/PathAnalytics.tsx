import { BarChart3 } from "lucide-react";
import SidebarLayout from "../components/Sidebar";

export default function PathAnalytics() {
  return (
    <SidebarLayout title="Path Analytics">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Path Analytics
      </h1>
      <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
    </SidebarLayout>
  );
}
