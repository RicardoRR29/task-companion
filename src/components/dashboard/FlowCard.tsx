import {
  Play,
  BarChart3,
  Edit,
  MoreHorizontal,
  Copy,
  Download,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import type { Flow } from "@/types/flow";

type ViewMode = "grid" | "list";

interface FlowCardProps {
  flow: Flow;
  viewMode: ViewMode;
  onClone: () => void;
  onEdit: () => void;
  onPlay: () => void;
  onAnalytics: () => void;
  onExport: () => void;
  onDelete: () => void;
  isSelecting: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function FlowCard({
  flow,
  viewMode,
  onClone,
  onEdit,
  onPlay,
  onAnalytics,
  onExport,
  onDelete,
  isSelecting,
  isSelected,
  onSelect,
}: FlowCardProps) {
  const visits = flow.visits ?? 0;
  const completions = flow.completions ?? 0;
  const completionRate = visits > 0 ? (completions / visits) * 100 : 0;

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {isSelecting && (
              <input
                type="checkbox"
                className="mr-4 h-4 w-4"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg truncate">{flow.title}</h3>
                <Badge variant="secondary" className="shrink-0">
                  {flow.steps.length}{" "}
                  {flow.steps.length === 1 ? "passo" : "passos"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{flow.visits || 0} visitas</span>
                <span>{flow.completions || 0} conclusões</span>
                {completionRate > 0 && (
                  <span>{completionRate.toFixed(1)}% taxa de conclusão</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onPlay}>
                <Play className="h-4 w-4 mr-1" />
                Executar
              </Button>
              <Button variant="ghost" size="sm" onClick={onAnalytics}>
                <BarChart3 className="h-4 w-4 mr-1" />
                Analytics
              </Button>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onClone}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer relative"
      onClick={isSelecting ? onSelect : onEdit}
    >
      <CardHeader className="pb-3">
        {isSelecting && (
          <input
            type="checkbox"
            className="absolute top-2 left-2 h-4 w-4"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          />
        )}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
              {flow.title}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {flow.steps.length} {flow.steps.length === 1 ? "passo" : "passos"}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onClone();
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onExport();
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-lg">{flow.visits || 0}</div>
              <div className="text-muted-foreground">Visitas</div>
            </div>
            <div>
              <div className="font-medium text-lg">{flow.completions || 0}</div>
              <div className="text-muted-foreground">Conclusões</div>
            </div>
          </div>
          {completionRate > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Taxa de conclusão</span>
                <span className="font-medium">
                  {completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
            >
              <Play className="h-3 w-3 mr-1" />
              Executar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onAnalytics();
              }}
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
