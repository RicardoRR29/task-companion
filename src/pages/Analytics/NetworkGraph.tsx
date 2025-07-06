import { useEffect, useMemo, useState } from "react";
import type { Flow, Session } from "../../types/flow";
import { db } from "../../db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface NetworkLink {
  source: string;
  target: string;
  count: number;
}

interface Props {
  flow: Flow;
}

export default function NetworkGraph({ flow }: Props) {
  const [links, setLinks] = useState<NetworkLink[]>([]);

  const nodes: NetworkNode[] = useMemo(
    () =>
      flow.steps.map((s, idx) => ({
        id: s.id,
        label: s.title,
        x: 80 + idx * 120,
        y: 200,
      })),
    [flow.steps]
  );

  useEffect(() => {
    async function load() {
      const sessions: Session[] = await db.sessions
        .where("flowId")
        .equals(flow.id)
        .toArray();

      const counts: Record<string, number> = {};
      sessions.forEach((s) => {
        const path = Array.isArray(s.path) ? s.path : [];
        for (let i = 0; i < path.length - 1; i++) {
          const from = path[i].id;
          const to = path[i + 1].id;
          const key = `${from}->${to}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      });

      const defined: { source: string; target: string }[] = [];
      flow.steps.forEach((step, idx) => {
        if (step.type === "QUESTION" && step.options) {
          step.options.forEach((o) =>
            defined.push({ source: step.id, target: o.targetStepId })
          );
        } else {
          const next = flow.steps[idx + 1];
          if (next) defined.push({ source: step.id, target: next.id });
        }
      });

      const seen = new Set<string>();
      const arr: NetworkLink[] = [];
      defined.forEach(({ source, target }) => {
        const key = `${source}->${target}`;
        if (seen.has(key)) return;
        seen.add(key);
        arr.push({
          source,
          target,
          count: counts[key] || 0,
        });
      });

      Object.entries(counts).forEach(([key, count]) => {
        if (!seen.has(key)) {
          const [source, target] = key.split("->");
          arr.push({ source, target, count });
        }
      });

      setLinks(arr);
    }

    load();
  }, [flow]);

  const maxCount = links.reduce((m, l) => (l.count > m ? l.count : m), 0) || 1;
  const viewWidth = nodes.length * 120 + 160;

  return (
    <Card>
      <CardHeader>
        <CardTitle>🕸️ Network Graph - Conexões do Fluxo</CardTitle>
        <CardDescription>
          Nós = passos, arestas = transições. Espessura = frequência de uso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full overflow-x-auto">
          <svg width="100%" height="100%" viewBox={`0 0 ${viewWidth} 400`}>
            {links.map((link, index) => {
              const source = nodes.find((n) => n.id === link.source);
              const target = nodes.find((n) => n.id === link.target);
              if (!source || !target) return null;
              const width = 1 + (link.count / maxCount) * 6;
              return (
                <line
                  key={index}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#94a3b8"
                  strokeWidth={width}
                  opacity="0.7"
                />
              );
            })}

            {nodes.map((node, index) => (
              <g key={index}>
                <circle cx={node.x} cy={node.y} r={18} fill="#3b82f6" opacity="0.8" />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

