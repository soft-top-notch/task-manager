"use client";

import type { TaskFilter } from "@/lib/types";

const FILTERS: { id: TaskFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

type TaskFiltersProps = {
  value: TaskFilter;
  onChange: (filter: TaskFilter) => void;
};

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter tasks"
      className="grid grid-cols-3 rounded-xl bg-stone-200/70 p-1"
    >
      {FILTERS.map((filter) => {
        const selected = filter.id === value;
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(filter.id)}
            className={`h-9 rounded-lg text-sm font-medium transition ${
              selected
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
