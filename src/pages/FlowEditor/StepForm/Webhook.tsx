import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import type { Step } from "../../../types/flow";

interface Props {
  step: Step;
  setField: <K extends keyof Step>(key: K, value: Step[K]) => void;
}

export default function WebhookStepForm({ step, setField }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="webhook-url" className="text-sm font-medium">
        URL do Webhook
      </Label>
      <Input
        id="webhook-url"
        value={step.webhookUrl ?? ""}
        onChange={(e) => setField("webhookUrl", e.target.value)}
        placeholder="https://exemplo.com/webhook"
      />
      <p className="text-xs text-muted-foreground">
        A requisição será enviada quando este passo for exibido.
      </p>
    </div>
  );
}
