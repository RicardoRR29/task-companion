import { useState, useCallback, useEffect } from "react";
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
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Type,
  HelpCircle,
  ImageIcon,
} from "lucide-react";
import { nanoid } from "nanoid";

import type { Step, StepOption } from "../../types/flow";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { cn } from "../../utils/cn";

interface Props {
  step: Step;
  steps: Step[];
  onChange: (step: Step) => void;
  onDelete: () => void;
}

const STEP_TYPES = [
  {
    value: "TEXT",
    label: "Texto",
    description: "Exibe conteúdo textual",
    icon: Type,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    disabled: false,
  },
  {
    value: "QUESTION",
    label: "Pergunta",
    description: "Pergunta com opções",
    icon: HelpCircle,
    color: "bg-green-50 text-green-700 border-green-200",
    disabled: false,
  },
  {
    value: "MEDIA",
    label: "Mídia",
    description: "Imagens e YouTube",
    icon: ImageIcon,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    disabled: true,
  },
] as const;

const NO_TARGET_STEP_VALUE = "__NONE__";

export default function StepForm({ step, steps, onChange, onDelete }: Props) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Auto-save indication
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasUnsavedChanges(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [step]);

  const validateStep = useCallback((currentStep: Step): string[] => {
    const errors: string[] = [];

    if (!currentStep.title.trim()) {
      errors.push("Título é obrigatório");
    }

    if (!currentStep.content.trim()) {
      errors.push("Conteúdo é obrigatório");
    }

    if (currentStep.type === "QUESTION") {
      if (!currentStep.options || currentStep.options.length === 0) {
        errors.push("Perguntas devem ter pelo menos uma opção");
      } else {
        currentStep.options.forEach((option, index) => {
          if (!option.label.trim()) {
            errors.push(`Opção ${index + 1} deve ter um rótulo`);
          }
        });
      }
    }

    return errors;
  }, []);

  const setField = useCallback(
    <K extends keyof Step>(key: K, value: Step[K]) => {
      const updatedStep = { ...step, [key]: value };
      onChange(updatedStep);
      setHasUnsavedChanges(true);
      setValidationErrors(validateStep(updatedStep));
    },
    [step, onChange, validateStep]
  );

  const addOption = useCallback(() => {
    const opts = step.options ?? [];
    const newOpt: StepOption = {
      id: nanoid(),
      label: "Nova opção",
      targetStepId: "",
    };
    setField("options", [...opts, newOpt]);
  }, [step.options, setField]);

  const updateOption = useCallback(
    (id: string, key: keyof StepOption, value: string) => {
      if (!step.options) return;
      const opts = step.options.map((o) =>
        o.id === id ? { ...o, [key]: value } : o
      );
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

  const currentStepType = STEP_TYPES.find((type) => type.value === step.type);

  if (isPreviewMode) {
    return (
      <StepPreview step={step} onExitPreview={() => setIsPreviewMode(false)} />
    );
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {currentStepType?.icon && (
            <currentStepType.icon className="h-5 w-5 text-muted-foreground" />
          )}
          <h1 className="text-xl font-semibold">Editar Passo</h1>
          {currentStepType && (
            <Badge
              variant="secondary"
              className={cn("text-xs", currentStepType.color)}
            >
              {currentStepType.label}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Save className="h-3 w-3" />
              Salvando...
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-8">
        {/* Basic Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="step-title" className="text-sm font-medium">
                Título do Passo
              </Label>
              <Input
                id="step-title"
                value={step.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Digite o título do passo..."
                className={cn(
                  "text-base",
                  validationErrors.some((e) => e.includes("Título")) &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="step-type" className="text-sm font-medium">
                Tipo
              </Label>
              <Select
                value={step.type}
                onValueChange={(value) =>
                  setField("type", value as Step["type"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STEP_TYPES.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      disabled={type.disabled}
                    >
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-content" className="text-sm font-medium">
              Conteúdo
            </Label>
            <Textarea
              id="step-content"
              value={step.content}
              onChange={(e) => setField("content", e.target.value)}
              placeholder="Digite o conteúdo do passo..."
              rows={6}
              className={cn(
                "resize-none text-base",
                validationErrors.some((e) => e.includes("Conteúdo")) &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
            <p className="text-xs text-muted-foreground">
              {step.content.length} caracteres • Suporte a Markdown
            </p>
          </div>
        </div>

        {/* Question Options */}
        {step.type === "QUESTION" && (
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
                  <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
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
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={step.options.map((o) => o.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {step.options.map((option, index) => (
                      <OptionItem
                        key={option.id}
                        option={option}
                        index={index}
                        steps={steps}
                        onUpdate={(key, value) =>
                          updateOption(option.id, key, value)
                        }
                        onRemove={() => removeOption(option.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </div>
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

function OptionItem({
  option,
  index,
  steps,
  onUpdate,
  onRemove,
}: OptionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: option.id,
  });

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
            value={
              option.targetStepId === ""
                ? NO_TARGET_STEP_VALUE
                : option.targetStepId
            }
            onValueChange={(value) =>
              onUpdate(
                "targetStepId",
                value === NO_TARGET_STEP_VALUE ? "" : value
              )
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

interface StepPreviewProps {
  step: Step;
  onExitPreview: () => void;
}

function StepPreview({ step, onExitPreview }: StepPreviewProps) {
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Visualização</h2>
        <Button variant="outline" size="sm" onClick={onExitPreview}>
          <EyeOff className="mr-2 h-4 w-4" />
          Voltar à Edição
        </Button>
      </div>

      <Card className="flex-1">
        <CardContent className="p-8 lg:p-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">
              {step.title}
            </h1>

            <div className="prose prose-gray max-w-none mb-8">
              <p className="text-lg leading-relaxed whitespace-pre-wrap text-center">
                {step.content}
              </p>
            </div>

            {step.type === "QUESTION" &&
              step.options &&
              step.options.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-center mb-6">
                    Escolha uma opção:
                  </h3>
                  <div className="space-y-3">
                    {step.options.map((option, index) => (
                      <Button
                        key={option.id}
                        variant="outline"
                        size="lg"
                        className="w-full justify-start text-left h-auto p-4 bg-white hover:bg-gray-50"
                        disabled
                      >
                        <span className="mr-3 text-muted-foreground font-medium">
                          {index + 1}.
                        </span>
                        <span className="text-base">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
