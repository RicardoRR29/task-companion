import { Play } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import type { Session, Flow } from "../../types/flow";

interface ProgressCardProps {
  session: Session;
  flow: Flow;
  onResume: () => void;
}

export function ProgressCard({ session, flow, onResume }: ProgressCardProps) {
  const current = (session.currentIndex ?? 0) + 1;
  const total = flow.steps.length;
  const pct = Math.round((current / total) * 100);
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <h3 className="font-semibold">{flow.title}</h3>
          <p className="text-sm text-muted-foreground">
            Passo {current} de {total} ({pct}%)
          </p>
        </div>
        <Button size="sm" onClick={onResume}>
          <Play className="mr-1 h-4 w-4" /> Retomar
        </Button>
      </CardContent>
    </Card>
  );
}
