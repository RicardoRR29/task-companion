import { useRef } from "react";
import type { ChangeEvent } from "react";
import SidebarLayout from "../components/Sidebar";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useCompanySettings } from "../hooks/useCompanySettings";

export default function Company() {
  const { logo, primary, secondary, setLogo, setPrimary, setSecondary } =
    useCompanySettings();
  const fileRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <SidebarLayout title="Empresa">
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label>Logo</Label>
          {logo && (
            <img src={logo} alt="Logo" className="h-20 object-contain" />
          )}
          <Input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
        </div>
        <div className="space-y-2">
          <Label>Cor Primária</Label>
          <Input
            type="color"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            className="w-20 h-10 p-1"
          />
        </div>
        <div className="space-y-2">
          <Label>Cor Secundária</Label>
          <Input
            type="color"
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
            className="w-20 h-10 p-1"
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
