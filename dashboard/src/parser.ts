import { readFileSync } from 'fs';
import { DashboardState, AgentColumn, Task, TaskStatus } from './types.js';

function parseTaskStatus(line: string): { name: string; status: TaskStatus } | null {
  const match = line.match(/^-\s+\[([ x\-])\]\s+(.+)$/);
  if (!match) return null;

  const marker = match[1];
  const name = match[2].replace(/（.*?）$/, '').trim();
  let status: TaskStatus;

  if (marker === 'x') {
    status = 'done';
  } else if (marker === '-') {
    status = 'in_progress';
  } else {
    status = 'todo';
  }

  return { name, status };
}

export function isColumnCompleted(column: AgentColumn): boolean {
  return column.tasks.length > 0 && column.tasks.every(t => t.status === 'done');
}

export function parseTaskContent(content: string): DashboardState {
  const lines = content.split('\n');

  let projectName = '仕様書駆動開発';
  const columns: AgentColumn[] = [];
  let currentColumn: AgentColumn | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match) {
      projectName = h1Match[1];
      continue;
    }

    const h2Match = trimmed.match(/^##\s+(.+)$/);
    if (h2Match) {
      const name = h2Match[1];
      const role = name.startsWith('Agent') ? 'agent' : 'commander';
      currentColumn = { name, role, tasks: [] };
      columns.push(currentColumn);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      continue;
    }

    if (currentColumn) {
      const task = parseTaskStatus(trimmed);
      if (task) {
        currentColumn.tasks.push(task);
      }
    }
  }

  const activeColumns: AgentColumn[] = [];
  let completedCount = 0;
  let completedTaskCount = 0;

  for (const col of columns) {
    if (isColumnCompleted(col) && col.role === 'agent') {
      completedCount++;
      completedTaskCount += col.tasks.length;
    } else {
      activeColumns.push(col);
    }
  }

  return {
    projectName,
    lastUpdated: new Date(),
    columns: activeColumns,
    completedCount,
    completedTaskCount,
  };
}

export function parseTaskFile(filePath: string): DashboardState {
  const content = readFileSync(filePath, 'utf-8');
  return parseTaskContent(content);
}
