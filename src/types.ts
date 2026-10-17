export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  category: string;
  dueDate?: string;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'list' | 'board' | 'stats' | 'calliope';
