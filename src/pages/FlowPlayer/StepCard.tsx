import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { Step } from "../../types/flow";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../utils/cn";
import CustomRenderer from "../../components/CustomRenderer";
import Markdown from "../../components/Markdown";
import { parseInlineMarkdown } from "../../utils/markdown";
import { useCustomComponents } from "../../hooks/useCustomComponents";

interface Props {
  step: Step;
  current: number;
  total: number;
  choose: (targetStepId: string) => void;
  next: () => void;
  goBack: () => void;
  canGoBack: boolean;
}

export default function StepCard({
  step,
  current,
  total,
  choose,
  next,
  goBack,
  canGoBack,
}: Props) {
  const { components } = useCustomComponents();
  const custom = step.componentId
    ? components.find((c) => c.id === step.componentId)
    : null;
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<
    "loading" | "success" | "error" | null
  >(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  useEffect(() => {
    if (step.type !== "WEBHOOK") return;
    setShowWebhookModal(true);
    setWebhookStatus("loading");
    setErrorText(null);
    setShowErrorDetails(false);
    if (step.webhookUrl) {
      fetch(step.webhookUrl)
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || res.statusText);
          }
        })
        .then(() => {
          setWebhookStatus("success");
          setTimeout(() => {
            setShowWebhookModal(false);
            next();
          }, 1000);
        })
        .catch((err) => {
          setWebhookStatus("error");
          setErrorText(String(err));
        });
    } else {
      setWebhookStatus("error");
      setErrorText("URL não definida");
    }
  }, [step.id, step.webhookUrl, step.type, next]);

  return (
    <>
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-8 sm:p-12">
          <div className="space-y-8">
            {/* Step Header */}
            <div className="text-center space-y-4">
              <div className="sm:hidden">
                <Badge variant="outline" className="mb-2">
                  Passo {current} de {total}
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                {step.title}
              </h2>
            </div>

            {/* Step Content */}
            <div className="text-center">
              {step.type === "CUSTOM" && custom ? (
                <CustomRenderer
                  html={custom.html}
                  css={custom.css}
                  js={custom.js}
                />
              ) : (
                <Markdown
                  content={step.content}
                  className="prose prose-lg max-w-none text-muted-foreground"
                />
              )}
            </div>

            {/* Step Actions */}
            <div className="space-y-6">
              {step.type === "QUESTION" ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-center mb-6">
                    Escolha uma opção:
                  </h3>
                  <div className="grid gap-3">
                    {step.options?.map((opt, optIndex) => (
                      <Button
                        key={`${opt.label}-${opt.targetStepId}-${optIndex}`}
                        variant="outline"
                        size="lg"
                        className="w-full justify-start text-left h-auto p-4 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                        onClick={() => choose(opt.targetStepId)}
                      >
                        <span className="mr-3 text-muted-foreground font-medium">
                          {optIndex + 1}.
                        </span>
                        <span className="text-base">{opt.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button size="lg" onClick={next} className="px-8">
                    {current === total ? "Finalizar" : "Continuar"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  disabled={!canGoBack}
                  className={cn(!canGoBack && "opacity-50 cursor-not-allowed")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: total }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        i < current
                          ? "bg-primary"
                          : i === current - 1
                          ? "bg-primary/60 scale-125"
                          : "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
                <div className="w-16" /> {/* Spacer for alignment */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Modal */}
      {step.type === "WEBHOOK" && showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm text-center space-y-4">
            {webhookStatus === "loading" && (
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            )}
            {webhookStatus === "success" && (
              <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
            )}
            {webhookStatus === "error" && (
              <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            )}
            <p className="font-medium">
              {webhookStatus === "loading" && "Enviando webhook..."}
              {webhookStatus === "success" && "Webhook executado com sucesso!"}
              {webhookStatus === "error" && "Erro ao executar webhook."}
            </p>
            {webhookStatus === "error" && errorText && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowErrorDetails((v) => !v)}
                >
                  {showErrorDetails ? "Esconder erro" : "Exibir erro"}
                </Button>
                {showErrorDetails && (
                  <pre className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto text-left whitespace-pre-wrap break-words">
                    {errorText}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
