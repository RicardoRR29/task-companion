export interface DashboardSettings {
  id: string;
  viewMode: "grid" | "list";
  showVisits: boolean;
  showCompletions: boolean;
  showCompletionRate: boolean;
  showStepCount: boolean;
}
