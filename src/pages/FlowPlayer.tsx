import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import { useFlows } from "../hooks/useFlows";
import { usePlayer } from "../hooks/usePlayer";
import { Button } from "../components/ui/button";

export default function FlowPlayer() {
  const { id = "" } = useParams();
  const { flows, load } = useFlows();

  useEffect(() => {
    load();
  }, []);

  const flow = flows.find((f) => f.id === id);
  const { step, index, progress, next, choose } = usePlayer(flow);

  if (!flow) {
    return <p className="p-6">Carregando fluxo…</p>;
  }

  if (index === -1) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold">Fluxo concluído 🎉</h1>
        <Link to="/" className="underline">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const total = flow.steps.length;
  const current = index + 1;

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="h-2 w-full bg-gray-300">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow p-8 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              Questão {current} de {total}
            </span>
            <Link to="/" className="text-sm text-gray-500 hover:underline">
              Sair
            </Link>
          </div>

          {step && (
            <h2 className="text-2xl font-bold mb-4 text-center">
              {step.title}
            </h2>
          )}

          {step && <p className="text-lg mb-6 text-center">{step.content}</p>}

          {step?.type === "QUESTION" ? (
            <div className="flex flex-col gap-3">
              {step.options?.map((opt) => (
                <Button
                  key={`${opt.label}-${opt.targetStepId}`}
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => choose(opt.targetStepId)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <Button size="lg" onClick={next}>
                Próximo
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
