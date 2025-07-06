import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { CustomComponent } from "../types/flow";
import { db } from "../db";
import { logAction } from "../utils/audit";

interface CustomComponentsStore {
  components: CustomComponent[];
  load: () => Promise<void>;
  add: (data: Omit<CustomComponent, "id">) => Promise<string>;
  update: (component: CustomComponent) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCustomComponents = create<CustomComponentsStore>()(
  persist(
    (set, get) => ({
      components: [],
      load: async () => {
        const comps = await db.customComponents.toArray();
        set({ components: comps });
      },
      add: async (data) => {
        const id = nanoid();
        const comp: CustomComponent = { id, ...data };
        await db.customComponents.put(comp);
        set({ components: [comp, ...get().components] });
        await logAction("CUSTOM_COMPONENT_CREATED", "user", { componentId: id });
        return id;
      },
      update: async (component) => {
        await db.customComponents.put(component);
        set({
          components: get().components.map((c) =>
            c.id === component.id ? component : c
          ),
        });
        await logAction("CUSTOM_COMPONENT_UPDATED", "user", {
          componentId: component.id,
        });
      },
      remove: async (id) => {
        await db.customComponents.delete(id);
        set({ components: get().components.filter((c) => c.id !== id) });
        await logAction("CUSTOM_COMPONENT_DELETED", "user", { componentId: id });
      },
    }),
    { name: "taco-custom-components" }
  )
);
