import { Flow } from "../../types/flow";

interface Props {
  flows: Flow[];
}

export default function DashboardStats({ flows }: Props) {
  const totalVisits = flows.reduce((acc, flow) => acc + (flow.visits || 0), 0);
  const totalCompletions = flows.reduce(
    (acc, flow) => acc + (flow.completions || 0),
    0
  );

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{flows.length}</div>
          <div className="text-sm text-muted-foreground">Total de Fluxos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{totalVisits}</div>
          <div className="text-sm text-muted-foreground">Total de Visitas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{totalCompletions}</div>
          <div className="text-sm text-muted-foreground">Total de Conclusões</div>
        </div>
      </div>
    </div>
  );
}
