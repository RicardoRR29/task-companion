import { useEffect, useMemo, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";

import { useFlows } from "../hooks/useFlows";
import { Button } from "../components/ui/button";
import StepForm from "../components/flow/StepForm";
import type { Step } from "../types/flow";

export default function FlowEditor() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { flows, load, update, remove } = useFlows();

  useEffect(() => {
    load();
  }, []);

  const found = flows.find((f) => f.id === id);
  if (!found) return <p className="p-6">Carregando…</p>;
  const flow = found;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleDelete() {
    if (confirm("Deseja realmente excluir este fluxo?")) {
      remove(flow.id).then(() => navigate("/"));
    }
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = flow.steps.findIndex((s) => s.id === active.id);
      const newIndex = flow.steps.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newSteps = arrayMove(flow.steps, oldIndex, newIndex).map(
        (s, idx) => ({ ...s, order: idx })
      );
      update({ ...flow, steps: newSteps });
    },
    [flow, update]
  );

  function handleAddStep() {
    const newStep: Step = {
      id: nanoid(),
      order: flow.steps.length,
      type: "TEXT",
      title: "Novo passo", // título padrão
      content: "", // texto vazio
    };
    update({ ...flow, steps: [...flow.steps, newStep] });
    setSelectedId(newStep.id);
  }

  function handleStepChange(updated: Step) {
    const newSteps = flow.steps.map((s) => (s.id === updated.id ? updated : s));
    update({ ...flow, steps: newSteps });
  }

  const stepIds = useMemo(() => flow.steps.map((s) => s.id), [flow.steps]);
  const selectedStep = flow.steps.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="flex h-full">
      <aside className="w-72 shrink-0 border-r p-4 overflow-y-auto">
        <header className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Passos</h2>
          <Button size="sm" variant="secondary" onClick={handleAddStep}>
            <Plus className="h-4 w-4" />
          </Button>
        </header>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stepIds}
            strategy={verticalListSortingStrategy}
          >
            {flow.steps.map((step) => (
              <StepItem
                key={step.id}
                id={step.id}
                label={step.title} // mostra título na lista
                selected={step.id === selectedId}
                onSelect={() => setSelectedId(step.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">{flow.title}</h1>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {selectedStep ? (
          <StepForm step={selectedStep} onChange={handleStepChange} />
        ) : (
          <p className="text-muted-foreground">
            Selecione um passo para editar ou clique “+” para criar.
          </p>
        )}
      </main>
    </div>
  );
}

interface StepItemProps {
  id: string;
  label: string;
  selected: boolean;
  onSelect(): void;
}

function StepItem({ id, label, selected, onSelect }: StepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  } as React.CSSProperties;
  const base = "flex items-center gap-2 mb-2 px-2 py-1 rounded cursor-pointer";
  const hover = "hover:bg-accent";
  const active = selected ? "bg-accent" : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${base} ${hover} ${active}`}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 shrink-0 cursor-grab" />
      <span className="truncate">{label}</span>
    </div>
  );
}
