"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Clock, Users } from "lucide-react";

interface PerformanceInsightsProps {
  insights: {
    averageCompletionTime: number;
    mostProblematicStep: { name: string; totalTime: number };
    completionTrend: number;
    totalSessions: number;
    successfulSessions: number;
  };
  steps: { id: string; title: string }[];
  recentRuns: Array<{
    sessionId: string;
    startedAt: number;
    path: Array<{ id: string; timeSpent: number }>;
  }>;
}

export default function PerformanceInsights({
  insights,
  steps,
  recentRuns,
}: PerformanceInsightsProps) {
  // Calcular estatísticas por passo
  const stepStats = steps
    .map((step) => {
      const stepTimes = recentRuns
        .flatMap((run) => run.path.filter((p) => p.id === step.id))
        .map((p) => p.timeSpent / 1000);

      const avgTime =
        stepTimes.length > 0
          ? stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length
          : 0;
      const minTime = stepTimes.length > 0 ? Math.min(...stepTimes) : 0;
      const maxTime = stepTimes.length > 0 ? Math.max(...stepTimes) : 0;

      return {
        ...step,
        avgTime,
        minTime,
        maxTime,
        executions: stepTimes.length,
        variance: maxTime - minTime,
      };
    })
    .sort((a, b) => b.avgTime - a.avgTime);

  // Calcular tendências
  const dropoffRate =
    insights.totalSessions > 0
      ? ((insights.totalSessions - insights.successfulSessions) /
          insights.totalSessions) *
        100
      : 0;
  const efficiency =
    insights.averageCompletionTime > 0
      ? insights.successfulSessions / insights.averageCompletionTime
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:break-inside-avoid">
      {/* Performance Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Visão Geral de Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Taxa de Conclusão
                </span>
                <span className="text-sm font-semibold">
                  {(insights.completionTrend * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={insights.completionTrend * 100}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Taxa de Abandono
                </span>
                <span className="text-sm font-semibold text-red-600">
                  {dropoffRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={dropoffRate} className="h-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Sessões Totais</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {insights.totalSessions}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Tempo Médio</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {insights.averageCompletionTime.toFixed(1)}s
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Performance Analysis */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Análise por Passo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stepStats.slice(0, 5).map((step, index) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        index === 0
                          ? "destructive"
                          : index === 1
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium truncate">
                      {step.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>Média: {step.avgTime.toFixed(1)}s</span>
                    <span>Min: {step.minTime.toFixed(1)}s</span>
                    <span>Max: {step.maxTime.toFixed(1)}s</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {step.avgTime.toFixed(1)}s
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.executions} exec.
                  </div>
                </div>
              </div>
            ))}
          </div>

          {stepStats.length > 5 && (
            <div className="text-center pt-3 text-sm text-gray-500">
              +{stepStats.length - 5} passos adicionais
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
