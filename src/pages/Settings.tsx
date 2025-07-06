import SidebarLayout from "../components/Sidebar";
import CustomComponentManager from "../components/CustomComponentManager";

export default function Settings() {
  return (
    <SidebarLayout title="Configurações">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <CustomComponentManager />
    </SidebarLayout>
  );
}
