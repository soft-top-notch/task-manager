"use client";

import type { Task } from "@/lib/types";

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

function formatDueDate(dueDate: string) {
  const [year, month, day] = dueDate.split("-").map(Number);
  if (!year || !month || !day) return dueDate;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dueDate: string, completed: boolean) {
  if (!dueDate || completed) return false;
  const [year, month, day] = dueDate.split("-").map(Number);
  if (!year || !month || !day) return false;
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "completed"}`}
          className="mt-1 h-4 w-4 accent-stone-900"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`text-base font-medium ${
                task.completed ? "text-stone-400 line-through" : "text-stone-900"
              }`}
            >
              {task.title}
            </h3>
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="shrink-0 text-sm text-stone-400 transition hover:text-red-600"
            >
              Delete
            </button>
          </div>

          {task.description ? (
            <p
              className={`mt-1 text-sm leading-6 ${
                task.completed ? "text-stone-400" : "text-stone-600"
              }`}
            >
              {task.description}
            </p>
          ) : null}

          {task.dueDate ? (
            <p
              className={`mt-2 text-xs font-medium ${
                overdue ? "text-red-600" : "text-stone-500"
              }`}
            >
              Due {formatDueDate(task.dueDate)}
              {overdue ? " · Overdue" : ""}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
