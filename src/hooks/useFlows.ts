import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Flow, Step } from "../types/flow";
import { db } from "../db";
import { logAction } from "../utils/audit";

interface FlowStore {
  flows: Flow[];
  isLoading: boolean;
  load: () => Promise<void>;
  create: (title?: string) => Promise<string>;
  clone: (id: string) => Promise<string>;
  update: (flow: Flow) => Promise<void>;
  remove: (id: string) => Promise<void>;
  exportFlow: (id: string) => Promise<string>;
  exportFlows: (ids: string[]) => Promise<string>;
  importFlow: (jsonData: string) => Promise<string>;
}

export const useFlows = create<FlowStore>()(
  persist(
    (set, get) => ({
      flows: [],
      isLoading: false,

      load: async () => {
        set({ isLoading: true });
        try {
          const flows = await db.flows.orderBy("updatedAt").reverse().toArray();
          set({ flows });
          await logAction("FLOWS_LOADED", "system", { count: flows.length });
        } catch (error) {
          const err = error as Error;
          await logAction("FLOWS_LOAD_ERROR", "system", {
            error: err.message,
          });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      create: async (title = "Untitled flow") => {
        const id = nanoid();
        const now = Date.now();
        const flow: Flow = {
          id,
          title,
          status: "DRAFT",
          steps: [],
          visits: 0,
          completions: 0,
          updatedAt: now,
        };

        await db.flows.put(flow);
        set({ flows: [flow, ...get().flows] });
        await logAction("FLOW_CREATED", "user", { flowId: id, title });
        return id;
      },

      clone: async (id) => {
        const orig = await db.flows.get(id);
        if (!orig) {
          await logAction("FLOW_CLONE_ERROR", "user", {
            flowId: id,
            error: "Flow not found",
          });
          throw new Error("Flow not found");
        }

        const copy: Flow = {
          ...orig,
          id: nanoid(),
          title: `${orig.title} (copy)`,
          status: "DRAFT",
          visits: 0,
          completions: 0,
          updatedAt: Date.now(),
          steps: orig.steps.map((step) => ({
            ...step,
            id: nanoid(), // Gera novos IDs para os passos
          })),
        };

        await db.flows.put(copy);
        set({ flows: [copy, ...get().flows] });
        await logAction("FLOW_CLONED", "user", {
          originalId: id,
          newId: copy.id,
          title: copy.title,
        });
        return copy.id;
      },

      update: async (flow) => {
        flow.updatedAt = Date.now();
        await db.flows.put(flow);
        set((s) => ({
          flows: s.flows.map((f) => (f.id === flow.id ? flow : f)),
        }));
        await logAction("FLOW_UPDATED", "user", {
          flowId: flow.id,
          title: flow.title,
          stepsCount: flow.steps.length,
        });
      },

      remove: async (id) => {
        const flow = await db.flows.get(id);
        await db.flows.delete(id);

        // Remove sessões e eventos relacionados
        const sessions = await db.sessions.where("flowId").equals(id).toArray();
        const sessionIds = sessions.map((s) => s.id);
        if (sessionIds.length > 0) {
          await db.stepEvents.where("sessionId").anyOf(sessionIds).delete();
          await db.sessions.where("flowId").equals(id).delete();
        }

        set((s) => ({ flows: s.flows.filter((f) => f.id !== id) }));
        await logAction("FLOW_DELETED", "user", {
          flowId: id,
          title: flow?.title,
          sessionsDeleted: sessionIds.length,
        });
      },

      exportFlow: async (id) => {
        const flow = await db.flows.get(id);
        if (!flow) {
          await logAction("FLOW_EXPORT_ERROR", "user", {
            flowId: id,
            error: "Flow not found",
          });
          throw new Error("Flow not found");
        }

        const exportData = {
          version: "1.0",
          exportedAt: Date.now(),
          flow: {
            ...flow,
            id: undefined, // Remove ID para evitar conflitos na importação
          },
        };

        await logAction("FLOW_EXPORTED", "user", {
          flowId: id,
          title: flow.title,
        });
        return JSON.stringify(exportData, null, 2);
      },

      exportFlows: async (ids) => {
        const flows = await db.flows.where('id').anyOf(ids).toArray();
        const exportData = {
          version: '1.0',
          exportedAt: Date.now(),
          flows: flows.map((f) => ({ ...f, id: undefined })),
        };
        await logAction('FLOWS_EXPORTED', 'user', { count: flows.length });
        return JSON.stringify(exportData, null, 2);
      },

      importFlow: async (jsonData) => {
        try {
          const data = JSON.parse(jsonData);

          if (!data.flow || !data.version) {
            throw new Error("Formato de arquivo inválido");
          }

          const id = nanoid();
          const now = Date.now();
          const flow: Flow = {
            ...data.flow,
            id,
            title: `${data.flow.title} (importado)`,
            status: "DRAFT",
            visits: 0,
            completions: 0,
            updatedAt: now,
            steps: data.flow.steps.map((step: Step) => ({
              ...step,
              id: nanoid(), // Gera novos IDs para os passos
            })),
          };

          await db.flows.put(flow);
          set({ flows: [flow, ...get().flows] });
          await logAction("FLOW_IMPORTED", "user", {
            flowId: id,
            title: flow.title,
            originalTitle: data.flow.title,
            stepsCount: flow.steps.length,
          });
          return id;
        } catch (error) {
          const err = error as Error;
          await logAction("FLOW_IMPORT_ERROR", "user", {
            error: err.message,
          });
          throw new Error(`Erro ao importar fluxo: ${err.message}`);
        }
      },
    }),
    { name: "taco-flows" }
  )
);
