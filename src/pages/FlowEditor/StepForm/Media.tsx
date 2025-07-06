import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import type { Step } from "../../../types/flow";

interface Props {
  step: Step;
  setField: <K extends keyof Step>(key: K, value: Step[K]) => void;
}

export default function MediaStepForm({ step, setField }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="media-url">URL da Mídia</Label>
        <Input
          id="media-url"
          value={step.mediaUrl || ""}
          onChange={(e) => setField("mediaUrl", e.target.value)}
          placeholder="https://exemplo.com/arquivo.png"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="media-type">Tipo</Label>
        <Select
          value={step.mediaType || "image"}
          onValueChange={(val) => setField("mediaType", val as Step["mediaType"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Imagem</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {step.mediaUrl && step.mediaType === "image" && (
        <img src={step.mediaUrl} alt="preview" className="max-h-60 mx-auto" />
      )}
      {step.mediaUrl && step.mediaType === "video" && (
        <video src={step.mediaUrl} controls className="max-h-60 mx-auto" />
      )}
    </div>
  );
}
