import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Sparkles,
  Search,
  Grid3X3,
  List,
  Download,
  Upload,
  Trash2,
  Settings,
  X,
  Check,
  MoreVertical,
  Play,
  BarChart3,
  Edit,
  Copy,
} from "lucide-react";
import { useFlows } from "../../hooks/useFlows";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import AIFlowModal from "../../components/dashboard/AIFlowModal";
import type { Flow } from "../../types/flow";
import { db } from "../../db";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
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
import { cn } from "../../utils/cn";

import FlowCard from "./FlowCard";
import EmptyState from "./EmptyState";
import EmptySearchState from "./EmptySearchState";
import DashboardSkeleton from "./Skeleton";

type ViewMode = "grid" | "list";

// Configurações do localStorage
const STORAGE_KEYS = {
  VIEW_MODE: "taco-dashboard-view-mode",
  SHOW_VISITS: "taco-dashboard-show-visits",
  SHOW_COMPLETIONS: "taco-dashboard-show-completions",
  SHOW_COMPLETION_RATE: "taco-dashboard-show-completion-rate",
  SHOW_STEP_COUNT: "taco-dashboard-show-step-count",
};

// Funções helper para localStorage - VERSÃO CORRIGIDA
const loadBooleanSetting = (key: string, defaultValue = false): boolean => {
  try {
    const saved = localStorage.getItem(key);
    console.log(`Carregando ${key}:`, { saved, defaultValue });
    // Só usa o valor padrão se realmente não existir no localStorage
    if (saved === null || saved === undefined) {
      console.log(`${key} não encontrado, usando padrão:`, defaultValue);
      return defaultValue;
    }

    const parsed = JSON.parse(saved);
    console.log(`${key} carregado:`, parsed);
    return parsed;
  } catch (error) {
    console.warn(`Erro ao carregar configuração ${key}:`, error);
    return defaultValue;
  }
};

const saveBooleanSetting = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Erro ao salvar configuração ${key}:`, error);
  }
};

const loadViewMode = (): ViewMode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return saved === "grid" || saved === "list" ? (saved as ViewMode) : "grid";
  } catch (error) {
    console.warn("Erro ao carregar modo de visualização:", error);
    return "grid";
  }
};

const saveViewMode = (mode: ViewMode): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  } catch (error) {
    console.warn("Erro ao salvar modo de visualização:", error);
  }
};

export default function Dashboard() {
  const {
    flows,
    load,
    create,
    clone,
    exportFlows,
    importFlow,
    remove,
    removeMany,
    isLoading,
  } = useFlows();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCreating, setIsCreating] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tab, setTab] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Campos visíveis nos cards
  const [showVisits, setShowVisits] = useState(true);
  const [showCompletions, setShowCompletions] = useState(true);
  const [showCompletionRate, setShowCompletionRate] = useState(true);
  const [showStepCount, setShowStepCount] = useState(true);

  // Estado para controlar se as configurações já foram carregadas
  const [configsLoaded, setConfigsLoaded] = useState(false);

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    console.log("Carregando configurações do localStorage...");
    const loadedViewMode = loadViewMode();
    const loadedShowVisits = loadBooleanSetting(
      STORAGE_KEYS.SHOW_VISITS,
      false
    );
    const loadedShowCompletions = loadBooleanSetting(
      STORAGE_KEYS.SHOW_COMPLETIONS,
      false
    );
    const loadedShowCompletionRate = loadBooleanSetting(
      STORAGE_KEYS.SHOW_COMPLETION_RATE,
      false
    );
    const loadedShowStepCount = loadBooleanSetting(
      STORAGE_KEYS.SHOW_STEP_COUNT,
      false
    );

    setViewMode(loadedViewMode);
    setShowVisits(loadedShowVisits);
    setShowCompletions(loadedShowCompletions);
    setShowCompletionRate(loadedShowCompletionRate);
    setShowStepCount(loadedShowStepCount);
  }, []);

  // Salvar configurações no localStorage sempre que mudarem
  useEffect(() => {
    saveViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    saveBooleanSetting(STORAGE_KEYS.SHOW_VISITS, showVisits);
  }, [showVisits]);

  useEffect(() => {
    saveBooleanSetting(STORAGE_KEYS.SHOW_COMPLETIONS, showCompletions);
  }, [showCompletions]);

  useEffect(() => {
    saveBooleanSetting(STORAGE_KEYS.SHOW_COMPLETION_RATE, showCompletionRate);
  }, [showCompletionRate]);

  useEffect(() => {
    saveBooleanSetting(STORAGE_KEYS.SHOW_STEP_COUNT, showStepCount);
  }, [showStepCount]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredFlows = flows.filter((flow) =>
    flow.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleNew() {
    setIsCreating(true);
    try {
      const id = await create("Novo Fluxo");
      navigate(`/flows/${id}/edit`);
    } catch (error) {
      console.error("Erro ao criar fluxo:", error);
      toast({
        title: "Erro ao criar fluxo",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleClone(id: string) {
    try {
      const newId = await clone(id);
      navigate(`/flows/${newId}/edit`);
      toast({
        title: "Fluxo duplicado",
        description: "Fluxo duplicado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao clonar fluxo:", error);
      toast({
        title: "Erro ao duplicar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir fluxo?")) return;
    try {
      await remove(id);
      toast({
        title: "Fluxo excluído",
        description: "O fluxo foi excluído com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    if (selectedIds.length === filteredFlows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFlows.map((f) => f.id));
    }
  }

  async function handleExportSelected() {
    if (selectedIds.length === 0) return;
    setIsExporting(true);
    try {
      const data = await exportFlows(selectedIds);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flows-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Exportado",
        description: `${selectedIds.length} fluxos exportados.`,
      });
    } catch (error) {
      console.error("Erro ao exportar fluxos:", error);
      toast({
        title: "Erro na exportação",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setIsSelecting(false);
      setSelectedIds([]);
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await removeMany(selectedIds);
      toast({
        title: "Excluídos",
        description: `${selectedIds.length} fluxos removidos.`,
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsSelecting(false);
      setSelectedIds([]);
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      await importFlow(text);
      toast({
        title: "Importado",
        description: "Fluxos importados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao importar fluxo:", error);
      toast({
        title: "Erro na importação",
        description: "Verifique o arquivo e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAIImport(json: string) {
    try {
      const data = JSON.parse(json);

      if (
        !data.flows?.length ||
        !data.flows[0]?.title ||
        !data.flows[0]?.steps
      ) {
        throw new Error("JSON incompleto. Título ou passos ausentes: " + json);
      }

      const newId = await importFlow(json);
      if (!newId) throw new Error("ID não retornado após importação");

      toast({
        title: "Fluxo criado",
        description: "Fluxo gerado com IA com sucesso.",
      });
      navigate(`/flows/${newId}/edit`);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao importar fluxo:", err, json);
      toast({
        title: "Erro na importação",
        description: err.message,
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                Fluxos
              </h1>
              <p className="mt-1 text-sm text-gray-500 sm:text-base">
                {flows.length} {flows.length === 1 ? "fluxo" : "fluxos"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                    <span className="sr-only">
                      Configurações de visualização
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                    Mostrar nos cards
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowStepCount(!showStepCount)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Quantidade de passos</span>
                      {showStepCount && <Check className="h-4 w-4" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowVisits(!showVisits)}>
                    <div className="flex items-center justify-between w-full">
                      <span>Visitas</span>
                      {showVisits && <Check className="h-4 w-4" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowCompletions(!showCompletions)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Conclusões</span>
                      {showCompletions && <Check className="h-4 w-4" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowCompletionRate(!showCompletionRate)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Taxa de conclusão</span>
                      {showCompletionRate && <Check className="h-4 w-4" />}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/components">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button
                onClick={handleNew}
                disabled={isCreating}
                className="flex-1 sm:flex-none"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? "Criando..." : "Novo"}
              </Button>
              <Button
                onClick={() => setAiModalOpen(true)}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                IA
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? "..." : "Importar"}
              </Button>
              {flows.length > 0 && (
                <Button
                  onClick={() => {
                    setIsSelecting((v) => !v);
                    setSelectedIds([]);
                  }}
                  variant={isSelecting ? "secondary" : "outline"}
                  className="flex-1 sm:flex-none"
                >
                  {isSelecting ? "Cancelar" : "Selecionar"}
                </Button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex rounded-md border border-gray-200">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none border-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 border-gray-200"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Selection Bar */}
          {isSelecting && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  <div className="flex h-4 w-4 items-center justify-center rounded border border-gray-300">
                    {selectedIds.length > 0 &&
                      selectedIds.length === filteredFlows.length && (
                        <Check className="h-3 w-3" />
                      )}
                  </div>
                  <span className="ml-2 text-sm">
                    {selectedIds.length === filteredFlows.length
                      ? "Desmarcar"
                      : "Todos"}
                  </span>
                </Button>
                {selectedIds.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedIds.length} selecionados
                  </span>
                )}
              </div>
              {selectedIds.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportSelected}
                    disabled={isExporting}
                    size="sm"
                    variant="ghost"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={isDeleting} size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          {selectedIds.length} fluxos serão excluídos
                          permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteSelected}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          disabled={isImporting}
          className="hidden"
        />

        <AIFlowModal
          open={aiModalOpen}
          onOpenChange={setAiModalOpen}
          onImport={handleAIImport}
        />

        {/* Content */}
        <main>
          {filteredFlows.length === 0 ? (
            searchQuery ? (
              <EmptySearchState
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery("")}
              />
            ) : (
              <EmptyState onCreateFlow={handleNew} isCreating={isCreating} />
            )
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-3"
              )}
            >
              {filteredFlows.map((flow) => (
                <FlowCard
                  key={flow.id}
                  flow={flow}
                  viewMode={viewMode}
                  onClone={() => handleClone(flow.id)}
                  onEdit={() => navigate(`/flows/${flow.id}/edit`)}
                  onPlay={() => navigate(`/flows/${flow.id}/play`)}
                  onAnalytics={() => navigate(`/flows/${flow.id}/analytics`)}
                  onExport={async () => {
                    setIsExporting(true);
                    try {
                      const data = await exportFlows([flow.id]);
                      const blob = new Blob([data], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${flow.title
                        .replace(/\s+/g, "-")
                        .toLowerCase()}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast({
                        title: "Exportado",
                        description: "Fluxo exportado com sucesso.",
                      });
                    } catch (err) {
                      console.error("Erro ao exportar fluxo:", err);
                      toast({
                        title: "Erro",
                        description: "Não foi possível exportar.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  onDelete={() => handleDelete(flow.id)}
                  isSelecting={isSelecting}
                  isSelected={selectedIds.includes(flow.id)}
                  onSelect={() => toggleSelect(flow.id)}
                  showVisits={showVisits}
                  showCompletions={showCompletions}
                  showCompletionRate={showCompletionRate}
                  showStepCount={showStepCount}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

