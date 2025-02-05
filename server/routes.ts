import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cleanLogRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function registerRoutes(app: Express): Server {
  app.post("/api/clean-log", async (req, res) => {
    try {
      const { log } = cleanLogRequestSchema.parse(req.body);

      const response = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-4o-mini" which was released May 13, 2024
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an assistant that removes non-critical error messages, duplicates, and irrelevant content from error logs. Return only the cleaned log content without any additional commentary.",
          },
          { role: "user", content: log }
        ],
        temperature: 0.0,
      });

      const cleanedLog = response.choices[0].message.content;

      const savedLog = await storage.createLog({
        originalContent: log,
        cleanedContent: cleanedLog
      });

      res.json({ cleaned: cleanedLog });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors[0].message });
      } else {
        console.error("Error cleaning log:", error);
        res.status(500).json({ error: "Error processing log" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
