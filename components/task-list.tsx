"use client";

import type { Task, TaskFilter } from "@/lib/types";
import { TaskItem } from "./task-item";

const EMPTY_COPY: Record<TaskFilter, string> = {
  all: "No tasks yet. Add one above to get started.",
  active: "No active tasks. Enjoy the quiet.",
  completed: "No completed tasks yet.",
};

type TaskListProps = {
  tasks: Task[];
  filter: TaskFilter;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TaskList({ tasks, filter, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-4 py-10 text-center text-sm text-stone-500">
        {EMPTY_COPY[filter]}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
