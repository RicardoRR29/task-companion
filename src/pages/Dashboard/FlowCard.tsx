import {
  Play,
  BarChart3,
  Edit,
  MoreVertical,
  Copy,
  Download,
  Trash2,
  Check,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { cn } from "../../utils/cn";
import type { Flow } from "../../types/flow";

export type ViewMode = "grid" | "list";

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
  showVisits: boolean;
  showCompletions: boolean;
  showCompletionRate: boolean;
  showStepCount: boolean;
}

export default function FlowCard({
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
  showVisits,
  showCompletions,
  showCompletionRate,
  showStepCount,
}: FlowCardProps) {
  const visits = flow.visits ?? 0;
  const completions = flow.completions ?? 0;
  const completionRate = visits > 0 ? (completions / visits) * 100 : 0;

  if (viewMode === "list") {
    return (
      <Card className="border-gray-200 transition-colors hover:bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {isSelecting && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-gray-300 bg-white">
                  {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                </div>
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="truncate font-medium text-gray-900">
                  {flow.title}
                </h3>
                {showStepCount && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 bg-gray-100 text-gray-600"
                  >
                    {flow.steps.length}
                  </Badge>
                )}
              </div>
              {(showVisits || showCompletions || showCompletionRate) && (
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  {showVisits && <span>{visits} visitas</span>}
                  {showCompletions && <span>{completions} conclusões</span>}
                  {showCompletionRate && completionRate > 0 && (
                    <span>{completionRate.toFixed(0)}%</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPlay}
                className="hidden sm:flex"
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="hidden sm:flex"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onPlay} className="sm:hidden">
                    <Play className="mr-2 h-4 w-4" />
                    Executar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAnalytics} className="sm:hidden">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="sm:hidden" />
                  <DropdownMenuItem onClick={onClone}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
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
      className="group relative cursor-pointer border-gray-200 transition-colors hover:bg-gray-50"
      onClick={isSelecting ? onSelect : onEdit}
    >
      {isSelecting && (
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-gray-300 bg-white shadow-sm">
              <div className="w-4">
                {isSelected && <Check className="text-blue-600" />}
              </div>
            </div>
          </Button>
        </div>
      )}
      <CardContent className={cn("p-6", isSelecting && "pr-16")}>
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-gray-900 group-hover:text-black">
              {flow.title}
            </h3>
            {showStepCount && (
              <p className="mt-2 text-sm text-gray-500">
                {flow.steps.length} passos
              </p>
            )}
          </div>
          {!isSelecting && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
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
          )}
        </div>
        {(showVisits || showCompletions) && (
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            {showVisits && (
              <div>
                <div className="font-medium text-gray-900">{visits}</div>
                <div className="text-gray-500">Visitas</div>
              </div>
            )}
            {showCompletions && (
              <div>
                <div className="font-medium text-gray-900">{completions}</div>
                <div className="text-gray-500">Conclusões</div>
              </div>
            )}
          </div>
        )}
        {showCompletionRate && completionRate > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Taxa</span>
              <span className="font-medium text-gray-900">
                {completionRate.toFixed(0)}%
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-200">
              <div
                className="h-1 rounded-full bg-gray-900 transition-all duration-300"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
          </div>
        )}
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-100 bg-transparent flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              aria-label="Executar"
            >
              <Play className="h-3 w-3 sm:mr-2" />
              <span className="hidden sm:inline">Executar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-100 bg-transparent flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onAnalytics();
              }}
              aria-label="Dados"
            >
              <BarChart3 className="h-3 w-3 sm:mr-2" />
              <span className="hidden sm:inline">Dados</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
