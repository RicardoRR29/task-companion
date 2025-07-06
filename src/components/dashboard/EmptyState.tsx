import { Plus } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

interface EmptyStateProps {
  onCreateFlow: () => void;
  isCreating: boolean;
}

export function EmptyState({ onCreateFlow, isCreating }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum fluxo criado ainda</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          Comece criando seu primeiro fluxo de trabalho para automatizar processos
          e melhorar a experiência dos usuários.
        </p>
        <Button onClick={onCreateFlow} disabled={isCreating} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Criando..." : "Criar Primeiro Fluxo"}
        </Button>
      </CardContent>
    </Card>
  );
}
