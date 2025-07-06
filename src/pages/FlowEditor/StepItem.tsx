import type React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../utils/cn";
import type { Step } from "../../types/flow";

interface StepItemProps {
  id: string;
  step: Step;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  stepTypes: Record<string, { label: string; color: string }>;
}

export default function StepItem({
  id,
  step,
  index,
  selected,
  onSelect,
  onDelete,
  stepTypes,
}: StepItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border p-3 cursor-pointer transition-all",
        "hover:border-primary/50 hover:shadow-sm",
        selected && "border-primary bg-primary/5 shadow-sm",
        isDragging && "shadow-lg"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-1 cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              #{index + 1}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs px-1.5 py-0.5",
                stepTypes[step.type]?.color
              )}
            >
              {stepTypes[step.type]?.label}
            </Badge>
          </div>
          <h4 className="font-medium text-sm truncate">{step.title}</h4>
          {step.content && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {step.content}
            </p>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
