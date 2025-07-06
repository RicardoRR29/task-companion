import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { Step } from "../../../types/flow";
import type { CustomComponent } from "../../../types/flow";
import { useCustomComponents } from "../../../hooks/useCustomComponents";

interface Props {
  step: Step;
  setField: <K extends keyof Step>(key: K, value: Step[K]) => void;
}

const NEW_VALUE = "__NEW__";

export default function CustomStepForm({ step, setField }: Props) {
  const { components, load, add, update } = useCustomComponents();
  const [current, setCurrent] = useState<CustomComponent | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const comp = components.find((c) => c.id === step.componentId) || null;
    setCurrent(comp);
    setIsNew(!comp && step.componentId === "");
  }, [components, step.componentId]);

  const handleSelect = (value: string) => {
    if (value === NEW_VALUE) {
      setCurrent({ id: "", name: "Novo componente", html: "", css: "", js: "" });
      setIsNew(true);
      setField("componentId", "");
    } else {
      const comp = components.find((c) => c.id === value) || null;
      setCurrent(comp);
      setIsNew(false);
      setField("componentId", value);
    }
  };

  const handleSave = async () => {
    if (!current) return;
    if (isNew) {
      const id = await add({
        name: current.name || `Componente ${components.length + 1}`,
        html: current.html,
        css: current.css,
        js: current.js,
      });
      setField("componentId", id);
      setIsNew(false);
      setCurrent({ ...current, id });
    } else {
      await update(current);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Componente</Label>
        <Select
          value={step.componentId || (isNew ? NEW_VALUE : "")}
          onValueChange={handleSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Escolha ou crie" />
          </SelectTrigger>
          <SelectContent>
            {components.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
            <SelectItem value={NEW_VALUE}>Novo componente...</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {current && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cc-name">Nome</Label>
            <Input
              id="cc-name"
              value={current.name}
              onChange={(e) =>
                setCurrent({ ...current, name: e.target.value })
              }
              placeholder="Nome do componente"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-html">HTML</Label>
            <Textarea
              id="cc-html"
              rows={3}
              value={current.html}
              onChange={(e) =>
                setCurrent({ ...current, html: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-css">CSS</Label>
            <Textarea
              id="cc-css"
              rows={3}
              value={current.css}
              onChange={(e) => setCurrent({ ...current, css: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-js">JS</Label>
            <Textarea
              id="cc-js"
              rows={3}
              value={current.js}
              onChange={(e) => setCurrent({ ...current, js: e.target.value })}
            />
          </div>
          <Button size="sm" onClick={handleSave}>
            {isNew ? "Criar" : "Atualizar"} componente
          </Button>
        </div>
      )}
    </div>
  );
}
