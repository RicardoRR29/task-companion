import Dexie from "dexie";
import type { Table } from "dexie";
import type { Flow, LogEntry, Session, StepEvent } from "../types/flow";

class TacoDB extends Dexie {
  flows!: Table<Flow, string>;
  sessions!: Table<Session, string>;
  stepEvents!: Table<StepEvent, string>;
  logs!: Table<LogEntry, string>;

  constructor() {
    super("taco");

    this.version(1).stores({
      flows: "id, title, status, updatedAt",
      sessions: "id, flowId, startedAt, finishedAt",
      stepEvents: "id, sessionId, stepId, enterAt, leaveAt",
      logs: "id, ts, actor, action, flowId, stepId",
    });
  }
}

export const db = new TacoDB();
