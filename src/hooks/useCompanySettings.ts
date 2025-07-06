import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompanySettings {
  logo: string | null;
  primary: string;
  secondary: string;
  setLogo: (logo: string | null) => void;
  setPrimary: (color: string) => void;
  setSecondary: (color: string) => void;
}

export const useCompanySettings = create<CompanySettings>()(
  persist(
    (set) => ({
      logo: null,
      primary: "#0a0a0a",
      secondary: "#f3f3f3",
      setLogo: (logo) => set({ logo }),
      setPrimary: (color) => set({ primary: color }),
      setSecondary: (color) => set({ secondary: color }),
    }),
    { name: "taco-company-settings" }
  )
);
