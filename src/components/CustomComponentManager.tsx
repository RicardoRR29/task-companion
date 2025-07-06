import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import type { CustomComponent } from "../types/flow";
import { useCustomComponents } from "../hooks/useCustomComponents";

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

const NEW_VALUE = "__NEW__";

export default function CustomComponentManager() {
  const { components, load, add, update } = useCustomComponents();
  const [current, setCurrent] = useState<CustomComponent | null>(null);
  const [isNew, setIsNew] = useState(false);

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

  const handleSelect = (value: string) => {
    if (value === NEW_VALUE || value === "") {
      setCurrent(DEFAULT_COMPONENT);
      setIsNew(true);
    } else {
      const comp = components.find((c) => c.id === value) || DEFAULT_COMPONENT;
      setCurrent(comp);
      setIsNew(false);
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
      setIsNew(false);
      setCurrent({ ...sanitized, id });
    } else {
      await update(sanitized);
      setCurrent(sanitized);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Componente</Label>
        <Select value={current?.id || (isNew ? NEW_VALUE : "")} onValueChange={handleSelect}>
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
              onChange={(e) => setCurrent({ ...current, name: e.target.value })}
              placeholder="Nome do componente"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-html">HTML</Label>
            <Textarea
              id="cc-html"
              rows={3}
              value={current.html}
              onChange={(e) => setCurrent({ ...current, html: e.target.value })}
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
