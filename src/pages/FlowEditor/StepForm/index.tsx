"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Save,
  Trash2,
  AlertCircle,
  Type,
  HelpCircle,
  ImageIcon,
} from "lucide-react";
import type { Step } from "../../../types/flow";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { cn } from "../../../utils/cn";

import TextStepForm from "./Text";
import QuestionStepForm from "./Question";
import MediaStepForm from "./Media";
import CustomStepForm from "./Custom";
import CustomRenderer from "../../../components/CustomRenderer";
import Markdown from "../../../components/Markdown";
import { parseInlineMarkdown } from "../../../utils/markdown";
import { useCustomComponents } from "../../../hooks/useCustomComponents";

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
    description: "Imagens e vídeos",
    icon: ImageIcon,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    disabled: true,
  },
  {
    value: "CUSTOM",
    label: "Personalizado",
    description: "HTML/CSS/JS",
    icon: Save,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    disabled: false,
  },
] as const;

export default function StepForm({ step, steps, onChange, onDelete }: Props) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasUnsavedChanges(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [step]);

  const validateStep = useCallback((current: Step): string[] => {
    const errors: string[] = [];
    if (!current.title.trim()) errors.push("Título é obrigatório");
    if (!current.content.trim()) errors.push("Conteúdo é obrigatório");
    if (current.type === "QUESTION" && (!current.options || current.options.length === 0)) {
      errors.push("Perguntas devem ter pelo menos uma opção");
    }
    return errors;
  }, []);

  const setField = useCallback(<K extends keyof Step>(key: K, value: Step[K]) => {
    const updated = { ...step, [key]: value };
    onChange(updated);
    setHasUnsavedChanges(true);
    setValidationErrors(validateStep(updated));
  }, [step, onChange, validateStep]);

  const currentStepType = STEP_TYPES.find((t) => t.value === step.type);

  if (isPreviewMode) {
    return <StepPreview step={step} onExitPreview={() => setIsPreviewMode(false)} />;
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
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
              <Save className="h-3 w-3" /> Salvando...
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(true)}>
            <Eye className="mr-2 h-4 w-4" /> Visualizar
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-y-auto space-y-8">
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
                onValueChange={(val) => setField("type", val as Step["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STEP_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} disabled={t.disabled}>
                      <div className="flex items-center gap-2">
                        <t.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{t.label}</div>
                          <div className="text-xs text-muted-foreground">{t.description}</div>
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

        {step.type === "TEXT" && <TextStepForm step={step} />}
        {step.type === "QUESTION" && (
          <QuestionStepForm step={step} steps={steps} setField={setField} />
        )}
        {step.type === "MEDIA" && <MediaStepForm />}
        {step.type === "CUSTOM" && (
          <CustomStepForm step={step} setField={setField} />
        )}
      </div>
    </div>
  );
}

interface StepPreviewProps {
  step: Step;
  onExitPreview: () => void;
}

function StepPreview({ step, onExitPreview }: StepPreviewProps) {
  const { components } = useCustomComponents();
  const custom = step.componentId
    ? components.find((c) => c.id === step.componentId)
    : null;
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Visualização</h2>
        <Button variant="outline" size="sm" onClick={onExitPreview}>
          <EyeOff className="mr-2 h-4 w-4" /> Voltar à Edição
        </Button>
      </div>
      <Card className="flex-1">
        <CardContent className="p-8 lg:p-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">{step.title}</h1>
            {step.type === "CUSTOM" && custom ? (
              <CustomRenderer html={custom.html} css={custom.css} js={custom.js} />
            ) : (
              <Markdown
                content={step.content}
                className="prose prose-gray max-w-none mb-8 text-center"
              />
            )}
            {step.type === "QUESTION" && step.options && step.options.length > 0 && (
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
                      <span
                        className="text-base"
                        dangerouslySetInnerHTML={{
                          __html: parseInlineMarkdown(option.label),
                        }}
                      />
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
