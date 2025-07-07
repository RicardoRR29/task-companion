"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFlows } from "@/hooks/useFlows";
import type { Flow, PathItem, Session } from "@/types/flow";
import { useAnalyticsConfig } from "@/hooks/useAnalyticsConfig";
import { useAnalytics } from "@/hooks/useAnalytics";
import { db } from "@/db";
import AnalyticsHeader from "./AnalyticsHeader";
import ReportSummary from "./ReportSummary";
import PerformanceInsights from "./PerformanceInsights";
import TimelineChart from "./TimelineChart";
import TotalTimeChart from "./TotalTimeChart";
import Heatmap from "./Heatmap";
import StackedAreaChart from "./StackedAreaChart";

const COLORS = [
  "#4e73df",
  "#1cc88a",
  "#36b9cc",
  "#f6c23e",
  "#e74a3b",
  "#858796",
];

interface SessionRun {
  sessionId: string;
  startedAt: number;
  path: PathItem[];
}

export default function Analytics() {
  const { id = "" } = useParams<{ id: string }>();
  const { flows, load, update } = useFlows();
  const { runsToShow, customOptions, setRunsToShow, addCustomOption } =
    useAnalyticsConfig();
  const [newOption, setNewOption] = useState("");
  const [recentRuns, setRecentRuns] = useState<SessionRun[]>([]);
  const [totalByStepData, setTotalByStepData] = useState<
    { name: string; totalTime: number; color: string }[]
  >([]);

  useEffect(() => {
    load();
  }, [load]);

  const flow = flows.find((f) => f.id === id);
  const stats = useAnalytics(flow ?? undefined);

  useEffect(() => {
    if (!flow || !stats) return;
    (async () => {
      const all: Session[] = await db.sessions
        .where("flowId")
        .equals(flow.id)
        .toArray();
      const sorted = all.sort((a, b) => b.startedAt - a.startedAt);
      const limit = runsToShow === "all" ? sorted.length : runsToShow;
      const lastRuns = sorted.slice(0, limit);
      setRecentRuns(
        lastRuns.map((s) => ({
          sessionId: s.id,
          startedAt: s.startedAt,
          path: Array.isArray(s.path) ? s.path : [],
        }))
      );
    })();
  }, [flow, stats, runsToShow]);

  useEffect(() => {
    if (!flow) return;
    (async () => {
      const all: Session[] = await db.sessions
        .where("flowId")
        .equals(flow.id)
        .toArray();
      const agg: Record<string, number> = {};
      all.forEach((s) => {
        if (Array.isArray(s.path)) {
          s.path.forEach((p: PathItem) => {
            agg[p.id] = (agg[p.id] || 0) + p.timeSpent;
          });
        }
      });
      const arr = flow.steps.map((step, idx) => ({
        name: step.title,
        totalTime: +(agg[step.id] || 0) / 1000,
        color: COLORS[idx % COLORS.length],
      }));
      setTotalByStepData(arr);
    })();
  }, [flow]);

  if (!flow) return <p className="p-6">Carregando analytics…</p>;
  if (!stats) return <p className="p-6">Carregando métricas…</p>;

  const f: Flow = flow;
  const st = stats;

  async function handleClear() {
    if (!window.confirm("Deseja limpar todas as métricas deste fluxo?")) return;
    const sessions = await db.sessions.where("flowId").equals(f.id).toArray();
    const ids = sessions.map((s) => s.id);
    if (ids.length) {
      await db.stepEvents.where("sessionId").anyOf(ids).delete();
      await db.sessions.where("flowId").equals(f.id).delete();
    }
    update({ ...f, visits: 0, completions: 0 });
    setRecentRuns([]);
    setTotalByStepData([]);
  }

  const handleAddCustomOption = () => {
    const v = Number.parseInt(newOption, 10);
    if (!isNaN(v) && v > 0) {
      addCustomOption(v);
      setRunsToShow(v);
      setNewOption("");
    }
  };

  const handleExport = () => {
    // Adicionar estilos específicos para impressão
    const printStyles = `
      <style>
        @media print {
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .print\\:break-page { page-break-before: always; }
          .print\\:break-inside-avoid { page-break-inside: avoid; }
          .print\\:text-sm { font-size: 0.875rem; }
          .print\\:text-xs { font-size: 0.75rem; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:table { display: table !important; }
          .print\\:table-row { display: table-row !important; }
          .print\\:table-cell { display: table-cell !important; }
          .print\\:border { border: 1px solid #e5e7eb; }
          .print\\:border-t { border-top: 1px solid #e5e7eb; }
          .print\\:border-b { border-bottom: 1px solid #e5e7eb; }
          .print\\:p-2 { padding: 0.5rem; }
          .print\\:p-4 { padding: 1rem; }
          .print\\:mb-4 { margin-bottom: 1rem; }
          .print\\:mb-6 { margin-bottom: 1.5rem; }
          .print\\:text-center { text-align: center; }
          .print\\:font-bold { font-weight: bold; }
          .print\\:text-gray-600 { color: #4b5563; }
          .print\\:bg-gray-50 { background-color: #f9fafb; }
        }
      </style>
    `;

    // Inserir estilos no head
    const existingStyles = document.querySelector("#print-styles");
    if (existingStyles) {
      existingStyles.remove();
    }

    const styleElement = document.createElement("div");
    styleElement.id = "print-styles";
    styleElement.innerHTML = printStyles;
    document.head.appendChild(styleElement);

    // Imprimir
    window.print();
  };

  const slowest = totalByStepData.reduce(
    (p, c) => (c.totalTime > p.totalTime ? c : p),
    {
      name: "",
      totalTime: 0,
      color: "",
    }
  );

  const steps = f.steps.map((s) => ({ id: s.id, title: s.title }));

  const timelineData = recentRuns.map((run, idx) => {
    const row: { name: string; [key: string]: number | string } = {
      name: `Sessão #${idx + 1}`,
    };
    run.path.forEach((p) => (row[p.id] = +(p.timeSpent / 1000).toFixed(1)));
    return row;
  });

  const allDur = recentRuns
    .flatMap((r) => r.path.map((p) => p.timeSpent / 1000))
    .reduce((mx, v) => (v > mx ? v : mx), 0);

  const areaData = recentRuns.map((run, idx) => {
    const row: { name: string; [key: string]: number | string } = {
      name: `#${idx + 1}`,
    };
    run.path.forEach((p) => (row[p.id] = +(p.timeSpent / 1000).toFixed(1)));
    return row;
  });

  // Calcular insights para o relatório
  const insights = {
    averageCompletionTime:
      recentRuns.length > 0
        ? recentRuns.reduce(
            (sum, run) =>
              sum +
              run.path.reduce((stepSum, step) => stepSum + step.timeSpent, 0),
            0
          ) /
          recentRuns.length /
          1000
        : 0,
    mostProblematicStep: slowest,
    completionTrend: st.completionRate,
    totalSessions: st.visits,
    successfulSessions: st.completions,
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <AnalyticsHeader
          flowTitle={f.title}
          totalVisits={st.visits}
          currentRunsCount={recentRuns.length}
          runsToShow={runsToShow}
          customOptions={customOptions}
          newOption={newOption}
          onRunsToShowChange={setRunsToShow}
          onNewOptionChange={setNewOption}
          onAddCustomOption={handleAddCustomOption}
          onClear={handleClear}
          onExport={handleExport}
        />

        {/* Report Summary - Visible only in print */}
        <div className="hidden print:block print:break-inside-avoid">
          <ReportSummary
            flowTitle={f.title}
            stats={st}
            insights={insights}
            dateRange={{
              from:
                recentRuns.length > 0
                  ? new Date(Math.min(...recentRuns.map((r) => r.startedAt)))
                  : new Date(),
              to:
                recentRuns.length > 0
                  ? new Date(Math.max(...recentRuns.map((r) => r.startedAt)))
                  : new Date(),
            }}
          />
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:break-inside-avoid">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Visitas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900">
                {st.visits}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Conclusões
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900">
                {st.completions}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taxa de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900">
                {(st.completionRate * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">
                Passo mais lento
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm font-medium text-amber-900 mb-1 truncate">
                {slowest.name}
              </div>
              <div className="text-2xl font-bold text-amber-800">
                {slowest.totalTime.toFixed(1)}s
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <PerformanceInsights
          insights={insights}
          steps={steps}
          recentRuns={recentRuns}
        />

        {/* Charts */}
        <div className="print:break-page">
          <TotalTimeChart data={totalByStepData} />
        </div>

        <div className="print:break-page">
          <TimelineChart
            data={timelineData}
            steps={steps}
            colors={COLORS}
            runsToShow={runsToShow}
          />
        </div>

        <div className="print:break-page">
          <Heatmap
            recentRuns={recentRuns}
            steps={steps}
            maxDuration={allDur}
            runsToShow={runsToShow}
          />
        </div>

        <div className="print:break-page">
          <StackedAreaChart
            data={areaData}
            steps={steps}
            colors={COLORS}
            runsToShow={runsToShow}
          />
        </div>
      </div>
    </div>
  );
}
