"use client";

import { TaskFilters } from "@/components/task-filters";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { useTasks } from "@/hooks/use-tasks";

export function TaskApp() {
  const {
    visibleTasks,
    filter,
    setFilter,
    hydrated,
    remainingCount,
    addTask,
    toggleTask,
    deleteTask,
  } = useTasks();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
          Local tasks
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Task Manager
        </h1>
        <p className="text-sm text-stone-600">
          {hydrated
            ? remainingCount === 1
              ? "1 task left to do"
              : `${remainingCount} tasks left to do`
            : "Loading your tasks…"}
        </p>
      </header>

      <TaskForm onAdd={addTask} />
      <TaskFilters value={filter} onChange={setFilter} />
      <TaskList
        tasks={visibleTasks}
        filter={filter}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />
    </div>
  );
}
