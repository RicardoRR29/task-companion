// src/hooks/useAnalytics.ts
import { useState, useEffect } from "react";
import type { Flow, StepEvent } from "../types/flow";
import { db } from "../db";

export interface AnalyticsData {
  visits: number;
  completions: number;
  completionRate: number; // [0,1]
  avgTimePerStep: { stepId: string; avgTime: number }[];
  totalTimePerStep: { stepId: string; totalTime: number }[]; // novo campo
}

export function useAnalytics(flow?: Flow): AnalyticsData | null {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (!flow) {
      setData(null);
      return;
    }
    const f = flow;

    async function load() {
      const visits = f.visits ?? 0;
      const completions = f.completions ?? 0;
      const completionRate = visits === 0 ? 0 : completions / visits;

      // Carrega todas as sessões deste fluxo
      const sessions = await db.sessions.where("flowId").equals(f.id).toArray();
      const sessionIds = sessions.map((s) => s.id);

      // Busca todos os StepEvents dessas sessões (ou array vazio)
      const events: StepEvent[] =
        sessionIds.length > 0
          ? await db.stepEvents.where("sessionId").anyOf(sessionIds).toArray()
          : [];

      // Agrupa durações por stepId
      const durationsMap: Record<string, number[]> = {};
      for (const e of events) {
        const dur = e.leaveAt - e.enterAt;
        if (!durationsMap[e.stepId]) durationsMap[e.stepId] = [];
        durationsMap[e.stepId].push(dur);
      }

      // Calcula tempo médio e tempo total por step
      const avgTimePerStep = Object.entries(durationsMap).map(
        ([stepId, arr]) => ({
          stepId,
          avgTime: arr.reduce((sum, v) => sum + v, 0) / arr.length,
        })
      );
      const totalTimePerStep = Object.entries(durationsMap).map(
        ([stepId, arr]) => ({
          stepId,
          totalTime: arr.reduce((sum, v) => sum + v, 0),
        })
      );

      setData({
        visits,
        completions,
        completionRate,
        avgTimePerStep,
        totalTimePerStep,
      });
    }

    load();
  }, [flow]);

  return data;
}
