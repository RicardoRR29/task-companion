"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface ReportSummaryProps {
  flowTitle: string;
  stats: {
    visits: number;
    completions: number;
    completionRate: number;
  };
  insights: {
    averageCompletionTime: number;
    mostProblematicStep: { name: string; totalTime: number };
    completionTrend: number;
    totalSessions: number;
    successfulSessions: number;
  };
  dateRange: {
    from: Date;
    to: Date;
  };
}

export default function ReportSummary({
  flowTitle,
  stats,
  insights,
  dateRange,
}: ReportSummaryProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPerformanceStatus = (rate: number) => {
    if (rate >= 0.8)
      return {
        status: "Excelente",
        color: "text-green-600",
        icon: CheckCircle,
      };
    if (rate >= 0.6)
      return { status: "Bom", color: "text-blue-600", icon: TrendingUp };
    if (rate >= 0.4)
      return {
        status: "Regular",
        color: "text-yellow-600",
        icon: AlertTriangle,
      };
    return { status: "Crítico", color: "text-red-600", icon: TrendingDown };
  };

  const performance = getPerformanceStatus(stats.completionRate);
  const PerformanceIcon = performance.icon;

  return (
    <Card className="print:border print:shadow-none">
      <CardHeader className="print:pb-4">
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Relatório de Analytics
          </CardTitle>
          <p className="text-lg text-gray-600 font-medium">{flowTitle}</p>
          <p className="text-sm text-gray-500">
            Período: {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </p>
          <p className="text-xs text-gray-400">
            Gerado em: {formatDate(new Date())}
          </p>
        </div>
      </CardHeader>

      <CardContent className="print:p-4 space-y-6">
        {/* Executive Summary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Resumo Executivo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total de Sessões:</span>
                <span className="font-semibold">{stats.visits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Sessões Concluídas:
                </span>
                <span className="font-semibold">{stats.completions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Taxa de Conclusão:
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">
                    {(stats.completionRate * 100).toFixed(1)}%
                  </span>
                  <Badge variant="outline" className={performance.color}>
                    <PerformanceIcon className="h-3 w-3 mr-1" />
                    {performance.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Tempo Médio de Conclusão:
                </span>
                <span className="font-semibold">
                  {insights.averageCompletionTime.toFixed(1)}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Passo Mais Lento:</span>
                <span className="font-semibold text-amber-700">
                  {insights.mostProblematicStep.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Tempo do Passo Mais Lento:
                </span>
                <span className="font-semibold text-amber-700">
                  {insights.mostProblematicStep.totalTime.toFixed(1)}s
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Key Insights */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Principais Insights
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Performance Geral:</strong> O fluxo apresenta uma taxa
                de conclusão de{" "}
                <span className={`font-semibold ${performance.color}`}>
                  {(stats.completionRate * 100).toFixed(1)}%
                </span>
                , classificada como{" "}
                <span className={performance.color}>
                  {performance.status.toLowerCase()}
                </span>
                .
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Gargalo Identificado:</strong> O passo "
                {insights.mostProblematicStep.name}" consome{" "}
                {insights.mostProblematicStep.totalTime.toFixed(1)}s em média,
                sendo o mais lento do fluxo.
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Volume de Uso:</strong> O fluxo processou {stats.visits}{" "}
                sessões, com {stats.completions} conclusões bem-sucedidas.
              </p>
            </div>

            {stats.completionRate < 0.7 && (
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Recomendação:</strong> A taxa de conclusão está abaixo
                  do ideal (70%). Considere revisar os passos com maior tempo de
                  execução e possíveis pontos de abandono.
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Report Scope */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Escopo do Relatório
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Este relatório analisa o desempenho do fluxo "{flowTitle}"</p>
            <p>
              • Dados coletados entre {formatDate(dateRange.from)} e{" "}
              {formatDate(dateRange.to)}
            </p>
            <p>
              • Inclui análise de tempo por passo, taxa de conclusão e
              identificação de gargalos
            </p>
            <p>
              • Gráficos e tabelas detalhadas disponíveis nas páginas seguintes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
