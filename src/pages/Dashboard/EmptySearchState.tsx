import { Search } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function EmptySearchState({
  searchQuery,
  onClearSearch,
}: {
  searchQuery: string;
  onClearSearch: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Search className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mb-2 font-medium text-gray-900">Nenhum resultado</h3>
      <p className="mb-6 text-sm text-gray-500">
        Nenhum fluxo encontrado para "{searchQuery}".
      </p>
      <Button variant="outline" onClick={onClearSearch}>
        Limpar busca
      </Button>
    </div>
  );
}
