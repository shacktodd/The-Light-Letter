import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { publishEdition, publishEditionSchema } from "./newsletterPublication";

export async function publishScheduledNewsletter(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req as never);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const candidate = publishEditionSchema.parse(req.body);
    const result = await publishEdition(candidate, user.taskUid);
    return res.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scheduled publication error";
    console.error("[Newsletter schedule]", error);
    return res.status(500).json({ error: message, timestamp: new Date().toISOString() });
  }
}
