import type React from "react";

import { useState, useRef } from "react";
import { Download, Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useFlows } from "../hooks/useFlows";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";

interface Props {
  flowId?: string;
  onImportSuccess?: (flowId: string) => void;
}

export default function FlowImportExport({ flowId, onImportSuccess }: Props) {
  const { exportFlow, importFlow } = useFlows();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    if (!flowId) return;

    setIsExporting(true);
    try {
      const jsonData = await exportFlow(flowId);

      // Cria e baixa o arquivo
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flow-${flowId}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Fluxo exportado",
        description: "O arquivo foi baixado com sucesso.",
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Erro ao exportar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const newFlowId = await importFlow(text);

      toast({
        title: "Fluxo importado",
        description: "O fluxo foi importado com sucesso.",
      });

      onImportSuccess?.(newFlowId);
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Erro ao importar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Importar / Exportar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export */}
        {flowId && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Exportar Fluxo</Label>
            <p className="text-sm text-muted-foreground">
              Baixe o fluxo atual como arquivo JSON para backup ou
              compartilhamento.
            </p>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exportando..." : "Exportar Fluxo"}
            </Button>
          </div>
        )}

        {/* Import */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Importar Fluxo</Label>
          <p className="text-sm text-muted-foreground">
            Selecione um arquivo JSON de fluxo para importar.
          </p>

          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              variant="outline"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? "Importando..." : "Selecionar Arquivo"}
            </Button>
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              O fluxo importado será criado como uma cópia com status "DRAFT".
              IDs únicos serão gerados automaticamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
