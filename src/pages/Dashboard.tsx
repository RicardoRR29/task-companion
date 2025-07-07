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
import { useFlows } from "../hooks/useFlows";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import AIFlowModal from "../components/dashboard/AIFlowModal";
import type { Flow, Session } from "../types/flow";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { db } from "../db";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
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
} from "../components/ui/alert-dialog";
import { cn } from "../utils/cn";

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
  const [progressSessions, setProgressSessions] = useState<Session[]>([]);
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

  useEffect(() => {
    async function fetchProgress() {
      const sessions = await db.sessions
        .filter((s) => s.isPaused && !s.finishedAt)
        .toArray();
      setProgressSessions(sessions);
    }
    fetchProgress();
  }, [flows]);

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
      const newId = await importFlow(json);
      toast({
        title: "Fluxo criado",
        description: "Fluxo gerado com IA com sucesso.",
      });
      navigate(`/flows/${newId}/edit`);
    } catch (error) {
      const err = error as Error;
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
          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList className="grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="all">Todos ({flows.length})</TabsTrigger>
              <TabsTrigger value="progress">
                Progresso ({progressSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filteredFlows.length === 0 ? (
                searchQuery ? (
                  <EmptySearchState
                    searchQuery={searchQuery}
                    onClearSearch={() => setSearchQuery("")}
                  />
                ) : (
                  <EmptyState
                    onCreateFlow={handleNew}
                    isCreating={isCreating}
                  />
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
                      onAnalytics={() =>
                        navigate(`/flows/${flow.id}/analytics`)
                      }
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
            </TabsContent>

            <TabsContent value="progress">
              {progressSessions.length === 0 ? (
                <EmptyProgressState />
              ) : (
                <div className="space-y-3">
                  {progressSessions.map((s) => {
                    const flow = flows.find((f) => f.id === s.flowId);
                    if (!flow) return null;
                    return (
                      <ProgressCard
                        key={s.id}
                        session={s}
                        flow={flow}
                        onResume={() =>
                          navigate(`/flows/${flow.id}/play?session=${s.id}`)
                        }
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// Componentes
function FlowCard({
  flow,
  viewMode,
  onClone,
  onEdit,
  onPlay,
  onAnalytics,
  onExport,
  isSelecting,
  isSelected,
  onSelect,
  showVisits,
  showCompletions,
  showCompletionRate,
  showStepCount,
}: {
  flow: Flow;
  viewMode: ViewMode;
  onClone: () => void;
  onEdit: () => void;
  onPlay: () => void;
  onAnalytics: () => void;
  onExport: () => void;
  isSelecting: boolean;
  isSelected: boolean;
  onSelect: () => void;
  showVisits: boolean;
  showCompletions: boolean;
  showCompletionRate: boolean;
  showStepCount: boolean;
}) {
  const visits = flow.visits ?? 0;
  const completions = flow.completions ?? 0;
  const completionRate = visits > 0 ? (completions / visits) * 100 : 0;

  if (viewMode === "list") {
    return (
      <Card className="border-gray-200 transition-colors hover:bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {isSelecting && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                <div className="flex h-4 w-4 items-center justify-center rounded border border-gray-300">
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="truncate font-medium text-gray-900">
                  {flow.title}
                </h3>
                {showStepCount && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 bg-gray-100 text-gray-600"
                  >
                    {flow.steps.length}
                  </Badge>
                )}
              </div>
              {(showVisits || showCompletions || showCompletionRate) && (
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  {showVisits && <span>{visits} visitas</span>}
                  {showCompletions && <span>{completions} conclusões</span>}
                  {showCompletionRate && completionRate > 0 && (
                    <span>{completionRate.toFixed(0)}%</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPlay}
                className="hidden sm:flex"
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="hidden sm:flex"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onPlay} className="sm:hidden">
                    <Play className="mr-2 h-4 w-4" />
                    Executar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit} className="sm:hidden">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAnalytics} className="sm:hidden">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="sm:hidden" />
                  <DropdownMenuItem onClick={onClone}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="group relative cursor-pointer border-gray-200 transition-colors hover:bg-gray-50"
      onClick={isSelecting ? onSelect : onEdit}
    >
      {isSelecting && (
        <div className="absolute left-4 top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <div className="flex h-4 w-4 items-center justify-center rounded border border-gray-300">
              {isSelected && <Check className="h-3 w-3" />}
            </div>
          </Button>
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-gray-900 group-hover:text-black">
              {flow.title}
            </h3>
            {showStepCount && (
              <p className="mt-2 text-sm text-gray-500">
                {flow.steps.length} passos
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onClone();
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onExport();
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {(showVisits || showCompletions) && (
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            {showVisits && (
              <div>
                <div className="font-medium text-gray-900">{visits}</div>
                <div className="text-gray-500">Visitas</div>
              </div>
            )}
            {showCompletions && (
              <div>
                <div className="font-medium text-gray-900">{completions}</div>
                <div className="text-gray-500">Conclusões</div>
              </div>
            )}
          </div>
        )}

        {showCompletionRate && completionRate > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Taxa</span>
              <span className="font-medium text-gray-900">
                {completionRate.toFixed(0)}%
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-200">
              <div
                className="h-1 rounded-full bg-gray-900 transition-all duration-300"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-100 bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
            >
              <Play className="mr-2 h-3 w-3" />
              Executar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-100 bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onAnalytics();
              }}
            >
              <BarChart3 className="mr-2 h-3 w-3" />
              Dados
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressCard({
  session,
  flow,
  onResume,
}: {
  session: Session;
  flow: Flow;
  onResume: () => void;
}) {
  const current = (session.currentIndex ?? 0) + 1;
  const total = flow.steps.length;
  const pct = Math.round((current / total) * 100);

  return (
    <Card className="border-gray-200 transition-colors hover:bg-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-gray-900">{flow.title}</h3>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1 w-24 rounded-full bg-gray-200">
                <div
                  className="h-1 rounded-full bg-gray-900 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">
                {current}/{total}
              </span>
            </div>
          </div>
          <Button onClick={onResume} size="sm" className="ml-4">
            <Play className="mr-2 h-3 w-3" />
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  onCreateFlow,
  isCreating,
}: {
  onCreateFlow: () => void;
  isCreating: boolean;
}) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Plus className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mb-2 font-medium text-gray-900">Nenhum fluxo</h3>
      <p className="mb-6 text-sm text-gray-500">
        Crie seu primeiro fluxo para começar.
      </p>
      <Button onClick={onCreateFlow} disabled={isCreating}>
        <Plus className="mr-2 h-4 w-4" />
        {isCreating ? "Criando..." : "Criar Fluxo"}
      </Button>
    </div>
  );
}

function EmptySearchState({
  searchQuery,
  onClearSearch,
}: {
  searchQuery: string;
  onClearSearch: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Search className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mb-2 font-medium text-gray-900">Nenhum resultado</h3>
      <p className="mb-6 text-sm text-gray-500">
        Nenhum fluxo encontrado para "{searchQuery}".
      </p>
      <Button variant="outline" onClick={onClearSearch}>
        Limpar busca
      </Button>
    </div>
  );
}

function EmptyProgressState() {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Play className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mb-2 font-medium text-gray-900">Nenhum progresso</h3>
      <p className="text-sm text-gray-500">Fluxos pausados aparecerão aqui.</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="mt-1 h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-10" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-1 h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="mt-1 h-4 w-12" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="mt-1 h-4 w-16" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
