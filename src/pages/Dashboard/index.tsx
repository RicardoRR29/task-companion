import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFlows } from "../../hooks/useFlows";
import { useToast } from "../../hooks/use-toast";
import { Card, CardContent } from "../../components/ui/card";
import type { Flow, Session } from "../../types/flow";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { db } from "../../db";
import { FlowCard } from "../../components/dashboard/FlowCard";
import { ProgressCard } from "../../components/dashboard/ProgressCard";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { EmptySearchState } from "../../components/dashboard/EmptySearchState";
import { DashboardSkeleton } from "../../components/dashboard/DashboardSkeleton";
import { cn } from "../../utils/cn";
import DashboardHeader from "./Header";
import DashboardFilters from "./Filters";
import DashboardStats from "./Stats";

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

  function handleToggleSelectMode() {
    setIsSelecting((v) => !v);
    setSelectedIds([]);
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
        <div className="mb-8">
          <DashboardHeader
            onNew={handleNew}
            isCreating={isCreating}
            flowsCount={flows.length}
            isSelecting={isSelecting}
            onToggleSelect={handleToggleSelectMode}
            fileInputRef={fileInputRef}
            onImport={handleImport}
            isImporting={isImporting}
          />
          <DashboardFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            isSelecting={isSelecting}
            onSelectAll={handleSelectAll}
            onExportSelected={handleExportSelected}
            onDeleteSelected={handleDeleteSelected}
            isExporting={isExporting}
            isDeleting={isDeleting}
            selectedCount={selectedIds.length}
          />
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
            )}

            {flows.length > 0 && <DashboardStats flows={flows} />}
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
