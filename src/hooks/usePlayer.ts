// src/hooks/usePlayer.ts

import { useEffect, useState, useRef, useCallback } from "react";
import { nanoid } from "nanoid";

import type { Flow, Step, PathItem } from "../types/flow";
import { db } from "../db";
import { useFlows } from "./useFlows";

interface PlayerState {
  step: Step | null;
  index: number;
  progress: number;
  next(): void;
  choose(targetStepId: string): void;
}

export function usePlayer(flow?: Flow): PlayerState {
  const { update } = useFlows();
  const [index, setIndex] = useState(0);

  const sessionId = useRef<string | null>(null);
  const lastEnterAt = useRef<number>(Date.now());
  const pathRef = useRef<PathItem[]>([]);

  // 1) iniciar sessão apenas uma vez
  useEffect(() => {
    if (!flow) return;
    // se já criamos uma sessão para este fluxo, não recriamos
    if (sessionId.current) return;

    const sid = nanoid();
    sessionId.current = sid;

    // incrementa visits
    update({ ...flow, visits: (flow.visits ?? 0) + 1 });

    // zera o pathRef
    pathRef.current = [];

    // cria sessão com path inicialmente vazio
    db.sessions.put({
      id: sid,
      flowId: flow.id,
      startedAt: Date.now(),
      path: [],
    });

    // armazena timestamp de entrada no passo inicial
    lastEnterAt.current = Date.now();
  }, [flow, update]);

  // 2) registra saída e entrada de passos
  const registerLeaveEnter = useCallback(
    (prevStepId: string, nextStepId: string | null) => {
      if (!sessionId.current || !flow) return;

      const leaveAt = Date.now();
      const enterAt = lastEnterAt.current;
      const timeSpent = leaveAt - enterAt;

      const prevStep = flow.steps.find((s) => s.id === prevStepId)!;
      const item: PathItem = {
        id: prevStepId,
        title: prevStep.title,
        enterAt,
        leaveAt,
        timeSpent,
      };

      pathRef.current.push(item);
      db.sessions.update(sessionId.current, { path: pathRef.current });

      if (nextStepId) {
        lastEnterAt.current = leaveAt;
      }
    },
    [flow]
  );

  // 3) navegação interna
  const goToIndex = useCallback(
    (newIdx: number) => {
      if (!flow) return;

      const prev = flow.steps[index];
      const next = flow.steps[newIdx] ?? null;

      registerLeaveEnter(prev.id, next?.id ?? null);
      setIndex(newIdx);

      if (newIdx === -1) {
        // conclusão
        update({ ...flow, completions: (flow.completions ?? 0) + 1 });
        if (sessionId.current) {
          db.sessions.update(sessionId.current, { finishedAt: Date.now() });
        }
      }
    },
    [flow, index, registerLeaveEnter, update]
  );

  // 4) funções expostas
  const next = useCallback(() => {
    if (!flow) return;
    const newIdx = index + 1 < flow.steps.length ? index + 1 : -1;
    goToIndex(newIdx);
  }, [flow, index, goToIndex]);

  const choose = useCallback(
    (targetStepId: string) => {
      if (!flow) return;
      const targetIdx = flow.steps.findIndex((s) => s.id === targetStepId);
      goToIndex(targetIdx >= 0 ? targetIdx : -1);
    },
    [flow, goToIndex]
  );

  // 5) retorna estado
  if (!flow) {
    return { step: null, index: -1, progress: 0, next, choose };
  }
  const step = index >= 0 ? flow.steps[index] : null;
  const progress =
    flow.steps.length === 0 ? 0 : Math.min((index + 1) / flow.steps.length, 1);

  return { step, index, progress, next, choose };
}
