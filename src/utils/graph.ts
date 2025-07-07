import type { Step, GraphEdge } from "../types/flow";

export function buildNetworkGraph(steps: Step[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  steps.forEach((step, idx) => {
    if (step.type === "QUESTION" && step.options && step.options.length) {
      step.options.forEach((o) => {
        if (o.targetStepId) {
          edges.push({ source: step.id, target: o.targetStepId });
        }
      });
    } else if (step.nextStepId !== undefined) {
      const target = steps.find((s) => s.id === step.nextStepId);
      if (target) edges.push({ source: step.id, target: target.id });
    } else {
      const next = steps[idx + 1];
      if (next) edges.push({ source: step.id, target: next.id });
    }
  });
  return edges;
}

export interface GraphLayoutNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

/**
 * Cria um layout simples em árvore a partir dos steps e arestas.
 * Cada nível é posicionado horizontalmente, com nós empilhados verticalmente.
 */
export function computeTreeLayout(
  steps: Step[],
  edges: GraphEdge[]
): GraphLayoutNode[] {
  if (steps.length === 0) return [];

  const startId = steps[0].id;
  const levelMap: Record<string, number> = { [startId]: 0 };
  const levels: Record<number, string[]> = { 0: [startId] };
  const queue = [startId];

  while (queue.length) {
    const id = queue.shift() as string;
    const level = levelMap[id];
    edges
      .filter((e) => e.source === id)
      .forEach((e) => {
        if (!(e.target in levelMap)) {
          levelMap[e.target] = level + 1;
          queue.push(e.target);
          if (!levels[level + 1]) levels[level + 1] = [];
          levels[level + 1].push(e.target);
        }
      });
  }

  return steps.map((s) => {
    const lvl = levelMap[s.id] ?? 0;
    const rowIndex = levels[lvl].indexOf(s.id);
    return {
      id: s.id,
      label: s.title,
      x: 80 + lvl * 150,
      y: 50 + rowIndex * 100,
    } as GraphLayoutNode;
  });
}
