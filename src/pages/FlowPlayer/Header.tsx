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
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Clock, ArrowLeft } from "lucide-react";
import { useCompanySettings } from "../../hooks/useCompanySettings";

interface Props {
  flowTitle: string;
  current: number;
  total: number;
  progress: number;
  elapsedSeconds: number;
  isExiting: boolean;
  onExit: () => void;
}

export default function PlayerHeader({
  flowTitle,
  current,
  total,
  progress,
  elapsedSeconds,
  isExiting,
  onExit,
}: Props) {
  const { logo } = useCompanySettings();
  return (
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
                    Seu progresso será perdido se você sair agora. Tem certeza que
                    deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onExit}>
                    Sair mesmo assim
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="hidden sm:block">
              {logo && <img src={logo} alt="Logo" className="h-6 mb-1" />}
              <h1 className="font-semibold text-lg">{flowTitle}</h1>
              <p className="text-sm text-muted-foreground">
                Passo {current} de {total}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              <Clock className="mr-1 h-3 w-3" />
              {elapsedSeconds}s
            </Badge>
            <div className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </header>
  );
}
