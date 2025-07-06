import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Grid3X3, List, Download, Trash2, Search } from "lucide-react";

interface Props {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  isSelecting: boolean;
  onSelectAll: () => void;
  onExportSelected: () => void;
  onDeleteSelected: () => void;
  isExporting: boolean;
  isDeleting: boolean;
  selectedCount: number;
}

export default function DashboardFilters({
  searchQuery,
  onSearchChange,
  viewMode,
  setViewMode,
  isSelecting,
  onSelectAll,
  onExportSelected,
  onDeleteSelected,
  isExporting,
  isDeleting,
  selectedCount,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar fluxos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("grid")}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
        >
          <List className="h-4 w-4" />
        </Button>
        {isSelecting && (
          <>
            <Button onClick={onSelectAll} size="sm" variant="outline">
              Selecionar Todos
            </Button>
            <Button
              onClick={onExportSelected}
              disabled={isExporting || selectedCount === 0}
              size="sm"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exportando..." : "Exportar Selecionados"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={(e) => e.stopPropagation()}
                  disabled={isDeleting || selectedCount === 0}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Excluindo..." : "Excluir Selecionados"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir fluxos</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Os fluxos selecionados serão permanentemente excluídos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteSelected}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirmar Exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
