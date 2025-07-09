import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function EmptyState({
  onCreateFlow,
  isCreating,
}: {
  onCreateFlow: () => void;
  isCreating: boolean;
}) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Plus className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mb-2 font-medium text-gray-900">Nenhum fluxo</h3>
      <p className="mb-6 text-sm text-gray-500">
        Crie seu primeiro fluxo para começar.
      </p>
      <Button onClick={onCreateFlow} disabled={isCreating}>
        <Plus className="mr-2 h-4 w-4" />
        {isCreating ? "Criando..." : "Criar Fluxo"}
      </Button>
    </div>
  );
}
