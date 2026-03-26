export type TaskStatus = 'done' | 'in_progress' | 'todo';

export interface Task {
  name: string;
  status: TaskStatus;
}

export interface AgentColumn {
  name: string;
  role: 'commander' | 'agent';
  tasks: Task[];
}

export interface DashboardState {
  projectName: string;
  lastUpdated: Date;
  columns: AgentColumn[];
  completedCount: number;
  completedTaskCount: number;
}
