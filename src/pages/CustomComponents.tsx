import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, Code, Palette, Zap } from "lucide-react";
import { useCustomComponents } from "../hooks/useCustomComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const getComponentBadges = (component: CustomComponent) => {
    const badges = [];
    if (component.html.trim())
      badges.push({ label: "HTML", icon: Code, variant: "default" as const });
    if (component.css.trim())
      badges.push({
        label: "CSS",
        icon: Palette,
        variant: "secondary" as const,
      });
    if (component.js.trim())
      badges.push({ label: "JS", icon: Zap, variant: "outline" as const });
    return badges;
  };

  return (
    <SidebarLayout title="Componentes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-10">
          <div>
            <h1 className="text-left text-3xl font-bold tracking-tight">
              Componentes
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus componentes personalizados
            </p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Componente
          </Button>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">
              {components.length}{" "}
              {components.length === 1 ? "componente" : "componentes"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {components.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Code className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">Nenhum componente</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-sm">
                  Comece criando seu primeiro componente personalizado
                </p>
                <Button
                  onClick={openNew}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Criar Componente
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="font-medium">Nome</TableHead>
                    <TableHead className="font-medium">Tecnologias</TableHead>
                    <TableHead className="text-right font-medium">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map((component) => (
                    <TableRow
                      key={component.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Code className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{component.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex gap-1.5">
                          {getComponentBadges(component).map((badge, index) => (
                            <Badge
                              key={index}
                              variant={badge.variant}
                              className="text-xs gap-1"
                            >
                              <badge.icon className="h-3 w-3" />
                              {badge.label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(component)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(component.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isNew ? "Novo Componente" : "Editar Componente"}
            </DialogTitle>
          </DialogHeader>
          {current && (
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="cc-name" className="text-sm font-medium">
                  Nome do Componente
                </Label>
                <Input
                  id="cc-name"
                  placeholder="Ex: Botão Personalizado"
                  value={current.name}
                  onChange={(e) =>
                    setCurrent({ ...current!, name: e.target.value })
                  }
                  className="h-10"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-1">
                <div className="space-y-2">
                  <Label
                    htmlFor="cc-html"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    HTML
                  </Label>
                  <Textarea
                    id="cc-html"
                    placeholder="<div>Seu HTML aqui...</div>"
                    rows={4}
                    value={current.html}
                    onChange={(e) =>
                      setCurrent({ ...current!, html: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="cc-css"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Palette className="h-4 w-4" />
                    CSS
                  </Label>
                  <Textarea
                    id="cc-css"
                    placeholder=".minha-classe { color: blue; }"
                    rows={4}
                    value={current.css}
                    onChange={(e) =>
                      setCurrent({ ...current!, css: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="cc-js"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    JavaScript
                  </Label>
                  <Textarea
                    id="cc-js"
                    placeholder="console.log('Hello World!');"
                    rows={4}
                    value={current.js}
                    onChange={(e) =>
                      setCurrent({ ...current!, js: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setFormOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  {isNew ? (
                    <>
                      <Plus className="h-4 w-4" />
                      Criar Componente
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
