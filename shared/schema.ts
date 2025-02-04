import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  originalContent: text("original_content").notNull(),
  cleanedContent: text("cleaned_content").notNull(),
});

export const insertLogSchema = createInsertSchema(logs).pick({
  originalContent: true,
  cleanedContent: true,
});

export const cleanLogRequestSchema = z.object({
  log: z.string().min(1, "Log content is required")
});

export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;
export type CleanLogRequest = z.infer<typeof cleanLogRequestSchema>;
