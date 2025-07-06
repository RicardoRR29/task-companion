import { useEffect, useState, useRef } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";
import { useFlows } from "../../hooks/useFlows";
import { usePlayer } from "../../hooks/usePlayer";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import PlayerHeader from "./Header";
import StepCard from "./StepCard";
import CompletionScreen from "./CompletionScreen";
import PlayerSkeleton from "./Skeleton";

export default function FlowPlayer() {
  const { id = "" } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const sessionParam = params.get("session") || undefined;
  const navigate = useNavigate();
  const { flows, load, isLoading } = useFlows();
  const [startTime] = useState(Date.now());
  const pauseStart = useRef<number | null>(null);
  const [pausedTotal, setPausedTotal] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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
  } = usePlayer(flow, sessionParam);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (index === -1) return;
    const tick = () => {
      const now = Date.now();
      const running =
        now -
        startTime -
        pausedTotal -
        (pauseStart.current ? now - pauseStart.current : 0);
      setElapsedSeconds(Math.round(running / 1000));
    };
    const interval = setInterval(tick, 1000);
    tick();
    return () => clearInterval(interval);
  }, [startTime, pausedTotal, index]);

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
      navigate("/");
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
    const running =
      now -
      startTime -
      pausedTotal -
      (pauseStart.current ? now - pauseStart.current : 0);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PlayerHeader
        flowTitle={flow.title}
        current={current}
        total={total}
        progress={progressPercentage}
        elapsedSeconds={elapsedSeconds}
        isPaused={isPaused}
        isExiting={isExiting}
        onPauseResume={handlePauseResume}
        onExit={handleExit}
      />

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-3xl">
          {step && (
            <StepCard
              step={step}
              current={current}
              total={total}
              choose={choose}
              next={next}
              goBack={goBack}
              canGoBack={canGoBack}
            />
          )}
        </div>
      </main>
    </div>
  );
}
