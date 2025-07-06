"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { LogEntry } from "../types/flow";
import { getAuditTrail, getFlowAuditTrail } from "../utils/audit";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";

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

const ACTION_COLORS = {
  FLOW_CREATED: "bg-green-100 text-green-800",
  FLOW_UPDATED: "bg-blue-100 text-blue-800",
  FLOW_DELETED: "bg-red-100 text-red-800",
  FLOW_CLONED: "bg-purple-100 text-purple-800",
  FLOW_EXPORTED: "bg-orange-100 text-orange-800",
  FLOW_IMPORTED: "bg-indigo-100 text-indigo-800",
  FLOWS_LOADED: "bg-gray-100 text-gray-800",
  FLOW_PLAYED: "bg-yellow-100 text-yellow-800",
  SESSION_STARTED: "bg-green-100 text-green-800",
  SESSION_COMPLETED: "bg-emerald-100 text-emerald-800",
  ERROR: "bg-red-100 text-red-800",
} as const;

export default function AuditTrail({ flowId, limit = 100 }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const entries = flowId
          ? await getFlowAuditTrail(flowId, limit)
          : await getAuditTrail(limit);
        setLogs(entries);
      } catch (error) {
        console.error("Failed to load audit trail:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLogs();
  }, [flowId, limit]);

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
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return <AuditTrailSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {flowId ? "Histórico do Fluxo" : "Log de Auditoria"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma atividade registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const Icon =
                  ACTION_ICONS[log.action as keyof typeof ACTION_ICONS] ||
                  Activity;
                const colorClass =
                  ACTION_COLORS[log.action as keyof typeof ACTION_COLORS] ||
                  "bg-gray-100 text-gray-800";

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className={`p-1.5 rounded-full ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {getActionLabel(log.action)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.actor}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(log.ts)}
                      </div>

                      {log.payload && (
                        <div className="text-xs bg-muted p-2 rounded">
                          {typeof log.payload === "string"
                            ? log.payload
                            : JSON.stringify(log.payload, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AuditTrailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg border"
            >
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
