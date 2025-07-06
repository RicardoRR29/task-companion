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
    } else {
      const next = steps[idx + 1];
      if (next) edges.push({ source: step.id, target: next.id });
    }
  });
  return edges;
}
