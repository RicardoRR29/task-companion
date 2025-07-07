import Dexie from "dexie";
import type { Table } from "dexie";
import type { Flow, LogEntry, Session, StepEvent, CustomComponent } from "../types/flow";
import type { DashboardSettings } from "../types/settings";

class TacoDB extends Dexie {
  flows!: Table<Flow, string>;
  sessions!: Table<Session, string>;
  stepEvents!: Table<StepEvent, string>;
  logs!: Table<LogEntry, string>;
  customComponents!: Table<CustomComponent, string>;
  settings!: Table<DashboardSettings, string>;

  constructor() {
    super("taco");

    this.version(1).stores({
      flows: "id, title, status, updatedAt",
      sessions: "id, flowId, startedAt, finishedAt, currentIndex",
      stepEvents: "id, sessionId, stepId, enterAt, leaveAt",
      logs: "id, ts, actor, action, flowId, stepId",
      customComponents: "id, name",
    });

    this.version(2).stores({
      flows: "id, title, status, updatedAt",
      sessions: "id, flowId, startedAt, finishedAt, currentIndex",
      stepEvents: "id, sessionId, stepId, enterAt, leaveAt",
      logs: "id, ts, actor, action, flowId, stepId",
      customComponents: "id, name",
      settings: "id",
    });
  }
}

export const db = new TacoDB();
