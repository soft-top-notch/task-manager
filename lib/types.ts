export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  createdAt: number;
};

export type TaskFilter = "all" | "active" | "completed";

export type TaskDraft = {
  title: string;
  description: string;
  dueDate: string;
};
