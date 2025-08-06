import type { Flow, Session, PathItem } from "@/types/flow";
import type { AnalyticsData } from "@/hooks/useAnalytics";

// Define the flow used in analytics mock
export const mockFlow: Flow = {
  id: "mock-flow",
  title: "Integração de Novo Funcionário (mock)",
  status: "DRAFT",
  steps: [
    { id: "step1", order: 1, type: "TEXT", title: "Preparar computador", content: "" },
    { id: "step2", order: 2, type: "TEXT", title: "Instalar IDE", content: "" },
    { id: "step3", order: 3, type: "TEXT", title: "Programador?", content: "" },
    { id: "step4", order: 4, type: "TEXT", title: "Acesso de Admin", content: "" },
    { id: "step5", order: 5, type: "TEXT", title: "Configuração da VPN", content: "" },
    { id: "step6", order: 6, type: "TEXT", title: "Instruções de Segurança", content: "" },
    { id: "step7", order: 7, type: "TEXT", title: "Teste Técnico", content: "" },
    { id: "step8", order: 8, type: "TEXT", title: "Reunião com a equipe", content: "" },
    { id: "step9", order: 9, type: "TEXT", title: "Reunião com PO", content: "" },
    { id: "step10", order: 10, type: "TEXT", title: "Enviar Documentos", content: "" },
    { id: "step11", order: 11, type: "TEXT", title: "Enviar Áudio", content: "" },
    { id: "step12", order: 12, type: "TEXT", title: "Enviar PDF", content: "" },
  ],
  networkGraph: [],
  visits: 10,
  completions: 8,
  updatedAt: Date.now(),
};

// Base durations for each step in minutes
const baseDurations = [5, 30, 2, 15, 80, 5, 3, 10, 25, 15, 5, 2];
const stepIds = mockFlow.steps.map((s) => s.id);
const stepTitles = mockFlow.steps.map((s) => s.title);

// Generate 10 sessions with durations ranging from minutes to hours
export const mockSessions: Session[] = Array.from({ length: 10 }, (_, idx) => {
  const factor = 0.5 + idx * 0.15; // increases duration each session
  const path: PathItem[] = stepIds.map((id, i) => ({
    id,
    title: stepTitles[i],
    timeSpent: baseDurations[i] * factor * 60_000, // convert to ms
  }));
  const total = path.reduce((sum, p) => sum + p.timeSpent, 0);
  const startedAt = Date.now() - (10 - idx) * 60 * 60_000; // sessions spaced an hour apart
  return {
    id: `session${idx + 1}`,
    flowId: mockFlow.id,
    startedAt,
    finishedAt: startedAt + total,
    currentIndex: -1,
    path,
  } as Session;
});

export function computeMockAnalytics(): AnalyticsData {
  const visits = mockFlow.visits;
  const completions = mockFlow.completions;
  const completionRate = visits === 0 ? 0 : completions / visits;

  const stepTimeAgg: Record<string, number[]> = {};
  mockSessions.forEach((s) => {
    s.path.forEach((p) => {
      if (!stepTimeAgg[p.id]) stepTimeAgg[p.id] = [];
      stepTimeAgg[p.id].push(p.timeSpent);
    });
  });

  const avgTimePerStep = Object.entries(stepTimeAgg).map(([stepId, times]) => ({
    stepId,
    avgTime: times.reduce((a, b) => a + b, 0) / times.length,
  }));

  const totalTimePerStep = Object.entries(stepTimeAgg).map(([stepId, times]) => ({
    stepId,
    totalTime: times.reduce((a, b) => a + b, 0),
  }));

  return { visits, completions, completionRate, avgTimePerStep, totalTimePerStep };
}
