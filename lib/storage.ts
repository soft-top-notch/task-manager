import type { Task } from "./types";

export const TASKS_STORAGE_KEY = "task-manager:tasks";

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.description === "string" &&
    typeof task.dueDate === "string" &&
    typeof task.completed === "boolean" &&
    typeof task.createdAt === "number"
  );
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTask);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}
