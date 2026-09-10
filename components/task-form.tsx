"use client";

import { FormEvent, useState } from "react";
import type { TaskDraft } from "@/lib/types";

type TaskFormProps = {
  onAdd: (draft: TaskDraft) => boolean;
};

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const added = onAdd({ title, description, dueDate });
    if (!added) return;
    setTitle("");
    setDescription("");
    setDueDate("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-stone-700">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            required
            className="h-11 rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-900 outline-none ring-stone-400 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-stone-700">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional details"
            rows={3}
            className="resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 outline-none ring-stone-400 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-stone-700">Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="h-11 rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-900 outline-none ring-stone-400 focus:border-stone-400 focus:bg-white focus:ring-2"
          />
        </label>

        <button
          type="submit"
          disabled={!title.trim()}
          className="h-11 rounded-xl bg-stone-900 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          Add task
        </button>
      </div>
    </form>
  );
}
