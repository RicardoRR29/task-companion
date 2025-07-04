// src/pages/Analytics.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { useFlows } from "../hooks/useFlows";
import { useAnalytics } from "../hooks/useAnalytics";
import { Button } from "../components/ui/button";
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
  const stats = useAnalytics(flow);

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
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Analytics: {f.title}</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" asChild>
              <Link to="/">Voltar</Link>
            </Button>
            <Button size="sm" variant="destructive" onClick={handleClear}>
              Limpar Métricas
            </Button>
          </div>
        </header>

        {/* Cards resumidos */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Visits</h2>
            <p className="text-2xl">{st.visits}</p>
          </div>
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Completions</h2>
            <p className="text-2xl">{st.completions}</p>
          </div>
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Completion Rate</h2>
            <p className="text-2xl">{(st.completionRate * 100).toFixed(1)}%</p>
          </div>
          <div className="p-4 border rounded bg-yellow-50">
            <h2 className="font-semibold">Passo mais lento</h2>
            <p>
              {slowest.name} ({slowest.totalTime.toFixed(1)} s)
            </p>
          </div>
        </section>

        {/* Gráfico de barras: Tempo total por passo */}
        <section className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Tempo total por passo (s)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={totalByStepData} margin={{ bottom: 75 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis unit="s" />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)} s`} />
              <Legend verticalAlign="top" />
              <Bar dataKey="totalTime">
                {totalByStepData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Timeline Horizontal */}
        <section className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Timeline – Últimas 5 Execuções</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={timelineData}
              layout="vertical"
              margin={{ left: 80, right: 30, top: 10 }}
            >
              <XAxis type="number" unit="s" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(v: number) => `${v}s`} />
              <Legend verticalAlign="top" />
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
        </section>

        {/* Heatmap de Tempo */}
        <section className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Heatmap de Tempo</h2>
          <div className="overflow-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Sessão</th>
                  {stepTitles.map((t) => (
                    <th key={t} className="border p-2 text-center">
                      {t}
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
                      <td className="border p-2">#{i + 1}</td>
                      {stepTitles.map((t, j) => {
                        const v = map[t] ?? 0;
                        const alpha = v ? 0.3 + 0.7 * (v / allDur) : 0;
                        const bg = v ? `rgba(59,130,246,${alpha})` : "#f3f4f6";
                        return (
                          <td
                            key={j}
                            className="border p-2 text-center"
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
        </section>

        {/* Área Empilhada */}
        <section className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Área Empilhada – Últimas 5</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="s" />
              <Tooltip formatter={(v: number) => `${v}s`} />
              <Legend verticalAlign="top" />
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
        </section>
      </div>
    </div>
  );
}
