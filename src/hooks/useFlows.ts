import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Flow, FlowPackage, CustomComponent } from "../types/flow";
import { buildNetworkGraph } from "../utils/graph";
import { db } from "../db";
import { logAction } from "../utils/audit";
import { useCustomComponents } from "./useCustomComponents";

interface FlowStore {
  flows: Flow[];
  isLoading: boolean;
  load: () => Promise<void>;
  create: (title?: string) => Promise<string>;
  clone: (id: string) => Promise<string>;
  update: (flow: Flow) => Promise<void>;
  remove: (id: string) => Promise<void>;
  removeMany: (ids: string[]) => Promise<void>;
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
          const flowsRaw = await db.flows.orderBy("updatedAt").reverse().toArray();
          const flows: Flow[] = [];

          for (const f of flowsRaw) {
            const computed = buildNetworkGraph(f.steps);
            const networkGraph = f.networkGraph ?? computed;
            flows.push({ ...f, networkGraph });

            // Persist grafos gerados a partir de versões antigas
            if (!f.networkGraph) {
              await db.flows.update(f.id, { networkGraph });
            }
          }

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
          networkGraph: [],
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

        const newSteps = orig.steps.map((step) => ({
          ...step,
          id: nanoid(), // Gera novos IDs para os passos
        }));
        const copy: Flow = {
          ...orig,
          id: nanoid(),
          title: `${orig.title} (copy)`,
          status: "DRAFT",
          visits: 0,
          completions: 0,
          updatedAt: Date.now(),
          steps: newSteps,
          networkGraph: buildNetworkGraph(newSteps),
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
        flow.networkGraph = buildNetworkGraph(flow.steps);
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

      removeMany: async (ids) => {
        for (const id of ids) {
          await get().remove(id);
        }
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

        // Componentes utilizados neste fluxo
        const componentIds = Array.from(
          new Set(
            flow.steps
              .map((s) => s.componentId)
              .filter((c): c is string => !!c)
          )
        );
        const components =
          componentIds.length > 0
            ? await db.customComponents.where("id").anyOf(componentIds).toArray()
            : [];

        const { id: _unused, ...flowData } = flow;
        const exportData: FlowPackage = {
          version: "1.1",
          exportedAt: Date.now(),
          flows: [flowData],
          components,
        };

        await logAction("FLOW_EXPORTED", "user", {
          flowId: id,
          title: flow.title,
        });
        return JSON.stringify(exportData, null, 2);
      },

      exportFlows: async (ids) => {
        const flows = await db.flows.where("id").anyOf(ids).toArray();
        const componentIds = Array.from(
          new Set(
            flows.flatMap((f) =>
              f.steps
                .map((s) => s.componentId)
                .filter((c): c is string => !!c)
            )
          )
        );
        const components =
          componentIds.length > 0
            ? await db.customComponents.where("id").anyOf(componentIds).toArray()
            : [];

        const cleanedFlows = flows.map(({ id: _unused, ...rest }) => rest);
        const exportData: FlowPackage = {
          version: "1.1",
          exportedAt: Date.now(),
          flows: cleanedFlows,
          components,
        };
        await logAction("FLOWS_EXPORTED", "user", { count: flows.length });
        return JSON.stringify(exportData, null, 2);
      },

      importFlow: async (jsonData) => {
        try {
          const data = JSON.parse(jsonData);

          const flowsData: Omit<Flow, "id">[] = Array.isArray(data.flows)
            ? data.flows
            : data.flow
            ? [data.flow]
            : [];

          if (!data.version || flowsData.length === 0) {
            throw new Error("Formato de arquivo inválido");
          }

          const components: CustomComponent[] = Array.isArray(data.components)
            ? data.components
            : [];

          // Importa componentes primeiro
          const compStore = useCustomComponents.getState();
          for (const comp of components) {
            await compStore.add({
              name: comp.name,
              html: comp.html,
              css: comp.css,
              js: comp.js,
            });
          }
          await compStore.load();

          const importedIds: string[] = [];

          for (const f of flowsData) {
            const newId = nanoid();
            const now = Date.now();
            const flow: Flow = {
              ...f,
              id: newId,
              title: f.title,
              status: "DRAFT",
              visits: 0,
              completions: 0,
              updatedAt: now,
              steps: f.steps,
              networkGraph: buildNetworkGraph(f.steps),
            };

            await db.flows.put(flow);
            set((s) => ({ flows: [flow, ...s.flows] }));

            await logAction("FLOW_IMPORTED", "user", {
              flowId: newId,
              title: flow.title,
              originalTitle: f.title,
              stepsCount: flow.steps.length,
            });
            importedIds.push(newId);
          }

          return importedIds[0];
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
