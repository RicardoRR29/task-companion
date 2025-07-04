import { useEffect, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Copy } from "lucide-react";

import { useFlows } from "../hooks/useFlows";
import { Button } from "../components/ui/button";

export default function Dashboard() {
  const { flows, load, create, clone } = useFlows();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function handleNew() {
    const id = await create("New flow");
    navigate(`/flows/${id}/edit`);
  }

  async function handleClone(
    e: MouseEvent<HTMLButtonElement>,
    id: string
  ): Promise<void> {
    e.stopPropagation();
    const newId = await clone(id);
    navigate(`/flows/${newId}/edit`);
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">TACO Dashboard</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo fluxo
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flows.map((f) => (
          <div
            key={f.id}
            className="relative border rounded-lg p-4 hover:shadow transition"
          >
            {/* Clone button */}
            <button
              onClick={(e) => handleClone(e, f.id)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-accent"
              title="Clonar fluxo"
            >
              <Copy className="h-4 w-4" />
            </button>

            {/* Card content */}
            <div
              onClick={() => navigate(`/flows/${f.id}/edit`)}
              className="cursor-pointer"
            >
              <h2 className="font-semibold">{f.title}</h2>
              <p className="text-sm text-muted-foreground">
                {f.steps.length} passo(s) • {f.visits ?? 0} visitas •{" "}
                {f.completions ?? 0} concl.
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary" asChild>
                <Link to={`/flows/${f.id}/play`}>Play</Link>
              </Button>
              <Button size="sm" variant="secondary" asChild>
                <Link to={`/flows/${f.id}/analytics`}>Analytics</Link>
              </Button>
            </div>
          </div>
        ))}

        {flows.length === 0 && (
          <p className="text-muted-foreground">
            Nenhum fluxo ainda — clique em “Novo fluxo”.
          </p>
        )}
      </section>
    </main>
  );
}
