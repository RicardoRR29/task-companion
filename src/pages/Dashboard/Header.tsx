import { Link } from "react-router-dom";
import { Plus, Upload, Settings } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface Props {
  onNew: () => void;
  isCreating: boolean;
  flowsCount: number;
  isSelecting: boolean;
  onToggleSelect: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isImporting: boolean;
}

export default function DashboardHeader({
  onNew,
  isCreating,
  flowsCount,
  isSelecting,
  onToggleSelect,
  fileInputRef,
  onImport,
  isImporting,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex flex-col items-start">
        <h1 className="text-3xl font-bold tracking-tight">Meus Fluxos</h1>
        <p className="text-muted-foreground">Gerencie e monitore seus fluxos de trabalho</p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
        <Button onClick={onNew} disabled={isCreating} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Criando..." : "Novo Fluxo"}
        </Button>
        {flowsCount > 0 && (
          <Button onClick={onToggleSelect} variant={isSelecting ? "secondary" : "outline"} size="lg">
            {isSelecting ? "Cancelar" : "Selecionar"}
          </Button>
        )}
        <Input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onImport}
          disabled={isImporting}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={isImporting} variant="outline" size="lg">
          <Upload className="mr-2 h-4 w-4" />
          {isImporting ? "Importando..." : "Importar"}
        </Button>
      </div>
    </div>
  );
}
