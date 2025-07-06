"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Download,
  Upload,
  Trash2,
  Settings,
  CheckSquare,
  Square,
  X,
  Play,
} from "lucide-react";
import { useFlows } from "../hooks/useFlows";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import type { Flow, Session } from "../types/flow";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { db } from "../db";
import { Input } from "../components/ui/input";
import { FlowCard } from "../components/dashboard/FlowCard";
import { ProgressCard } from "../components/dashboard/ProgressCard";
import { EmptyState } from "../components/dashboard/EmptyState";
import { EmptySearchState } from "../components/dashboard/EmptySearchState";
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton";
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
import { Badge } from "@/components/ui/badge";

type ViewMode = "grid" | "list";

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    async function fetchProgress() {
      const sessions = await db.sessions
        .where("isPaused")
        .equals(true)
        .and((s) => !s.finishedAt)
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
    } finally {
      setIsCreating(false);
    }
  }

  async function handleClone(id: string) {
    try {
      const newId = await clone(id);
      navigate(`/flows/${newId}/edit`);
    } catch (error) {
      console.error("Erro ao clonar fluxo:", error);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    setSelectedIds(filteredFlows.map((f) => f.id));
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
      a.download = `flows-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar fluxos:", error);
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
        title: "Fluxos excluídos",
        description: "Os fluxos selecionados foram removidos.",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir os fluxos. Tente novamente.",
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
    } catch (error) {
      console.error("Erro ao importar fluxo:", error);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <header className="space-y-6 mb-8">
          {/* Top Bar - Title and Settings */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Meus Fluxos
              </h1>
              <p className="text-muted-foreground">
                Gerencie e monitore seus fluxos de trabalho
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Configurações</span>
              </Link>
            </Button>
          </div>

          {/* Primary Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Main Action */}
            <Button
              onClick={handleNew}
              disabled={isCreating}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? "Criando..." : "Novo Fluxo"}
            </Button>

            {/* Secondary Actions */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                variant="outline"
                size="lg"
                className="flex-1 sm:flex-none"
              >
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">
                  {isImporting ? "Importando..." : "Importar"}
                </span>
                <span className="sm:hidden">
                  {isImporting ? "..." : "Importar"}
                </span>
              </Button>

              {flows.length > 0 && (
                <Button
                  onClick={() => {
                    setIsSelecting((v) => !v);
                    setSelectedIds([]);
                  }}
                  variant={isSelecting ? "secondary" : "outline"}
                  size="lg"
                  className="flex-1 sm:flex-none"
                >
                  {isSelecting ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Cancelar</span>
                      <span className="sm:hidden">Sair</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Selecionar</span>
                      <span className="sm:hidden">Selec.</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fluxos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Limpar busca</span>
                </Button>
              )}
            </div>

            {/* Controls and View Options */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left Side - View Mode */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                  Visualização:
                </span>
                <div className="flex border rounded-lg p-1 bg-muted/50">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 px-3 text-xs"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Grade</span>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 px-3 text-xs"
                  >
                    <List className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Lista</span>
                  </Button>
                </div>
              </div>

              {/* Right Side - Selection Actions */}
              {isSelecting && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleSelectAll}
                    size="sm"
                    variant="outline"
                    className="text-xs bg-transparent"
                  >
                    <CheckSquare className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">Selecionar Todos</span>
                    <span className="sm:hidden">Todos</span>
                    {selectedIds.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {selectedIds.length}
                      </Badge>
                    )}
                  </Button>

                  <Button
                    onClick={handleExportSelected}
                    disabled={isExporting || selectedIds.length === 0}
                    size="sm"
                    variant="outline"
                    className="text-xs bg-transparent"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">
                      {isExporting ? "Exportando..." : "Exportar"}
                    </span>
                    <span className="sm:hidden">
                      {isExporting ? "..." : "Exp."}
                    </span>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={isDeleting || selectedIds.length === 0}
                        size="sm"
                        variant="destructive"
                        className="text-xs"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        <span className="hidden sm:inline">
                          {isDeleting ? "Excluindo..." : "Excluir"}
                        </span>
                        <span className="sm:hidden">
                          {isDeleting ? "..." : "Del"}
                        </span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Excluir {selectedIds.length} fluxos
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Os{" "}
                          {selectedIds.length} fluxos selecionados serão
                          permanentemente excluídos do sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteSelected}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Confirmar Exclusão
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            {/* Selection Status Bar */}
            {isSelecting && selectedIds.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {selectedIds.length}{" "}
                    {selectedIds.length === 1
                      ? "fluxo selecionado"
                      : "fluxos selecionados"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  className="text-xs"
                >
                  Limpar seleção
                </Button>
              </div>
            )}
          </div>
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

        {/* Main Content */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="all" className="flex items-center gap-2">
              Todos
              <Badge variant="secondary" className="ml-1">
                {flows.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              Em Progresso
              <Badge variant="secondary" className="ml-1">
                {progressSessions.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
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
              <>
                {/* Flows Grid/List */}
                <div
                  className={cn(
                    "gap-4 sm:gap-6",
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "flex flex-col space-y-4"
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
                          a.download = `flow-${flow.id}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error("Erro ao exportar fluxo:", err);
                        } finally {
                          setIsExporting(false);
                        }
                      }}
                      isSelecting={isSelecting}
                      isSelected={selectedIds.includes(flow.id)}
                      onSelect={() => toggleSelect(flow.id)}
                    />
                  ))}
                </div>

                {/* Statistics */}
                {flows.length > 0 && (
                  <Card className="mt-8">
                    <CardHeader>
                      <h3 className="text-lg font-semibold">
                        Estatísticas Gerais
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-primary">
                            {flows.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total de Fluxos
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-primary">
                            {flows.reduce(
                              (acc, flow) => acc + (flow.visits || 0),
                              0
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total de Visitas
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-primary">
                            {flows.reduce(
                              (acc, flow) => acc + (flow.completions || 0),
                              0
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total de Conclusões
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {progressSessions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum fluxo em progresso
                  </h3>
                  <p className="text-muted-foreground">
                    Quando você pausar um fluxo durante a execução, ele
                    aparecerá aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
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
      </div>
    </div>
  );
}
