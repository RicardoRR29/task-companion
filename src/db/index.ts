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

    // Versão única com todos os stores definidos
    this.version(1).stores({
      flows: "id, updatedAt",
      sessions: "id, flowId, startedAt", // path armazenado como JSON
      stepEvents: "id, sessionId, stepId",
      logs: "id, ts, action",
    });
  }
}

export const db = new TacoDB();
