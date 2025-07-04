declare module "virtual:pwa-register" {
  // sobrecarga mínima que precisamos
  export function registerSW(options?: {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }): void;
}
