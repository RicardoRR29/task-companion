import { useEffect, useState, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import type { Flow, Step, PathItem, Session } from "../types/flow";
import { db } from "../db";
import { useFlows } from "./useFlows";
import { logAction } from "../utils/audit";

interface PlayerState {
  step: Step | null;
  index: number;
  progress: number;
  canGoBack: boolean;
  history: number[];
  next(): void;
  choose(targetStepId: string): void;
  goBack(): void;
  restart(): void;
  sessionStart: number;
}

export function usePlayer(flow?: Flow, loadSessionId?: string): PlayerState {
  const { update } = useFlows();
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  const sessionId = useRef<string | null>(null);
  const sessionCreated = useRef(false);
  const sessionStart = useRef<number>(Date.now());
  const lastEnterAt = useRef<number>(Date.now());
  const pathRef = useRef<PathItem[]>([]);

  // Inicializar sessão
  useEffect(() => {
    if (!flow) return;
    if (sessionId.current) return;

    (async () => {
      let existing: Session | undefined;
      if (loadSessionId) {
        existing = await db.sessions.get(loadSessionId);
      } else {
        const arr = await db.sessions
          .where("flowId")
          .equals(flow.id)
          .filter((s) => !s.finishedAt)
          .toArray();
        if (arr.length) {
          existing = arr.sort((a, b) => b.startedAt - a.startedAt)[0];
        }
      }

      if (existing) {
        sessionId.current = existing.id;
        sessionCreated.current = true;
        sessionStart.current = existing.startedAt;
        pathRef.current = Array.isArray(existing.path) ? existing.path : [];
        setIndex(existing.currentIndex ?? 0);
        setHistory(existing.history ?? [existing.currentIndex ?? 0]);
        // pause data deprecated
      } else {
        const sid = nanoid();
        sessionId.current = sid;
        sessionCreated.current = false;
        sessionStart.current = Date.now();
        pathRef.current = [];
        setHistory([0]);
      }

      lastEnterAt.current = Date.now();
    })();
  }, [flow, update, loadSessionId]);

  // Registrar saída e entrada de passos
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

      if (!sessionCreated.current) {
        sessionCreated.current = true;

        update({ ...flow, visits: (flow.visits ?? 0) + 1 });

        db.sessions.put({
          id: sessionId.current,
          flowId: flow.id,
          startedAt: sessionStart.current,
          path: pathRef.current,
          currentIndex: index,
          history,
        });

        logAction(
          "SESSION_STARTED",
          "user",
          {
            sessionId: sessionId.current,
            flowTitle: flow.title,
          },
          flow.id
        );
      } else {
        db.sessions.update(sessionId.current, { path: pathRef.current });
      }

      // Registra evento detalhado
      db.stepEvents.add({
        id: nanoid(),
        sessionId: sessionId.current,
        stepId: prevStepId,
        enterAt,
        leaveAt,
      });

      if (nextStepId) {
        lastEnterAt.current = leaveAt;
      }
    },
    [flow, index, history, update]
  );


  // Navegação
  const goToIndex = useCallback(
    (newIdx: number, addToHistory = true) => {
      if (!flow) return;

      const prev = flow.steps[index];
      const next = flow.steps[newIdx] ?? null;

      if (prev) {
        registerLeaveEnter(prev.id, next?.id ?? null);
      }

      const newHistory = addToHistory
        ? [...history, newIdx]
        : [...history.slice(0, -1), newIdx];

      setIndex(newIdx);
      setHistory(newHistory);

      if (sessionId.current && sessionCreated.current) {
        const upd: any = { currentIndex: newIdx, history: newHistory };
        if (newIdx === -1) {
          upd.finishedAt = Date.now();
        }
        db.sessions.update(sessionId.current, upd);
      }

      if (newIdx === -1) {
        // Conclusão
        update({ ...flow, completions: (flow.completions ?? 0) + 1 });
        if (sessionId.current && sessionCreated.current) {
          logAction(
            "SESSION_COMPLETED",
            "user",
            {
              sessionId: sessionId.current,
              totalSteps: pathRef.current.length,
              totalTime: pathRef.current.reduce(
                (sum, p) => sum + p.timeSpent,
                0
              ),
            },
            flow.id
          );
        }
      }
    },
    [flow, index, registerLeaveEnter, update]
  );

  // Funções expostas
  const next = useCallback(() => {
    if (!flow) return;
    const current = flow.steps[index];
    if (!current) return;
    if (current.nextStepId !== undefined) {
      const targetIdx = flow.steps.findIndex(
        (s) => s.id === current.nextStepId
      );
      const newIdx = targetIdx >= 0 ? targetIdx : -1;
      goToIndex(newIdx);
    } else {
      const newIdx = index + 1 < flow.steps.length ? index + 1 : -1;
      goToIndex(newIdx);
    }
  }, [flow, index, goToIndex]);

  const choose = useCallback(
    (targetStepId: string) => {
      if (!flow) return;
      const targetIdx = flow.steps.findIndex((s) => s.id === targetStepId);
      goToIndex(targetIdx >= 0 ? targetIdx : -1);
    },
    [flow, goToIndex]
  );

  const goBack = useCallback(() => {
    if (history.length <= 1) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove o atual
    const prevIndex = newHistory[newHistory.length - 1];

    setHistory(newHistory);
    goToIndex(prevIndex, false);
  }, [history, goToIndex]);

  const restart = useCallback(() => {
    setIndex(0);
    setHistory([0]);
    pathRef.current = [];
    lastEnterAt.current = Date.now();

    if (sessionId.current && flow && sessionCreated.current) {
      db.sessions.update(sessionId.current, {
        path: [],
        startedAt: Date.now(),
        finishedAt: undefined,
        currentIndex: 0,
        history: [0],
      });

      logAction(
        "SESSION_RESTARTED",
        "user",
        {
          sessionId: sessionId.current,
        },
        flow.id
      );
    }
  }, [flow]);

  // Estado atual
  if (!flow) {
    return {
      step: null,
      index: -1,
      progress: 0,
      canGoBack: false,
      history: [],
      next,
      choose,
      goBack,
      restart,
      sessionStart: sessionStart.current,
    };
  }

  const step = index >= 0 ? flow.steps[index] : null;
  const progress =
    flow.steps.length === 0 ? 0 : Math.min((index + 1) / flow.steps.length, 1);
  const canGoBack = history.length > 1;

  return {
    step,
    index,
    progress,
    canGoBack,
    history,
    next,
    choose,
    goBack,
    restart,
    sessionStart: sessionStart.current,
  };
}
