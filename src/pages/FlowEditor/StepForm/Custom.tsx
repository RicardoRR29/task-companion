import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
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

function sanitizeHtml(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  for (const script of template.content.querySelectorAll("script")) {
    script.remove();
  }
  for (const element of template.content.querySelectorAll("*")) {
    for (const attr of Array.from(element.attributes)) {
      if (attr.name.startsWith("on")) {
        element.removeAttribute(attr.name);
      }
    }
  }
  return template.innerHTML;
}

function sanitizeCss(css: string) {
  return css.replace(/<[^>]*>?/gm, "");
}

interface Props {
  step: Step;
  setField: <K extends keyof Step>(key: K, value: Step[K]) => void;
}

const NEW_VALUE = "__NEW__";

export default function CustomStepForm({ step, setField }: Props) {
  const { components, load, add, update } = useCustomComponents();
  const [current, setCurrent] = useState<CustomComponent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const DEFAULT_COMPONENT: CustomComponent = {
    id: "",
    name: "Novo componente",
    html: "",
    css: "",
    js: "",
  };

  useEffect(() => {
    const comp = components.find((c) => c.id === step.componentId);
    if (comp) {
      setCurrent(comp);
      setIsNew(false);
    } else {
      setCurrent(DEFAULT_COMPONENT);
      setIsNew(true);
    }
  }, [components, step.componentId]);

  const handleSelect = (value: string) => {
    if (value === NEW_VALUE || value === "") {
      setCurrent(DEFAULT_COMPONENT);
      setIsNew(true);
      setField("componentId", "");
    } else {
      const comp = components.find((c) => c.id === value) || DEFAULT_COMPONENT;
      setCurrent(comp);
      setIsNew(false);
      setField("componentId", value);
    }
  };

  const handleSave = async () => {
    if (!current) return;

    const sanitized = {
      ...current,
      html: sanitizeHtml(current.html),
      css: sanitizeCss(current.css),
    };

    if (isNew) {
      const id = await add({
        name: sanitized.name || `Componente ${components.length + 1}`,
        html: sanitized.html,
        css: sanitized.css,
        js: sanitized.js,
      });
      setField("componentId", id);
      setIsNew(false);
      setCurrent({ ...sanitized, id });
    } else {
      await update(sanitized);
      setCurrent(sanitized);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
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
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          {isNew || !step.componentId ? "Criar" : "Editar"}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isNew ? "Novo Componente" : "Editar Componente"}</DialogTitle>
          </DialogHeader>
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
                  onChange={(e) =>
                    setCurrent({ ...current, css: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc-js">JS</Label>
                <Textarea
                  id="cc-js"
                  rows={3}
                  value={current.js}
                  onChange={(e) =>
                    setCurrent({ ...current, js: e.target.value })
                  }
                />
              </div>
              <Button size="sm" onClick={handleSave}>
                {isNew ? "Criar" : "Atualizar"} componente
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
