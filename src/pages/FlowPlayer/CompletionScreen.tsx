import { Home, CheckCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

interface Props {
  flowTitle: string;
  totalSteps: number;
  elapsedTime: number;
  onBackToDashboard: () => void;
}

export default function CompletionScreen({
  flowTitle,
  totalSteps,
  elapsedTime,
  onBackToDashboard,
}: Props) {
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
              <h1 className="text-2xl font-bold text-gray-900">Fluxo Concluído! 🎉</h1>
              <p className="text-muted-foreground">
                Você completou com sucesso o fluxo "{flowTitle}"
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalSteps}</div>
                <div className="text-sm text-muted-foreground">Passos completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatTime(elapsedTime)}</div>
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
