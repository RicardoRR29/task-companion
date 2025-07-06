"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Copy,
  Play,
  BarChart3,
  Edit,
  MoreHorizontal,
  Search,
  Grid3X3,
  List,
} from "lucide-react";
import { useFlows } from "../hooks/useFlows";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { cn } from "../utils/cn";

type ViewMode = "grid" | "list";

export default function Dashboard() {
  const { flows, load, create, clone, isLoading } = useFlows();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCreating, setIsCreating] = useState(false);

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
    } finally {
      setIsCreating(false);
    }
  }

  async function handleClone(id: string, title: string) {
    try {
      const newId = await clone(id);
      navigate(`/flows/${newId}/edit`);
    } catch (error) {
      console.error("Erro ao clonar fluxo:", error);
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
            <Button onClick={handleNew} disabled={isCreating} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? "Criando..." : "Novo Fluxo"}
            </Button>
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
            </div>
          </div>
        </div>

        {/* Content */}
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
                onClone={() => handleClone(flow.id, flow.title)}
                onEdit={() => navigate(`/flows/${flow.id}/edit`)}
                onPlay={() => navigate(`/flows/${flow.id}/play`)}
                onAnalytics={() => navigate(`/flows/${flow.id}/analytics`)}
              />
            ))}
          </div>
        )}

        {/* Stats */}
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
      </div>
    </div>
  );
}

interface FlowCardProps {
  flow: any;
  viewMode: ViewMode;
  onClone: () => void;
  onEdit: () => void;
  onPlay: () => void;
  onAnalytics: () => void;
}

function FlowCard({
  flow,
  viewMode,
  onClone,
  onEdit,
  onPlay,
  onAnalytics,
}: FlowCardProps) {
  const completionRate =
    flow.visits > 0 ? (flow.completions / flow.visits) * 100 : 0;

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg truncate">{flow.title}</h3>
                <Badge variant="secondary" className="shrink-0">
                  {flow.steps.length}{" "}
                  {flow.steps.length === 1 ? "passo" : "passos"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{flow.visits || 0} visitas</span>
                <span>{flow.completions || 0} conclusões</span>
                {completionRate > 0 && (
                  <span>{completionRate.toFixed(1)}% taxa de conclusão</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onPlay}>
                <Play className="h-4 w-4 mr-1" />
                Testar
              </Button>
              <Button variant="ghost" size="sm" onClick={onAnalytics}>
                <BarChart3 className="h-4 w-4 mr-1" />
                Analytics
              </Button>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onClone}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
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
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={onEdit}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
              {flow.title}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {flow.steps.length} {flow.steps.length === 1 ? "passo" : "passos"}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-lg">{flow.visits || 0}</div>
              <div className="text-muted-foreground">Visitas</div>
            </div>
            <div>
              <div className="font-medium text-lg">{flow.completions || 0}</div>
              <div className="text-muted-foreground">Conclusões</div>
            </div>
          </div>

          {/* Completion Rate */}
          {completionRate > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Taxa de conclusão</span>
                <span className="font-medium">
                  {completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
            >
              <Play className="h-3 w-3 mr-1" />
              Testar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onAnalytics();
              }}
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Analytics
            </Button>
          </div>
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
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Nenhum fluxo criado ainda
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          Comece criando seu primeiro fluxo de trabalho para automatizar
          processos e melhorar a experiência dos usuários.
        </p>
        <Button onClick={onCreateFlow} disabled={isCreating} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Criando..." : "Criar Primeiro Fluxo"}
        </Button>
      </CardContent>
    </Card>
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
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          Não encontramos nenhum fluxo com o termo "{searchQuery}". Tente buscar
          por outro termo.
        </p>
        <Button variant="outline" onClick={onClearSearch}>
          Limpar busca
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-6 w-8 mb-1" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div>
                      <Skeleton className="h-6 w-8 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
