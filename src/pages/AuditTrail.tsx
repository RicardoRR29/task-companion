"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  User,
  FileText,
} from "lucide-react";
import type { LogEntry } from "../types/flow";
import { getAuditTrail, getFlowAuditTrail } from "../utils/audit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Props {
  flowId?: string;
  limit?: number;
}

const ACTION_ICONS = {
  FLOW_CREATED: CheckCircle,
  FLOW_UPDATED: Activity,
  FLOW_DELETED: XCircle,
  FLOW_CLONED: Activity,
  FLOW_EXPORTED: Activity,
  FLOW_IMPORTED: CheckCircle,
  FLOWS_LOADED: Activity,
  FLOW_PLAYED: Activity,
  SESSION_STARTED: CheckCircle,
  SESSION_COMPLETED: CheckCircle,
  ERROR: AlertCircle,
} as const;

const ACTION_VARIANTS = {
  FLOW_CREATED: { variant: "default" as const, color: "text-green-600" },
  FLOW_UPDATED: { variant: "secondary" as const, color: "text-blue-600" },
  FLOW_DELETED: { variant: "destructive" as const, color: "text-red-600" },
  FLOW_CLONED: { variant: "outline" as const, color: "text-purple-600" },
  FLOW_EXPORTED: { variant: "secondary" as const, color: "text-orange-600" },
  FLOW_IMPORTED: { variant: "default" as const, color: "text-indigo-600" },
  FLOWS_LOADED: { variant: "outline" as const, color: "text-gray-600" },
  FLOW_PLAYED: { variant: "secondary" as const, color: "text-yellow-600" },
  SESSION_STARTED: { variant: "default" as const, color: "text-green-600" },
  SESSION_COMPLETED: { variant: "default" as const, color: "text-emerald-600" },
  ERROR: { variant: "destructive" as const, color: "text-red-600" },
} as const;

export default function AuditTrail({ flowId, limit = 100 }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const entries = flowId
          ? await getFlowAuditTrail(flowId, limit)
          : await getAuditTrail(limit);
        setLogs(entries);
        setFilteredLogs(entries);
      } catch (error) {
        console.error("Failed to load audit trail:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, [flowId, limit]);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          getActionLabel(log.action)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof log.payload === "string" &&
            log.payload.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter]);

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      FLOW_CREATED: "Fluxo criado",
      FLOW_UPDATED: "Fluxo atualizado",
      FLOW_DELETED: "Fluxo excluído",
      FLOW_CLONED: "Fluxo clonado",
      FLOW_EXPORTED: "Fluxo exportado",
      FLOW_IMPORTED: "Fluxo importado",
      FLOWS_LOADED: "Fluxos carregados",
      FLOW_PLAYED: "Fluxo executado",
      SESSION_STARTED: "Sessão iniciada",
      SESSION_COMPLETED: "Sessão concluída",
      ERROR: "Erro",
    };
    return labels[action] || action;
  };

  const getUniqueActions = () => {
    const actions = Array.from(new Set(logs.map((log) => log.action)));
    return actions.map((action) => ({
      value: action,
      label: getActionLabel(action),
    }));
  };

  if (isLoading) {
    return <AuditTrailSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Activity className="h-8 w-8" />
              {flowId ? "Histórico do Fluxo" : "Log de Auditoria"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredLogs.length}{" "}
              {filteredLogs.length === 1
                ? "evento registrado"
                : "eventos registrados"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por ação, usuário ou detalhes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {getUniqueActions().map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">
                {searchTerm || actionFilter !== "all"
                  ? "Nenhum resultado encontrado"
                  : "Nenhuma atividade registrada"}
              </h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchTerm || actionFilter !== "all"
                  ? "Tente ajustar os filtros para encontrar o que procura"
                  : "As atividades aparecerão aqui conforme forem executadas"}
              </p>
              {(searchTerm || actionFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setActionFilter("all");
                  }}
                  className="mt-4"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-6">
                {filteredLogs.map((log, index) => {
                  const Icon =
                    ACTION_ICONS[log.action as keyof typeof ACTION_ICONS] ||
                    Activity;
                  const actionConfig = ACTION_VARIANTS[
                    log.action as keyof typeof ACTION_VARIANTS
                  ] || {
                    variant: "outline" as const,
                    color: "text-gray-600",
                  };

                  return (
                    <div
                      key={log.id}
                      className="relative flex items-start gap-4"
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-background border-2 border-border">
                        <Icon className={`h-5 w-5 ${actionConfig.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-6">
                        <div className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base mb-1">
                                {getActionLabel(log.action)}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{log.actor}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTimestamp(log.ts)}</span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={actionConfig.variant}
                              className="shrink-0"
                            >
                              {getActionLabel(log.action)}
                            </Badge>
                          </div>

                          {Boolean(log.payload) && (
                            <>
                              <Separator className="my-3" />
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  Detalhes
                                </div>
                                <div className="bg-muted/50 rounded-md p-3 text-sm font-mono">
                                  {typeof log.payload === "string"
                                    ? log.payload
                                    : JSON.stringify(log.payload, null, 2)}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AuditTrailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <div className="flex gap-3">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
