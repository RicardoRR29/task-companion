import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import SidebarLayout from "../components/Sidebar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { createBackup, restoreBackup } from "../utils/backup";

export default function Settings() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const json = await createBackup();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Backup gerado",
        description: "Arquivo salvo com sucesso.",
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Erro ao gerar backup",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRestoring(true);
    try {
      const text = await file.text();
      await restoreBackup(text);
      toast({
        title: "Backup restaurado",
        description: "Os dados foram importados.",
      });
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Erro ao restaurar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <SidebarLayout title="Configurações">
      <div className="space-y-6 max-w-md pt-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" /> Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Salve uma cópia de todos os dados para restaurar depois.
            </p>
            <Button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full"
            >
              {isBackingUp ? "Gerando..." : "Gerar Backup"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" /> Restaurar Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Importe um arquivo de backup para restaurar todos os dados.
            </p>
            <Input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleRestore}
              disabled={isRestoring}
            />
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
