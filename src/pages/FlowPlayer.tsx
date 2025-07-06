"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Clock,
  Pause,
  Play,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useFlows } from "../hooks/useFlows";
import { usePlayer } from "../hooks/usePlayer";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
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
import { cn } from "../utils/cn";

export default function FlowPlayer() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { flows, load, isLoading } = useFlows();
  const [startTime] = useState(Date.now());
  const pauseStart = useRef<number | null>(null);
  const [pausedTotal, setPausedTotal] = useState(0);
  const [tick, setTick] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const flow = flows.find((f) => f.id === id);
  const {
    step,
    index,
    progress,
    next,
    choose,
    canGoBack,
    goBack,
    pause,
    resume,
    isPaused,
  } = usePlayer(flow);

  const handleExit = () => {
    setIsExiting(true);
    navigate("/");
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resume();
      if (pauseStart.current) {
        setPausedTotal((p) => p + Date.now() - pauseStart.current!);
        pauseStart.current = null;
      }
    } else {
      pause();
      pauseStart.current = Date.now();
    }
  };

  if (isLoading) {
    return <PlayerSkeleton />;
  }

  if (!flow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                Fluxo não encontrado
              </h2>
              <p className="text-muted-foreground mb-4">
                O fluxo que você está tentando acessar não existe.
              </p>
              <Button asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (index === -1) {
    const now = Date.now();
    const running = now - startTime - pausedTotal - (pauseStart.current ? now - pauseStart.current : 0);
    const elapsedTime = Math.round(running / 1000);
    return (
      <CompletionScreen
        flowTitle={flow.title}
        totalSteps={flow.steps.length}
        elapsedTime={elapsedTime}
        onBackToDashboard={handleExit}
      />
    );
  }

  const total = flow.steps.length;
  const current = index + 1;
  const progressPercentage = progress * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isExiting}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sair do fluxo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Seu progresso será perdido se você sair agora. Tem certeza
                      que deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExit}>
                      Sair mesmo assim
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="hidden sm:block">
                <h1 className="font-semibold text-lg">{flow.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Passo {current} de {total}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                <Clock className="mr-1 h-3 w-3" />
                {Math.round((Date.now() - startTime - pausedTotal - (pauseStart.current ? Date.now() - pauseStart.current : 0)) / 1000)}s
              </Badge>
              <Button variant="ghost" size="sm" onClick={handlePauseResume}">
                {isPaused ? (
                  <Play className="mr-1 h-3 w-3" />
                ) : (
                  <Pause className="mr-1 h-3 w-3" />
                )}
                {isPaused ? "Retomar" : "Pausar"}
              </Button>
              <div className="text-sm font-medium text-muted-foreground">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-3xl">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12">
              {step && (
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
                    <div className="prose prose-lg max-w-none text-muted-foreground">
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {step.content}
                      </p>
                    </div>
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
                        className={cn(
                          !canGoBack && "opacity-50 cursor-not-allowed"
                        )}
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
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

interface CompletionScreenProps {
  flowTitle: string;
  totalSteps: number;
  elapsedTime: number;
  onBackToDashboard: () => void;
}

function CompletionScreen({
  flowTitle,
  totalSteps,
  elapsedTime,
  onBackToDashboard,
}: CompletionScreenProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Fluxo Concluído! 🎉
              </h1>
              <p className="text-muted-foreground">
                Você completou com sucesso o fluxo "{flowTitle}"
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {totalSteps}
                </div>
                <div className="text-sm text-muted-foreground">
                  Passos completados
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-muted-foreground">Tempo total</div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button onClick={onBackToDashboard} size="lg" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => window.location.reload()}
              >
                Refazer Fluxo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlayerSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-16" />
              <div className="hidden sm:block space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-3xl">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 sm:p-12">
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
