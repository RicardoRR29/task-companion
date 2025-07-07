"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Trash2,
  FileDown,
  Plus,
  Filter,
  BarChart3,
  Menu,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/utils/cn";

interface AnalyticsHeaderProps {
  flowTitle: string;
  totalVisits: number;
  currentRunsCount: number;
  runsToShow: number | "all";
  customOptions: number[];
  newOption: string;
  onRunsToShowChange: (value: number | "all") => void;
  onNewOptionChange: (value: string) => void;
  onAddCustomOption: () => void;
  onClear: () => void;
  onExport: () => void;
}

export default function AnalyticsHeader({
  flowTitle,
  totalVisits,
  currentRunsCount,
  runsToShow,
  customOptions,
  newOption,
  onRunsToShowChange,
  onNewOptionChange,
  onAddCustomOption,
  onClear,
  onExport,
}: AnalyticsHeaderProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleAddCustomOption = () => {
    const v = Number.parseInt(newOption, 10);
    if (!isNaN(v) && v > 0) {
      onAddCustomOption();
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-0">
        {/* Navigation & Title Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="h-9 w-9 p-0 hover:bg-gray-100 shrink-0 mt-1"
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar ao dashboard</span>
              </Link>
            </Button>

            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-2 min-w-0">
                  <BarChart3 className="h-5 w-5 text-blue-600 shrink-0" />
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight truncate">
                    Analytics
                  </h1>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200 w-fit"
                >
                  {totalVisits} execuções
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-gray-600 font-medium truncate">
                {flowTitle}
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-2 print:hidden shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={onExport}
              className="h-9 bg-transparent"
            >
              <FileDown className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Exportar</span>
              <span className="lg:hidden">Export</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClear}
              className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Limpar dados</span>
              <span className="lg:hidden">Limpar</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden print:hidden">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="h-9 w-9 p-0"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menu de opções</span>
            </Button>
          </div>
        </div>

        {/* Mobile Actions - Collapsible */}
        <div
          className={cn(
            "sm:hidden print:hidden",
            showMobileFilters ? "block" : "hidden"
          )}
        >
          <div className="flex flex-col space-y-2 pt-3">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onExport}
                className="flex-1 h-9 bg-transparent"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClear}
                className="flex-1 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
        <Separator className="mb-4 sm:mb-6" />

        {/* Filters Section */}
        <div className="space-y-4 print:hidden">
          {/* Filter Header */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filtros:</span>
              </div>
              <Badge
                variant="outline"
                className="bg-gray-50 text-xs sm:text-sm"
              >
                {currentRunsCount} de {totalVisits}
              </Badge>
            </div>

            {/* Mobile: Show filters toggle */}
            <div className="sm:hidden">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="text-blue-600 p-0 h-auto"
              >
                {showMobileFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          <div
            className={cn(
              "space-y-3 sm:space-y-0",
              "sm:flex sm:items-center sm:justify-end sm:space-x-3"
            )}
          >
            {/* Mobile: Collapsible, Desktop: Always visible */}
            <div
              className={cn(
                "space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-3",
                {
                  "hidden sm:flex": !showMobileFilters,
                  block: showMobileFilters,
                }
              )}
            >
              {/* Select Filter */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                <label
                  htmlFor="runs-select"
                  className="text-sm font-medium text-gray-700 sm:whitespace-nowrap"
                >
                  Mostrar:
                </label>
                <Select
                  value={runsToShow === "all" ? "all" : String(runsToShow)}
                  onValueChange={(v) =>
                    onRunsToShowChange(
                      v === "all" ? "all" : Number.parseInt(v, 10)
                    )
                  }
                >
                  <SelectTrigger
                    id="runs-select"
                    className="w-full sm:w-36 h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Últimas 5</SelectItem>
                    <SelectItem value="10">Últimas 10</SelectItem>
                    <SelectItem value="20">Últimas 20</SelectItem>
                    <SelectItem value="50">Últimas 50</SelectItem>
                    <SelectItem value="100">Últimas 100</SelectItem>
                    {customOptions.map((n) => (
                      <SelectItem key={`custom-${n}`} value={String(n)}>
                        Últimas {n}
                      </SelectItem>
                    ))}
                    <SelectItem value="all">Todas as execuções</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Input */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                <label className="text-sm font-medium text-gray-700 sm:sr-only">
                  Quantidade personalizada:
                </label>
                <div className="flex items-center w-full sm:w-auto">
                  <div className="flex items-center border border-gray-300 rounded-md bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 w-full sm:w-auto">
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={newOption}
                      onChange={(e) => onNewOptionChange(e.target.value)}
                      placeholder="Ex: 100"
                      className="w-full sm:w-24 h-9 border-0 focus-visible:ring-0 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCustomOption();
                        }
                      }}
                    />
                    <Separator orientation="vertical" className="h-5" />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleAddCustomOption}
                      className="h-9 w-9 p-0 rounded-l-none hover:bg-gray-100 shrink-0"
                      disabled={
                        !newOption ||
                        isNaN(Number.parseInt(newOption, 10)) ||
                        Number.parseInt(newOption, 10) <= 0
                      }
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">
                        Adicionar filtro customizado
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
