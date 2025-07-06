import { Search } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

interface EmptySearchStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export function EmptySearchState({ searchQuery, onClearSearch }: EmptySearchStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          Não encontramos nenhum fluxo com o termo "{searchQuery}". Tente buscar por outro termo.
        </p>
        <Button variant="outline" onClick={onClearSearch}>Limpar busca</Button>
      </CardContent>
    </Card>
  );
}
