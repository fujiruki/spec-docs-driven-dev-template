import chalk from 'chalk';
import { DashboardState, Task, AgentColumn } from './types.js';

type DisplayMode = 1 | 2;

const ICONS = {
  done: chalk.green('✓'),
  in_progress: chalk.yellow('●'),
  todo: chalk.gray('□'),
} as const;

function formatTime(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${d} ${h}:${mi}`;
}

function taskLine(task: Task): string {
  return `${ICONS[task.status]} ${task.name}`;
}

function horizontalLine(width: number, left: string, mid: string, right: string, dividers?: number[]): string {
  if (!dividers || dividers.length === 0) {
    return left + '─'.repeat(width - 2) + right;
  }
  let line = left;
  let pos = 1;
  for (let i = 0; i < dividers.length; i++) {
    const nextDiv = dividers[i];
    line += '─'.repeat(nextDiv - pos);
    line += (i < dividers.length - 1 || nextDiv < width - 1) ? mid : '';
    pos = nextDiv + 1;
  }
  line += '─'.repeat(Math.max(0, width - 1 - pos));
  line += right;
  return line;
}

function padOrTruncate(text: string, width: number): string {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const len = [...stripped].length;
  if (len >= width) {
    let count = 0;
    let result = '';
    let inEsc = false;
    for (const ch of text) {
      if (ch === '\x1b') { inEsc = true; result += ch; continue; }
      if (inEsc) { result += ch; if (ch === 'm') inEsc = false; continue; }
      if (count >= width - 1) { result += '…'; break; }
      result += ch;
      count++;
    }
    return result;
  }
  return text + ' '.repeat(width - len);
}

function countByStatus(columns: AgentColumn[]) {
  let done = 0, inProgress = 0, todo = 0;
  for (const col of columns) {
    for (const task of col.tasks) {
      if (task.status === 'done') done++;
      else if (task.status === 'in_progress') inProgress++;
      else todo++;
    }
  }
  return { done, inProgress, todo, total: done + inProgress + todo };
}

function progressBar(ratio: number, width: number): string {
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

function renderColumns(columns: AgentColumn[], totalWidth: number, mode: DisplayMode): string[] {
  const lines: string[] = [];
  const colCount = columns.length;

  if (mode === 1 || colCount === 0) {
    for (const col of columns) {
      const roleLabel = col.role === 'commander' ? chalk.cyan('(指揮)') : '';
      lines.push(`  ${chalk.bold(col.name)} ${roleLabel}`);
      lines.push('  ' + '─'.repeat(Math.min(30, totalWidth - 4)));
      for (const task of col.tasks) {
        lines.push(`  ${taskLine(task)}`);
      }
      lines.push('');
    }
    return lines;
  }

  const innerWidth = totalWidth - 2;
  const colWidth = Math.floor(innerWidth / colCount);

  const headerParts: string[] = [];
  for (const col of columns) {
    const roleLabel = col.role === 'commander' ? ' (指揮)' : '';
    const header = `${col.name}${roleLabel}`;
    headerParts.push(padOrTruncate(header, colWidth - 1));
  }
  lines.push('│' + headerParts.join('│') + '│');

  const divPositions = [];
  for (let i = 1; i < colCount; i++) {
    divPositions.push(i * colWidth);
  }
  divPositions.push(innerWidth);
  lines.push(horizontalLine(totalWidth, '├', '┼', '┤', divPositions));

  const maxTasks = Math.max(...columns.map(c => c.tasks.length), 0);
  for (let row = 0; row < maxTasks; row++) {
    const parts: string[] = [];
    for (const col of columns) {
      const task = col.tasks[row];
      const text = task ? ` ${taskLine(task)}` : '';
      parts.push(padOrTruncate(text, colWidth - 1));
    }
    lines.push('│' + parts.join('│') + '│');
  }

  return lines;
}

export function render(state: DashboardState, mode: DisplayMode): string {
  const termWidth = Math.max(process.stdout.columns || 80, 40);
  const width = Math.min(termWidth, 120);
  const output: string[] = [];

  output.push('\x1b[?25l');
  output.push('\x1b[H\x1b[2J');

  output.push(horizontalLine(width, '┌', '─', '┐'));

  const title = `  ${chalk.bold(state.projectName)}  進捗ダッシュボード`;
  const titleLine = padOrTruncate(title, width - 4);
  output.push(`│ ${titleLine} │`);

  const timeStr = `  最終更新: ${formatTime(state.lastUpdated)}`;
  const autoLabel = chalk.green('[自動更新中]');
  const timeContent = timeStr;
  const timePadded = padOrTruncate(timeContent, width - 4 - 14);
  output.push(`│ ${timePadded} ${autoLabel} │`);

  output.push(horizontalLine(width, '├', '─', '┤'));

  const columnLines = renderColumns(state.columns, width, mode);
  for (const line of columnLines) {
    if (mode === 2 && (line.startsWith('│') || line.startsWith('├'))) {
      output.push(line);
    } else {
      const padded = padOrTruncate(line, width - 4);
      output.push(`│ ${padded} │`);
    }
  }

  output.push(horizontalLine(width, '├', '─', '┤'));

  const { done, inProgress, todo, total } = countByStatus(state.columns);
  const ratio = total > 0 ? done / total : 0;
  const percent = Math.round(ratio * 100);

  const summaryText = `  ${ICONS.done} 完了: ${done}/${total} (${percent}%)  ${ICONS.in_progress} 進行中: ${inProgress}  ${ICONS.todo} 未着手: ${todo}`;
  output.push(`│ ${padOrTruncate(summaryText, width - 4)} │`);

  const barWidth = Math.max(width - 12, 20);
  const bar = `  ${progressBar(ratio, barWidth)} ${percent}%`;
  output.push(`│ ${padOrTruncate(bar, width - 4)} │`);

  output.push(horizontalLine(width, '└', '─', '┘'));

  const modeIndicator = mode === 1 ? chalk.underline('1') : '1';
  const modeIndicator2 = mode === 2 ? chalk.underline('2') : '2';
  output.push(` [${modeIndicator}] 1列表示  [${modeIndicator2}] 2列表示  [${chalk.red('q')}] 終了`);

  output.push('\x1b[?25h');

  return output.join('\n');
}
