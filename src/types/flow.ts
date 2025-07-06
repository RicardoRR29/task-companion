// src/types/flow.ts

/**
 * Opções de ramificação de um passo do tipo QUESTION
 */
export interface StepOption {
  id: string;
  label: string;
  targetStepId: string;
}

/**
 * Representa um passo dentro de um Flow.
 * Inclui título, conteúdo e, opcionalmente, opções de ramificação.
 */
export interface Step {
  id: string;
  order: number;
  type: "TEXT" | "QUESTION" | "MEDIA";
  title: string;
  content: string;
  options?: StepOption[];
}

/**
 * Fluxo completo, composto por uma sequência de Steps.
 * Guarda contadores de visitas e conclusões, além de timestamp de atualização.
 */
export interface Flow {
  id: string;
  title: string;
  description?: string;
  status: "DRAFT" | "PUBLISHED";
  steps: Step[];
  visits?: number;
  completions?: number;
  updatedAt: number;
}

/**
 * Cada item do caminho percorrido em uma sessão,
 * com título do passo e tempo gasto.
 */
export interface PathItem {
  id: string;
  title: string;
  enterAt: number;
  leaveAt: number;
  timeSpent: number;
}

/**
 * Sessão de execução de um Flow,
 * incluindo o array de PathItems.
 */
export interface Session {
  id: string;
  flowId: string;
  startedAt: number;
  finishedAt?: number;
  path: PathItem[];
}

/**
 * Evento de entrada/saída de um Step dentro de uma sessão.
 * Serve para cálculos detalhados de duração por passo.
 */
export interface StepEvent {
  id: string;
  sessionId: string;
  stepId: string;
  enterAt: number;
  leaveAt: number;
}

/**
 * Evento de pausa/resumo de um Step dentro de uma sessão.
 * Usado para calcular o número de pausas.
 */
export interface PauseEvent {
  id: string;
  sessionId: string;
  stepId: string;
  pausedAt: number;
  resumedAt?: number;
}

/**
 * Log de ações importantes (CRUD, erros, conflitos, etc.).
 */
export interface LogEntry {
  id: string;
  ts: number;
  actor: string;
  action: string;
  flowId?: string;
  stepId?: string;
  payload?: any;
}
