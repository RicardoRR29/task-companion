import { Plus } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function EmptyState({ onAddStep }: { onAddStep: () => void }) {
  return (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="text-center py-12">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum passo selecionado</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Selecione um passo na barra lateral para editá-lo, ou crie um novo passo para começar.
        </p>
        <Button onClick={onAddStep}>
          <Plus className="mr-2 h-4 w-4" />
          Criar primeiro passo
        </Button>
      </CardContent>
    </Card>
  );
}
