import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useFlows } from "../hooks/useFlows";
import { useAnalytics } from "../hooks/useAnalytics";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { useAnalyticsConfig } from "../hooks/useAnalyticsConfig";
import { db } from "../db";
import type { Session, PathItem, Flow } from "../types/flow";
import TotalTimeChart from "./Analytics/TotalTimeChart";
import TimelineChart from "./Analytics/TimelineChart";
import Heatmap from "./Analytics/Heatmap";
import StackedAreaChart from "./Analytics/StackedAreaChart";

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


  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl">
                Analytics: {f.title}
              </CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row print:hidden">
                <Button
                  size="sm"
                  variant="secondary"
                  asChild
                  className="w-full sm:w-auto"
                >
                  <Link to="/">Voltar</Link>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleClear}
                  className="w-full sm:w-auto"
                >
                  Limpar Métricas
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto"
                >
                  Exportar Relatório
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-end print:hidden">
              <Select
                value={runsToShow === "all" ? "all" : String(runsToShow)}
                onValueChange={(v) =>
                  setRunsToShow(v === "all" ? "all" : parseInt(v, 10))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Últimas {n}
                    </SelectItem>
                  ))}
                  <SelectItem value="all">Todas</SelectItem>
                  {customOptions.map((n) => (
                    <SelectItem key={`c-${n}`} value={String(n)}>
                      Últimas {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Qtd"
                  className="w-20"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const v = parseInt(newOption, 10);
                    if (!isNaN(v) && v > 0) {
                      addCustomOption(v);
                      setRunsToShow(v);
                      setNewOption("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Visits
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold sm:text-3xl">{st.visits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold sm:text-3xl">
                {st.completions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold sm:text-3xl">
                {(st.completionRate * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">
                Passo mais lento
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm font-medium text-yellow-900 sm:text-base">
                {slowest.name}
              </div>
              <div className="text-lg font-bold text-yellow-800 sm:text-xl">
                {slowest.totalTime.toFixed(1)}s
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart - Total Time per Step */}
        <TotalTimeChart data={totalByStepData} />

        {/* Timeline Horizontal */}
        <TimelineChart
          data={timelineData}
          steps={steps}
          colors={COLORS}
          runsToShow={runsToShow}
        />

        {/* Heatmap */}
        <Heatmap
          recentRuns={recentRuns}
          steps={steps}
          maxDuration={allDur}
          runsToShow={runsToShow}
        />

        {/* Stacked Area Chart */}
        <StackedAreaChart
          data={areaData}
          steps={steps}
          colors={COLORS}
          runsToShow={runsToShow}
        />
      </div>
    </div>
  );
}
