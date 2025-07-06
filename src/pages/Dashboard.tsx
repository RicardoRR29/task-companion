"use client";

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
} from "lucide-react";
import { useFlows } from "../hooks/useFlows";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import type { Flow, Session } from "../types/flow";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
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

type ViewMode = "grid" | "list";

export default function Dashboard() {
  const { flows, load, create, clone, exportFlows, importFlow, removeMany, isLoading } = useFlows();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  // Load view mode preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("taco-dashboard-view");
    if (saved === "grid" || saved === "list") {
      setViewMode(saved as ViewMode);
    }
  }, []);

  // Persist view mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("taco-dashboard-view", viewMode);
  }, [viewMode]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tab, setTab] = useState("all");
  const [progressSessions, setProgressSessions] = useState<Session[]>([]);
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-col items-start">
              <h1 className="text-3xl font-bold tracking-tight">Meus Fluxos</h1>
              <p className="text-muted-foreground">
                Gerencie e monitore seus fluxos de trabalho
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
              <Button onClick={handleNew} disabled={isCreating} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? "Criando..." : "Novo Fluxo"}
              </Button>
              {flows.length > 0 && (
                <Button
                  onClick={() => {
                    setIsSelecting((v) => !v);
                    setSelectedIds([]);
                  }}
                  variant={isSelecting ? "secondary" : "outline"}
                  size="lg"
                >
                  {isSelecting ? "Cancelar" : "Selecionar"}
                </Button>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                variant="outline"
                size="lg"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? "Importando..." : "Importar"}
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fluxos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <Button onClick={handleSelectAll} size="sm" variant="outline">
                    Selecionar Todos
                  </Button>
                  <Button
                    onClick={handleExportSelected}
                    disabled={isExporting || selectedIds.length === 0}
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
                        disabled={isDeleting || selectedIds.length === 0}
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
                          onClick={handleDeleteSelected}
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
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="progress">Em Progresso</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
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
                  "gap-6",
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
                    onAnalytics={() => navigate(`/flows/${flow.id}/analytics`)}
                    onExport={async () => {
                      setIsExporting(true);
                      try {
                        const data = await exportFlows([flow.id]);
                        const blob = new Blob([data], { type: "application/json" });
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
            )}

            {flows.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {flows.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total de Fluxos
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {flows.reduce((acc, flow) => acc + (flow.visits || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total de Visitas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
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
              </div>
            )}
          </TabsContent>
          <TabsContent value="progress">
            {progressSessions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  Nenhum fluxo em progresso
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

