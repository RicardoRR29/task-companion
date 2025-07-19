import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AnalyticsConfigStore {
  runsToShow: number | "all";
  customOptions: number[];
  setRunsToShow: (v: number | "all") => void;
  addCustomOption: (v: number) => void;
}

export const useAnalyticsConfig = create<AnalyticsConfigStore>()(
  persist(
    (set) => ({
      runsToShow: 5,
      customOptions: [],
      setRunsToShow: (v) => set({ runsToShow: v }),
      addCustomOption: (v) =>
        set((state) => {
          if (state.customOptions.includes(v)) return {};
          const arr = [...state.customOptions, v].sort((a, b) => a - b);
          return { customOptions: arr };
        }),
    }),
    { name: "taco-analytics-config" }
  )
);
