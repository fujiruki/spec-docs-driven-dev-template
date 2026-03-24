import chalk from 'chalk';
import { DashboardState, Task, AgentColumn } from './types.js';
import { isColumnCompleted } from './parser.js';

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

function charWidth(ch: string): number {
  const code = ch.codePointAt(0) || 0;
  if (
    (code >= 0x1100 && code <= 0x115F) ||
    (code >= 0x2E80 && code <= 0x303E) ||
    (code >= 0x3040 && code <= 0x33BF) ||
    (code >= 0x3400 && code <= 0x4DBF) ||
    (code >= 0x4E00 && code <= 0xA4CF) ||
    (code >= 0xA960 && code <= 0xA97C) ||
    (code >= 0xAC00 && code <= 0xD7FB) ||
    (code >= 0xF900 && code <= 0xFAFF) ||
    (code >= 0xFE30 && code <= 0xFE6F) ||
    (code >= 0xFF01 && code <= 0xFF60) ||
    (code >= 0xFFE0 && code <= 0xFFE6) ||
    (code >= 0x20000 && code <= 0x2FFFD) ||
    (code >= 0x30000 && code <= 0x3FFFD)
  ) return 2;
  return 1;
}

function displayWidth(text: string): number {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  let w = 0;
  for (const ch of stripped) w += charWidth(ch);
  return w;
}

function padOrTruncate(text: string, width: number): string {
  const len = displayWidth(text);
  if (len >= width) {
    let count = 0;
    let result = '';
    let inEsc = false;
    for (const ch of text) {
      if (ch === '\x1b') { inEsc = true; result += ch; continue; }
      if (inEsc) { result += ch; if (ch === 'm') inEsc = false; continue; }
      const cw = charWidth(ch);
      if (count + cw > width - 1) { result += '…'; break; }
      result += ch;
      count += cw;
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

function renderColumns(columns: AgentColumn[], totalWidth: number, mode: DisplayMode, expandedSections?: Set<string>): string[] {
  const lines: string[] = [];
  const colCount = columns.length;

  if (mode === 1 || colCount === 0) {
    for (const col of columns) {
      const completed = isColumnCompleted(col);
      const forceExpanded = expandedSections?.has(col.name);

      if (completed && !forceExpanded) {
        const count = col.tasks.length;
        lines.push(`  ${chalk.green('✓')} ${chalk.dim(col.name)} ${chalk.green(`(${count}/${count}完了)`)}`);
        lines.push('');
        continue;
      }

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
    const completed = isColumnCompleted(col);
    const forceExpanded = expandedSections?.has(col.name);
    const roleLabel = col.role === 'commander' ? ' (指揮)' : '';
    let header: string;
    if (completed && !forceExpanded) {
      header = `✓ ${col.name} (${col.tasks.length}/${col.tasks.length}完了)`;
    } else {
      header = `${col.name}${roleLabel}`;
    }
    headerParts.push(padOrTruncate(header, colWidth - 1));
  }
  lines.push('│' + headerParts.join('│') + '│');

  const divPositions = [];
  for (let i = 1; i < colCount; i++) {
    divPositions.push(i * colWidth);
  }
  lines.push(horizontalLine(totalWidth, '├', '┼', '┤', divPositions));

  const effectiveColumns = columns.map(col => {
    const completed = isColumnCompleted(col);
    const forceExpanded = expandedSections?.has(col.name);
    if (completed && !forceExpanded) return [];
    return col.tasks;
  });

  const maxTasks = Math.max(...effectiveColumns.map(t => t.length), 0);
  for (let row = 0; row < maxTasks; row++) {
    const parts: string[] = [];
    for (const tasks of effectiveColumns) {
      const task = tasks[row];
      const text = task ? ` ${taskLine(task)}` : '';
      parts.push(padOrTruncate(text, colWidth - 1));
    }
    lines.push('│' + parts.join('│') + '│');
  }

  return lines;
}

export function render(state: DashboardState, mode: DisplayMode, expandedSections?: Set<string>): string {
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

  const columnLines = renderColumns(state.columns, width, mode, expandedSections);
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
  output.push(` [${modeIndicator}] 1列表示  [${modeIndicator2}] 2列表示  [e] 展開/折畳  [r] 更新  [${chalk.red('q')}] 終了`);

  output.push('\x1b[?25h');

  return output.join('\n');
}
