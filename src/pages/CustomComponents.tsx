import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus } from "lucide-react";
import { useCustomComponents } from "../hooks/useCustomComponents";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import SidebarLayout from "../components/Sidebar";

import type { CustomComponent } from "../types/flow";


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

export default function CustomComponents() {
  const { components, load, add, update, remove } = useCustomComponents();
  const [formOpen, setFormOpen] = useState(false);
  const [current, setCurrent] = useState<CustomComponent | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setCurrent({ id: "", name: "", html: "", css: "", js: "" });
    setIsNew(true);
    setFormOpen(true);
  };

  const openEdit = (comp: CustomComponent) => {
    setCurrent(comp);
    setIsNew(false);
    setFormOpen(true);
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
      setCurrent({ ...sanitized, id });
    } else {
      await update(sanitized);
    }
    setFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir componente?")) {
      await remove(id);
    }
  };

  return (
    <SidebarLayout title="Componentes">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold hidden lg:block">Componentes</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Novo
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">Nome</th>
                <th className="border-b p-2 w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.id} className="hover:bg-muted/50">
                  <td className="border-b p-2">{c.name}</td>
                  <td className="border-b p-2 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
              {components.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-muted-foreground" colSpan={2}>
                    Nenhum componente cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
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
                    onChange={(e) => setCurrent({ ...current!, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc-html">HTML</Label>
                  <Textarea
                    id="cc-html"
                    rows={3}
                    value={current.html}
                    onChange={(e) => setCurrent({ ...current!, html: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc-css">CSS</Label>
                  <Textarea
                    id="cc-css"
                    rows={3}
                    value={current.css}
                    onChange={(e) => setCurrent({ ...current!, css: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc-js">JS</Label>
                  <Textarea
                    id="cc-js"
                    rows={3}
                    value={current.js}
                    onChange={(e) => setCurrent({ ...current!, js: e.target.value })}
                  />
                </div>
                <Button size="sm" onClick={handleSave}>
                  {isNew ? "Criar" : "Salvar"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </SidebarLayout>
  );
}
