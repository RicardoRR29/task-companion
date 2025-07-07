import { db } from "../db";

export interface BackupData {
  version: string;
  generatedAt: number;
  db: Record<string, unknown[]>;
  localStorage: Record<string, string>;
}

export async function createBackup(): Promise<string> {
  const dbDump: Record<string, unknown[]> = {};
  for (const table of db.tables) {
    dbDump[table.name] = await table.toArray();
  }
  const ls: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith("taco-")) {
      const value = localStorage.getItem(key);
      if (value !== null) ls[key] = value;
    }
  }
  const payload: BackupData = {
    version: "1.0",
    generatedAt: Date.now(),
    db: dbDump,
    localStorage: ls,
  };
  return JSON.stringify(payload, null, 2);
}

export async function restoreBackup(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData) as BackupData;
  if (!data.db || !data.localStorage) {
    throw new Error("Arquivo de backup inválido");
  }

  // Limpa todas as tabelas
  for (const table of db.tables) {
    await table.clear();
  }
  for (const [name, records] of Object.entries(data.db)) {
    const table = (db as any)[name];
    if (table && Array.isArray(records)) {
      await table.bulkAdd(records);
    }
  }
  for (const [key, value] of Object.entries(data.localStorage)) {
    localStorage.setItem(key, value);
  }
}
