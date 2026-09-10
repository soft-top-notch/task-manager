"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadTasks, saveTasks } from "@/lib/storage";
import type { Task, TaskDraft, TaskFilter } from "@/lib/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveTasks(tasks);
  }, [tasks, hydrated]);

  const addTask = useCallback((draft: TaskDraft) => {
    const title = draft.title.trim();
    if (!title) return false;

    const task: Task = {
      id: crypto.randomUUID(),
      title,
      description: draft.description.trim(),
      dueDate: draft.dueDate,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks((current) => [task, ...current]);
    return true;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  }, []);

  const visibleTasks = useMemo(() => {
    switch (filter) {
      case "active":
        return tasks.filter((task) => !task.completed);
      case "completed":
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const remainingCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  );

  return {
    tasks,
    visibleTasks,
    filter,
    setFilter,
    hydrated,
    remainingCount,
    addTask,
    toggleTask,
    deleteTask,
  };
}
