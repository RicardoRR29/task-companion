import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Flow, Step } from "../../types/flow";
import StepItem from "./StepItem";
import { Button } from "../../components/ui/button";

interface StepsSidebarProps {
  flow: Flow;
  selectedId: string | null;
  onStepSelect: (id: string) => void;
  onAddStep: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onStepDelete: (id: string) => void;
  stepIds: string[];
  stepTypes: Record<string, { label: string; color: string }>;
  isMobile?: boolean;
}

export default function StepsSidebar({
  flow,
  selectedId,
  onStepSelect,
  onAddStep,
  onDragEnd,
  onStepDelete,
  stepIds,
  stepTypes,
  isMobile = false,
}: StepsSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        {isMobile && (
          <div className="mb-4">
            <h2 className="font-semibold">{flow.title}</h2>
            <p className="text-sm text-muted-foreground">
              {flow.steps.length} {flow.steps.length === 1 ? "passo" : "passos"}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Passos do Fluxo</h3>
          <Button size="sm" onClick={onAddStep}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {flow.steps.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-3">
              Nenhum passo criado ainda
            </p>
            <Button size="sm" variant="outline" onClick={onAddStep}>
              <Plus className="h-4 w-4 mr-1" />
              Criar primeiro passo
            </Button>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {flow.steps.map((step: Step, index: number) => (
                  <StepItem
                    key={step.id}
                    id={step.id}
                    step={step}
                    index={index}
                    selected={step.id === selectedId}
                    onSelect={() => onStepSelect(step.id)}
                    onDelete={() => onStepDelete(step.id)}
                    stepTypes={stepTypes}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
