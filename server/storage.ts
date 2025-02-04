import { logs, type Log, type InsertLog } from "@shared/schema";

export interface IStorage {
  createLog(log: InsertLog): Promise<Log>;
  getLog(id: number): Promise<Log | undefined>;
}

export class MemStorage implements IStorage {
  private logs: Map<number, Log>;
  private currentId: number;

  constructor() {
    this.logs = new Map();
    this.currentId = 1;
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const id = this.currentId++;
    const log: Log = { id, ...insertLog };
    this.logs.set(id, log);
    return log;
  }

  async getLog(id: number): Promise<Log | undefined> {
    return this.logs.get(id);
  }
}

export const storage = new MemStorage();
