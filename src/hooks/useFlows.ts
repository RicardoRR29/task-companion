import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Flow } from "../types/flow";
import { db } from "../db";

interface FlowStore {
  flows: Flow[];
  load: () => Promise<void>;
  create: (title?: string) => Promise<string>; // retorna id
  clone: (id: string) => Promise<string>; // novo
  update: (flow: Flow) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useFlows = create<FlowStore>()(
  persist(
    (set, get) => ({
      flows: [],

      /* Carrega do IndexedDB (ordenado por updatedAt desc.) */
      load: async () => {
        const flows = await db.flows.orderBy("updatedAt").reverse().toArray();
        set({ flows });
      },

      /* Cria um fluxo vazio */
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
        return id;
      },

      /* Clona fluxo existente */
      clone: async (id) => {
        const orig = await db.flows.get(id);
        if (!orig) throw new Error("Flow not found");
        const copy: Flow = {
          ...orig,
          id: nanoid(),
          title: `${orig.title} (copy)`,
          status: "DRAFT",
          visits: 0,
          completions: 0,
          updatedAt: Date.now(),
        };
        await db.flows.put(copy);
        set({ flows: [copy, ...get().flows] });
        return copy.id;
      },

      /* Atualiza fluxo */
      update: async (flow) => {
        flow.updatedAt = Date.now();
        await db.flows.put(flow);
        set((s) => ({
          flows: s.flows.map((f) => (f.id === flow.id ? flow : f)),
        }));
      },

      /* Remove fluxo */
      remove: async (id) => {
        await db.flows.delete(id);
        set((s) => ({ flows: s.flows.filter((f) => f.id !== id) }));
      },
    }),
    { name: "taco-flows" } // chave localStorage
  )
);
