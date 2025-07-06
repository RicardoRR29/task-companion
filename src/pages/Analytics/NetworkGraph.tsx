import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  label: string;
  connections: number;
}

interface NetworkLink {
  source: string;
  target: string;
  strength: number;
}

const networkNodes: NetworkNode[] = [
  { id: "inicio", x: 50, y: 300, label: "Início", connections: 5 },
  { id: "email", x: 150, y: 200, label: "Verificação Email", connections: 4 },
  { id: "social", x: 150, y: 400, label: "Login Social", connections: 1 },
  { id: "dados", x: 300, y: 300, label: "Dados Básicos", connections: 5 },
  { id: "escolha", x: 450, y: 300, label: "Escolha Plano", connections: 4 },
  { id: "premium", x: 600, y: 200, label: "Plano Premium", connections: 2 },
  { id: "gratuito", x: 600, y: 400, label: "Plano Gratuito", connections: 2 },
  { id: "pagamento", x: 750, y: 200, label: "Pagamento", connections: 2 },
  { id: "confirmacao", x: 900, y: 300, label: "Confirmação", connections: 4 },
];

const networkLinks: NetworkLink[] = [
  { source: "inicio", target: "email", strength: 4 },
  { source: "inicio", target: "social", strength: 1 },
  { source: "email", target: "dados", strength: 4 },
  { source: "social", target: "dados", strength: 1 },
  { source: "dados", target: "escolha", strength: 5 },
  { source: "escolha", target: "premium", strength: 2 },
  { source: "escolha", target: "gratuito", strength: 2 },
  { source: "premium", target: "pagamento", strength: 2 },
  { source: "pagamento", target: "confirmacao", strength: 2 },
  { source: "gratuito", target: "confirmacao", strength: 2 },
];

export default function NetworkGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🕸️ Network Graph - Conexões do Fluxo</CardTitle>
        <CardDescription>
          Nós = passos, arestas = transições. Espessura = frequência de uso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <svg width="100%" height="100%" viewBox="0 0 1000 400">
            {networkLinks.map((link, index) => {
              const sourceNode = networkNodes.find((n) => n.id === link.source)!;
              const targetNode = networkNodes.find((n) => n.id === link.target)!;
              return (
                <line
                  key={index}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#94a3b8"
                  strokeWidth={link.strength * 2}
                  opacity="0.6"
                />
              );
            })}

            {networkNodes.map((node, index) => (
              <g key={index}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={Math.sqrt(node.connections) * 8}
                  fill="#3b82f6"
                  opacity="0.8"
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {node.label.split(" ")[0]}
                </text>
                <text
                  x={node.x}
                  y={node.y + 30}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#374151"
                >
                  {node.connections} usuários
                </text>
              </g>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

