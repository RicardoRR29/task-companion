"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PathItem } from "@/types/flow";

interface SessionRun {
  path: PathItem[];
}

interface StepInfo {
  id: string;
  title: string;
}

interface Props {
  recentRuns: SessionRun[];
  steps: StepInfo[];
  maxDuration: number;
  runsToShow: number | "all";
}

export default function Heatmap({
  recentRuns,
  steps,
  maxDuration,
  runsToShow,
}: Props) {
  // Calcular estatísticas para cada célula
  const getStepStats = (stepId: string) => {
    const times = recentRuns
      .map((run) => run.path.find((p) => p.id === stepId)?.timeSpent || 0)
      .filter((time) => time > 0)
      .map((time) => time / 1000);

    return {
      avg:
        times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      min: times.length > 0 ? Math.min(...times) : 0,
      max: times.length > 0 ? Math.max(...times) : 0,
      count: times.length,
    };
  };

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader className="print:pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl">
            {`Heatmap de Tempo – ${
              runsToShow === "all"
                ? "Todas as Execuções"
                : `Últimas ${runsToShow} Execuções`
            }`}
          </CardTitle>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 border"></div>
              <span>Rápido</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 border"></div>
              <span>Médio</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-800 border"></div>
              <span>Lento</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="print:p-2">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse text-xs sm:text-sm print:text-xs">
              <thead>
                <tr>
                  <th className="border bg-gray-50 p-2 text-left font-medium sm:p-3 print:p-2 print:bg-gray-50">
                    Sessão
                  </th>
                  {steps.map((s) => {
                    const stats = getStepStats(s.id);
                    return (
                      <th
                        key={s.id}
                        className="border bg-gray-50 p-2 text-center font-medium sm:p-3 print:p-2 print:bg-gray-50"
                        style={{ minWidth: "80px" }}
                      >
                        <div className="space-y-1">
                          <div className="truncate font-medium" title={s.title}>
                            {s.title}
                          </div>
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <div>Média: {stats.avg.toFixed(1)}s</div>
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              {stats.count} exec.
                            </Badge>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run, i) => {
                  const map = Object.fromEntries(
                    run.path.map((p) => [p.id, p.timeSpent / 1000])
                  );
                  return (
                    <tr key={i}>
                      <td className="border p-2 font-medium sm:p-3 print:p-2 bg-gray-50">
                        <div className="space-y-1">
                          <div>#{i + 1}</div>
                          <div className="text-xs text-gray-500">
                            Total:{" "}
                            {run.path.reduce((sum, p) => sum + p.timeSpent, 0) /
                              1000}
                            s
                          </div>
                        </div>
                      </td>
                      {steps.map((s, j) => {
                        const v = map[s.id] ?? 0;
                        const alpha = v ? 0.3 + 0.7 * (v / maxDuration) : 0;
                        const bg = v ? `rgba(59,130,246,${alpha})` : "#f3f4f6";
                        const textColor = alpha > 0.6 ? "white" : "black";

                        return (
                          <td
                            key={j}
                            className="border p-2 text-center sm:p-3 print:p-2 print:border"
                            style={{ backgroundColor: bg, color: textColor }}
                          >
                            <div className="space-y-1">
                              <div className="font-medium">
                                {v ? v.toFixed(1) : "–"}
                                {v > 0 && <span className="text-xs">s</span>}
                              </div>
                              {v > 0 && (
                                <div className="text-xs opacity-75">
                                  {(
                                    (v /
                                      run.path.reduce(
                                        (sum, p) => sum + p.timeSpent,
                                        0
                                      )) *
                                    1000 *
                                    100
                                  ).toFixed(0)}
                                  %
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-medium">
                  <td className="border p-2 sm:p-3 print:p-2 print:bg-gray-100">
                    Média
                  </td>
                  {steps.map((s) => {
                    const stats = getStepStats(s.id);
                    return (
                      <td
                        key={s.id}
                        className="border p-2 text-center sm:p-3 print:p-2 print:bg-gray-100"
                      >
                        <div className="space-y-1">
                          <div>{stats.avg.toFixed(1)}s</div>
                          <div className="text-xs text-gray-600">
                            {stats.min.toFixed(1)}-{stats.max.toFixed(1)}s
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
