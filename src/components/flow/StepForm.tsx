import { type ChangeEvent } from "react";
import type { Step, StepOption } from "../../types/flow";
import { Button } from "../ui/button";

interface Props {
  step: Step;
  onChange(step: Step): void;
}

export default function StepForm({ step, onChange }: Props) {
  /* helpers */
  function setField<K extends keyof Step>(key: K, value: Step[K]) {
    onChange({ ...step, [key]: value });
  }

  function addOption() {
    const opts = step.options ?? [];
    const newOpt: StepOption = { label: "Option", targetStepId: "" };
    setField("options", [...opts, newOpt]);
  }

  function updateOption(idx: number, key: keyof StepOption, value: string) {
    if (!step.options) return;
    const opts = step.options.map((o, i) =>
      i === idx ? { ...o, [key]: value } : o
    );
    setField("options", opts);
  }

  function removeOption(idx: number) {
    if (!step.options) return;
    const opts = step.options.filter((_, i) => i !== idx);
    setField("options", opts);
  }

  return (
    <div className="space-y-4 max-w-xl">
      {/* Título do passo */}
      <label className="block text-sm font-medium">
        Título
        <input
          type="text"
          value={step.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("title", e.target.value as Step["title"])
          }
          className="mt-1 block w-full border rounded p-1"
        />
      </label>

      {/* Tipo de passo */}
      <label className="block text-sm font-medium">
        Tipo
        <select
          value={step.type}
          onChange={(e) => setField("type", e.target.value as Step["type"])}
          className="mt-1 block w-full border rounded p-1"
        >
          <option value="TEXT">Text</option>
          <option value="QUESTION">Question</option>
          <option value="MEDIA" disabled>
            Media (coming soon)
          </option>
        </select>
      </label>

      {/* Conteúdo do passo */}
      <label className="block text-sm font-medium">
        Conteúdo
        <textarea
          rows={4}
          value={step.content}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setField("content", e.target.value as Step["content"])
          }
          className="mt-1 block w-full border rounded p-1"
        />
      </label>

      {/* Opções (para QUESTION) */}
      {step.type === "QUESTION" && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Opções</h4>

          {step.options?.map((opt, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                value={opt.label}
                onChange={(e) => updateOption(idx, "label", e.target.value)}
                placeholder="Label"
                className="flex-1 border rounded p-1"
              />
              <input
                value={opt.targetStepId}
                onChange={(e) =>
                  updateOption(idx, "targetStepId", e.target.value)
                }
                placeholder="Target Step ID"
                className="flex-1 border rounded p-1"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeOption(idx)}
              >
                ✕
              </Button>
            </div>
          ))}

          <Button size="sm" onClick={addOption}>
            + Add option
          </Button>
        </div>
      )}
    </div>
  );
}
