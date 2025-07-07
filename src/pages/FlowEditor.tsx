import type React from "react";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  ArrowLeft,
  Menu,
  Eye,
  Settings,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useFlows } from "../hooks/useFlows";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { useToast } from "../hooks/use-toast";
import { cn } from "../utils/cn";
import type { Flow, Step } from "../types/flow";
import StepForm from "./FlowEditor/StepForm";

const STEP_TYPES = {
  TEXT: { label: "Texto", color: "bg-blue-100 text-blue-800" },
  QUESTION: { label: "Pergunta", color: "bg-green-100 text-green-800" },
  MEDIA: { label: "Mídia", color: "bg-purple-100 text-purple-800" },
  CUSTOM: { label: "Personalizado", color: "bg-orange-100 text-orange-800" },
} as const;

export default function FlowEditor() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { flows, load, update, remove, isLoading } = useFlows();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const flow = useMemo(() => flows.find((f) => f.id === id), [flows, id]);
  const selectedStep = useMemo(
    () => flow?.steps.find((s) => s.id === selectedId) ?? null,
    [flow?.steps, selectedId]
  );
  const stepIds = useMemo(
    () => flow?.steps.map((s) => s.id) ?? [],
    [flow?.steps]
  );

  const handleDelete = useCallback(async () => {
    if (!flow) return;

    setIsDeleting(true);
    try {
      await remove(flow.id);
      toast({
        title: "Fluxo excluído",
        description: "O fluxo foi excluído com sucesso.",
      });
      navigate("/");
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o fluxo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [flow, remove, navigate, toast]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!flow) return;

      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = flow.steps.findIndex((s) => s.id === active.id);
      const newIndex = flow.steps.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newSteps = arrayMove(flow.steps, oldIndex, newIndex).map(
        (s, idx) => ({ ...s, order: idx })
      );

      update({ ...flow, steps: newSteps });
      toast({
        title: "Ordem atualizada",
        description: "A ordem dos passos foi atualizada.",
      });
    },
    [flow, update, toast]
  );

  const handleAddStep = useCallback(() => {
    if (!flow) return;

    const newStep: Step = {
      id: nanoid(),
      order: flow.steps.length,
      type: "TEXT",
      title: "Novo passo",
      content: "",
    };

    update({ ...flow, steps: [...flow.steps, newStep] });
    setSelectedId(newStep.id);
    setIsMobileMenuOpen(false);

    toast({
      title: "Passo adicionado",
      description: "Um novo passo foi adicionado ao fluxo.",
    });
  }, [flow, update, toast]);

  const handleStepChange = useCallback(
    (updated: Step) => {
      if (!flow) return;

      const newSteps = flow.steps.map((s) =>
        s.id === updated.id ? updated : s
      );
      update({ ...flow, steps: newSteps });
    },
    [flow, update]
  );

  const handleStepDelete = useCallback(
    (stepId: string) => {
      if (!flow) return;

      const newSteps = flow.steps
        .filter((s) => s.id !== stepId)
        .map((s, idx) => ({ ...s, order: idx }));

      update({ ...flow, steps: newSteps });
      setSelectedId(newSteps[0]?.id ?? null);

      toast({
        title: "Passo removido",
        description: "O passo foi excluído do fluxo.",
      });
    },
    [flow, update, toast]
  );

  const handleStepSelect = useCallback((stepId: string) => {
    setSelectedId(stepId);
    setIsMobileMenuOpen(false);
  }, []);

  if (isLoading) {
    return <FlowEditorSkeleton />;
  }

  if (!flow) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">
                Fluxo não encontrado
              </h2>
              <p className="text-muted-foreground mb-4">
                O fluxo que você está procurando não existe ou foi removido.
              </p>
              <Button asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col border-r bg-white">
        <StepsSidebar
          flow={flow}
          selectedId={selectedId}
          onStepSelect={handleStepSelect}
          onAddStep={handleAddStep}
          onDragEnd={handleDragEnd}
          onStepDelete={handleStepDelete}
          stepIds={stepIds}
        />
      </aside>

      {/* Mobile/Tablet Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold truncate max-w-[200px]">
                {flow.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                {flow.steps.length}{" "}
                {flow.steps.length === 1 ? "passo" : "passos"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <StepsSidebar
                  flow={flow}
                  selectedId={selectedId}
                  onStepSelect={handleStepSelect}
                  onAddStep={handleAddStep}
                  onDragEnd={handleDragEnd}
                  onStepDelete={handleStepDelete}
                  stepIds={stepIds}
                  isMobile
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between p-6 border-b bg-white">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-bold">{flow.title}</h1>
              <p className="text-sm text-muted-foreground">
                {flow.steps.length}{" "}
                {flow.steps.length === 1 ? "passo" : "passos"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir fluxo</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O fluxo "{flow.title}" será
                    permanentemente excluído junto com todos os seus dados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-4 lg:p-6 pt-20 lg:pt-6">
            {selectedStep ? (
              <div className="h-full">
                <div className="mb-4 lg:hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={
                        STEP_TYPES[selectedStep.type as keyof typeof STEP_TYPES]
                          ?.color
                      }
                    >
                      {
                        STEP_TYPES[selectedStep.type as keyof typeof STEP_TYPES]
                          ?.label
                      }
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Passo {selectedStep.order + 1}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold">
                    {selectedStep.title}
                  </h2>
                </div>
                <StepForm
                  step={selectedStep}
                  steps={flow.steps}
                  onChange={handleStepChange}
                  onDelete={() => handleStepDelete(selectedStep.id)}
                />
              </div>
            ) : (
              <EmptyState onAddStep={handleAddStep} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface StepsSidebarProps {
  flow: Flow;
  selectedId: string | null;
  onStepSelect: (id: string) => void;
  onAddStep: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onStepDelete: (id: string) => void;
  stepIds: string[];
  isMobile?: boolean;
}

function StepsSidebar({
  flow,
  selectedId,
  onStepSelect,
  onAddStep,
  onDragEnd,
  onStepDelete,
  stepIds,
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
            <SortableContext
              items={stepIds}
              strategy={verticalListSortingStrategy}
            >
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

interface StepItemProps {
  id: string;
  step: Step;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function StepItem({
  id,
  step,
  index,
  selected,
  onSelect,
  onDelete,
}: StepItemProps) {
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
                STEP_TYPES[step.type as keyof typeof STEP_TYPES]?.color
              )}
            >
              {STEP_TYPES[step.type as keyof typeof STEP_TYPES]?.label}
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

function EmptyState({ onAddStep }: { onAddStep: () => void }) {
  return (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="text-center py-12">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum passo selecionado</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Selecione um passo na barra lateral para editá-lo, ou crie um novo
          passo para começar.
        </p>
        <Button onClick={onAddStep}>
          <Plus className="mr-2 h-4 w-4" />
          Criar primeiro passo
        </Button>
      </CardContent>
    </Card>
  );
}

function FlowEditorSkeleton() {
  return (
    <div className="flex h-screen">
      <aside className="hidden lg:flex w-80 border-r p-4">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </aside>
      <main className="flex-1">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    </div>
  );
}
