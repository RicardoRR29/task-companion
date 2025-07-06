import { useCallback } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import type { Step, StepOption } from "../../../types/flow";
import { cn } from "../../../utils/cn";

interface Props {
  step: Step;
  steps: Step[];
  setField: <K extends keyof Step>(key: K, value: Step[K]) => void;
}

const NO_TARGET_STEP_VALUE = "__NONE__";

export default function QuestionStepForm({ step, steps, setField }: Props) {
  const addOption = useCallback(() => {
    const opts = step.options ?? [];
    const newOpt: StepOption = { id: nanoid(), label: "Nova opção", targetStepId: "" };
    setField("options", [...opts, newOpt]);
  }, [step.options, setField]);

  const updateOption = useCallback(
    (id: string, key: keyof StepOption, value: string) => {
      if (!step.options) return;
      const opts = step.options.map((o) => (o.id === id ? { ...o, [key]: value } : o));
      setField("options", opts);
    },
    [step.options, setField]
  );

  const removeOption = useCallback(
    (id: string) => {
      if (!step.options) return;
      const opts = step.options.filter((o) => o.id !== id);
      setField("options", opts);
    },
    [step.options, setField]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!step.options) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = step.options.findIndex((o) => o.id === active.id);
      const newIndex = step.options.findIndex((o) => o.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOptions = arrayMove(step.options, oldIndex, newIndex);
      setField("options", newOptions);
    },
    [step.options, setField]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Opções de Resposta</h3>
          <p className="text-sm text-muted-foreground">
            Configure as opções disponíveis para esta pergunta
          </p>
        </div>
        <Button size="sm" onClick={addOption}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {!step.options || step.options.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h4 className="font-medium mb-2">Nenhuma opção criada</h4>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
              Adicione pelo menos uma opção de resposta para esta pergunta
            </p>
            <Button variant="outline" onClick={addOption}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira opção
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={step.options.map((o) => o.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {step.options.map((option, index) => (
                <OptionItem
                  key={option.id}
                  option={option}
                  index={index}
                  steps={steps}
                  onUpdate={(key, value) => updateOption(option.id, key, value)}
                  onRemove={() => removeOption(option.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

interface OptionItemProps {
  option: StepOption;
  index: number;
  steps: Step[];
  onUpdate: (key: keyof StepOption, value: string) => void;
  onRemove: () => void;
}

function OptionItem({ option, index, steps, onUpdate, onRemove }: OptionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg transition-all",
        "hover:border-gray-300 hover:shadow-sm",
        isDragging && "shadow-lg border-gray-300"
      )}
    >
      <div
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Badge variant="outline" className="text-xs shrink-0 font-medium">
          {index + 1}
        </Badge>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          <Input
            value={option.label}
            onChange={(e) => onUpdate("label", e.target.value)}
            placeholder="Texto da opção..."
            className="text-sm"
          />
          <Select
            value={option.targetStepId === "" ? NO_TARGET_STEP_VALUE : option.targetStepId}
            onValueChange={(value) =>
              onUpdate("targetStepId", value === NO_TARGET_STEP_VALUE ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Próximo passo (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_TARGET_STEP_VALUE}>Nenhum</SelectItem>
              {steps.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.order + 1}. {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={onRemove}
        className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
