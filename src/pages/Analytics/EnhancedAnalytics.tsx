"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsConfig } from "@/hooks/useAnalyticsConfig";
import type { PathItem } from "@/types/flow";
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

const MOCK_DATA = {
  flow: {
    title: "Fluxo de Exemplo",
    steps: [
      { id: "intro", title: "Introdução" },
      { id: "form", title: "Formulário" },
      { id: "review", title: "Revisão" },
    ],
  },
  sessions: [
    {
      sessionId: "s1",
      startedAt: 1710000000000,
      path: [
        {
          id: "intro",
          title: "Introdução",
          enterAt: 0,
          leaveAt: 5000,
          timeSpent: 5000,
        },
        {
          id: "form",
          title: "Formulário",
          enterAt: 5000,
          leaveAt: 13000,
          timeSpent: 8000,
        },
        {
          id: "review",
          title: "Revisão",
          enterAt: 13000,
          leaveAt: 15000,
          timeSpent: 2000,
        },
      ],
    },
    {
      sessionId: "s2",
      startedAt: 1710001000000,
      path: [
        {
          id: "intro",
          title: "Introdução",
          enterAt: 0,
          leaveAt: 4000,
          timeSpent: 4000,
        },
        {
          id: "form",
          title: "Formulário",
          enterAt: 4000,
          leaveAt: 13000,
          timeSpent: 9000,
        },
        {
          id: "review",
          title: "Revisão",
          enterAt: 13000,
          leaveAt: 16000,
          timeSpent: 3000,
        },
      ],
    },
    {
      sessionId: "s3",
      startedAt: 1710002000000,
      path: [
        {
          id: "intro",
          title: "Introdução",
          enterAt: 0,
          leaveAt: 6000,
          timeSpent: 6000,
        },
        {
          id: "form",
          title: "Formulário",
          enterAt: 6000,
          leaveAt: 13000,
          timeSpent: 7000,
        },
        // Sessão incompleta: não visitou "review"
      ],
    },
  ] as SessionRun[],
};

export default function Analytics() {
  const { runsToShow, customOptions, setRunsToShow, addCustomOption } =
    useAnalyticsConfig();
  const [newOption, setNewOption] = useState("");

  const f = MOCK_DATA.flow;

  const sortedRuns = [...MOCK_DATA.sessions].sort(
    (a, b) => b.startedAt - a.startedAt
  );
  const limit = runsToShow === "all" ? sortedRuns.length : runsToShow;
  const recentRuns = sortedRuns.slice(0, limit);

  const totalByStepData = f.steps.map((step, idx) => {
    const total = MOCK_DATA.sessions.reduce((sum, run) => {
      const p = run.path.find((p) => p.id === step.id);
      return sum + (p ? p.timeSpent : 0);
    }, 0);
    return {
      name: step.title,
      totalTime: +(total / 1000),
      color: COLORS[idx % COLORS.length],
    };
  });

  const visits = MOCK_DATA.sessions.length;
  const completions = MOCK_DATA.sessions.filter(
    (run) => run.path.length === f.steps.length
  ).length;
  const st = {
    visits,
    completions,
    completionRate: completions / visits,
  };

  const handleClear = () => {
    window.alert("Esta é apenas uma demonstração com dados fictícios.");
  };

  const handleAddCustomOption = () => {
    const v = Number.parseInt(newOption, 10);
    if (!isNaN(v) && v > 0) {
      addCustomOption(v);
      setRunsToShow(v);
      setNewOption("");
    }
  };

  const handleExport = () => {
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

    const existingStyles = document.querySelector("#print-styles");
    if (existingStyles) {
      existingStyles.remove();
    }

    const styleElement = document.createElement("div");
    styleElement.id = "print-styles";
    styleElement.innerHTML = printStyles;
    document.head.appendChild(styleElement);

    window.print();
  };

  const slowest = totalByStepData.reduce(
    (p, c) => (c.totalTime > p.totalTime ? c : p),
    { name: "", totalTime: 0, color: "" }
  );

  const steps = f.steps.map((s) => ({ id: s.id, title: s.title }));

  const timelineData = recentRuns.map((run, idx) => {
    const row: { name: string; [key: string]: number | string } = {
      name: `Sessão #${idx + 1}`,
    };
    run.path.forEach(
      (p) => (row[p.id] = +(p.timeSpent / 1000).toFixed(1))
    );
    return row;
  });

  const allDur = recentRuns
    .flatMap((r) => r.path.map((p) => p.timeSpent / 1000))
    .reduce((mx, v) => (v > mx ? v : mx), 0);

  const areaData = recentRuns.map((run, idx) => {
    const row: { name: string; [key: string]: number | string } = {
      name: `#${idx + 1}`,
    };
    run.path.forEach(
      (p) => (row[p.id] = +(p.timeSpent / 1000).toFixed(1))
    );
    return row;
  });

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
                  ? new Date(
                      Math.min(...recentRuns.map((r) => r.startedAt))
                    )
                  : new Date(),
              to:
                recentRuns.length > 0
                  ? new Date(
                      Math.max(...recentRuns.map((r) => r.startedAt))
                    )
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

