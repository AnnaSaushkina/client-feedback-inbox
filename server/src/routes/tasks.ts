import { Router } from "express";
import { randomUUID } from "crypto";
import type { Server } from "socket.io";
import { readTasks, writeTasks } from "../db";

function updateStore(updater: (tasks: ReturnType<typeof readTasks>) => ReturnType<typeof readTasks>) {
  const updated = updater(readTasks());
  writeTasks(updated);
  return updated;
}

function validateTaskBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Request body must be an object";
  const b = body as Record<string, unknown>;
  if ("title" in b && typeof b.title !== "string") return "title must be a string";
  if ("status" in b && typeof b.status !== "string") return "status must be a string";
  return null;
}

export function createTasksRouter(io: Server) {
  const router = Router();
  const broadcast = () => io.emit("tasks:update");

  router.get("/", (_req, res) => {
    try {
      res.json(readTasks());
    } catch (err) {
      console.error("GET /tasks failed", err);
      res.status(500).json({ error: "Failed to read tasks" });
    }
  });

  router.post("/", (req, res) => {
    try {
      const validationError = validateTaskBody(req.body);
      if (validationError) return res.status(400).json({ error: validationError });
      if (!req.body.title?.trim()) return res.status(400).json({ error: "title is required" });

      const task = { ...req.body, id: req.body.id || randomUUID() };
      updateStore((tasks) => [...tasks, task]);
      broadcast();
      res.json(task);
    } catch (err) {
      console.error("POST /tasks failed", err);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  router.put("/:id", (req, res) => {
    try {
      const validationError = validateTaskBody(req.body);
      if (validationError) return res.status(400).json({ error: validationError });

      let updated: ReturnType<typeof readTasks>[number] | undefined;
      const tasks = updateStore((all) =>
        all.map((t) => {
          if (t.id !== req.params.id) return t;
          const merged = { ...t, ...req.body, id: t.id };
          if (req.body.completed === false) delete merged.completedAt;
          updated = merged;
          return merged;
        }),
      );

      if (!updated) return res.status(404).json({ error: "Task not found" });
      broadcast();
      res.json(updated);
    } catch (err) {
      console.error(`PUT /tasks/${req.params.id} failed`, err);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  router.patch("/:id/toggle", (req, res) => {
    try {
      let toggled: ReturnType<typeof readTasks>[number] | undefined;
      updateStore((all) => {
        const task = all.find((t) => t.id === req.params.id);
        if (!task) return all;
        toggled = {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : undefined,
        };
        return all.map((t) => (t.id === req.params.id ? toggled! : t));
      });

      if (!toggled) return res.status(404).json({ error: "Task not found" });
      broadcast();
      res.json(toggled);
    } catch (err) {
      console.error(`PATCH /tasks/${req.params.id}/toggle failed`, err);
      res.status(500).json({ error: "Failed to toggle task" });
    }
  });

  router.delete("/:id", (req, res) => {
    try {
      updateStore((tasks) => tasks.filter((t) => t.id !== req.params.id));
      broadcast();
      res.json({ ok: true });
    } catch (err) {
      console.error(`DELETE /tasks/${req.params.id} failed`, err);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  return router;
}
