import { nanoid } from "nanoid";
import { db } from "../db";
import type { LogEntry } from "../types/flow";

export async function logAction(
  action: string,
  actor: string,
  payload?: any,
  flowId?: string,
  stepId?: string
): Promise<void> {
  try {
    const entry: LogEntry = {
      id: nanoid(),
      ts: Date.now(),
      actor,
      action,
      flowId,
      stepId,
      payload,
    };

    await db.logs.add(entry);

    // Mantém apenas os últimos 1000 logs para evitar crescimento excessivo
    const count = await db.logs.count();
    if (count > 1000) {
      const oldestLogs = await db.logs
        .orderBy("ts")
        .limit(count - 1000)
        .toArray();
      const idsToDelete = oldestLogs.map((log) => log.id);
      await db.logs.where("id").anyOf(idsToDelete).delete();
    }
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}

export async function getAuditTrail(limit = 100): Promise<LogEntry[]> {
  return await db.logs.orderBy("ts").reverse().limit(limit).toArray();
}

export async function getFlowAuditTrail(
  flowId: string,
  limit = 50
): Promise<LogEntry[]> {
  return await db.logs
    .where("flowId")
    .equals(flowId)
    .reverse()
    .limit(limit)
    .toArray();
}
