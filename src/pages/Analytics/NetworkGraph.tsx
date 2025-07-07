import { useMemo } from "react";
import type { Flow } from "../../types/flow";
import { buildNetworkGraph, computeTreeLayout } from "../../utils/graph";
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
}

interface Props {
  flow: Flow;
}

export default function NetworkGraph({ flow }: Props) {
  const links: NetworkLink[] = useMemo(
    () => buildNetworkGraph(flow.steps),
    [flow.steps]
  );

  const nodes: NetworkNode[] = useMemo(
    () => computeTreeLayout(flow.steps, links),
    [flow.steps, links]
  );

  const viewWidth =
    (nodes.reduce((mx, n) => (n.x > mx ? n.x : mx), 0) || 0) + 160;

  return (
    <Card>
      <CardHeader>
        <CardTitle>🕸️ Network Graph - Conexões do Fluxo</CardTitle>
        <CardDescription>
          Nós = passos, arestas = transições do fluxo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full overflow-x-auto">
          <svg width="100%" height="100%" viewBox={`0 0 ${viewWidth} 400`}>
            {links.map((link, index) => {
              const source = nodes.find((n) => n.id === link.source);
              const target = nodes.find((n) => n.id === link.target);
              if (!source || !target) return null;
              return (
                <line
                  key={index}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#94a3b8"
                  strokeWidth={2}
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

