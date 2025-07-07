import { useEffect, useMemo, useCallback, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { DragEndEvent } from "@dnd-kit/core";
import { Trash2, ArrowLeft, Menu, Eye, Settings } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { useFlows } from "../../hooks/useFlows";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
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
} from "../../components/ui/alert-dialog";
import { useToast } from "../../hooks/use-toast";
import StepForm from "./StepForm";
import StepsSidebar from "./StepsSidebar";
import EmptyState from "./EmptyState";
import FlowEditorSkeleton from "./Skeleton";
import type { Step } from "../../types/flow";

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
          stepTypes={STEP_TYPES}
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
                  stepTypes={STEP_TYPES}
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
