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
import { db } from "../db";
import type { Session, PathItem, Flow } from "../types/flow";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

interface SessionRun {
  sessionId: string;
  startedAt: number;
  path: PathItem[];
}

export default function Analytics() {
  const { id = "" } = useParams<{ id: string }>();
  const { flows, load, update } = useFlows();
  const [recentRuns, setRecentRuns] = useState<SessionRun[]>([]);
  const [totalByStepData, setTotalByStepData] = useState<
    { name: string; totalTime: number; color: string }[]
  >([]);

  const COLORS = [
    "#4e73df",
    "#1cc88a",
    "#36b9cc",
    "#f6c23e",
    "#e74a3b",
    "#858796",
  ];

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
      const lastFive = all
        .sort((a, b) => b.startedAt - a.startedAt)
        .slice(0, 5);

      setRecentRuns(
        lastFive.map((s) => ({
          sessionId: s.id,
          startedAt: s.startedAt,
          path: Array.isArray(s.path) ? s.path : [],
        }))
      );
    })();
  }, [flow?.id, stats]);

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
  }, [flow?.id]);

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

  const stepTitles = f.steps.map((s) => s.title);
  const timelineData = recentRuns.map((run, idx) => {
    const row: any = { name: `Sessão #${idx + 1}` };
    run.path.forEach((p) => (row[p.title] = +(p.timeSpent / 1000).toFixed(1)));
    return row;
  });

  const allDur = recentRuns
    .flatMap((r) => r.path.map((p) => p.timeSpent))
    .reduce((mx, v) => (v > mx ? v : mx), 0);

  const areaData = recentRuns.map((run, idx) => {
    const row: any = { name: `#${idx + 1}` };
    run.path.forEach((p) => (row[p.title] = +(p.timeSpent / 1000).toFixed(1)));
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
              <div className="flex flex-col gap-2 sm:flex-row">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Tempo total por passo (s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={totalByStepData}
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: window.innerWidth < 640 ? 80 : 60,
                    left: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={window.innerWidth < 640 ? -45 : -30}
                    textAnchor="end"
                    height={window.innerWidth < 640 ? 80 : 60}
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                    interval={0}
                  />
                  <YAxis
                    unit="s"
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                  />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)} s`} />
                  <Legend />
                  <Bar dataKey="totalTime">
                    {totalByStepData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Horizontal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Timeline – Últimas 5 Execuções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timelineData}
                  layout="vertical"
                  margin={{
                    left: window.innerWidth < 640 ? 60 : 80,
                    right: 20,
                    top: 20,
                    bottom: 20,
                  }}
                >
                  <XAxis
                    type="number"
                    unit="s"
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={window.innerWidth < 640 ? 60 : 100}
                    fontSize={window.innerWidth < 640 ? 9 : 11}
                  />
                  <Tooltip formatter={(v: number) => `${v}s`} />
                  <Legend />
                  {stepTitles.map((title, idx) => (
                    <Bar
                      key={title}
                      dataKey={title}
                      stackId="a"
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Heatmap de Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="border bg-gray-50 p-2 text-left font-medium sm:p-3">
                        Sessão
                      </th>
                      {stepTitles.map((t) => (
                        <th
                          key={t}
                          className="border bg-gray-50 p-2 text-center font-medium sm:p-3"
                          style={{ minWidth: "80px" }}
                        >
                          <div className="truncate" title={t}>
                            {t}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentRuns.map((run, i) => {
                      const map = Object.fromEntries(
                        run.path.map((p) => [p.title, p.timeSpent])
                      );
                      return (
                        <tr key={i}>
                          <td className="border p-2 font-medium sm:p-3">
                            #{i + 1}
                          </td>
                          {stepTitles.map((t, j) => {
                            const v = map[t] ?? 0;
                            const alpha = v ? 0.3 + 0.7 * (v / allDur) : 0;
                            const bg = v
                              ? `rgba(59,130,246,${alpha})`
                              : "#f3f4f6";
                            return (
                              <td
                                key={j}
                                className="border p-2 text-center sm:p-3"
                                style={{ backgroundColor: bg }}
                              >
                                {v ? Math.round(v) : "–"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stacked Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Área Empilhada – Últimas 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={areaData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                  />
                  <YAxis
                    unit="s"
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                  />
                  <Tooltip formatter={(v: number) => `${v}s`} />
                  <Legend />
                  {stepTitles.map((title, idx) => (
                    <Area
                      key={title}
                      type="monotone"
                      dataKey={title}
                      stackId="1"
                      stroke={COLORS[idx % COLORS.length]}
                      fill={COLORS[idx % COLORS.length]}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
