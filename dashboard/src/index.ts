#!/usr/bin/env node
import { existsSync } from 'fs';
import { resolve } from 'path';
import { parseTaskFile } from './parser.js';
import { watchTaskFile } from './watcher.js';
import { render } from './renderer.js';
import { resetTaskFile } from './reset.js';
import { isColumnCompleted } from './parser.js';

type DisplayMode = 1 | 2;

function parseArgs(): { watchPath: string; mode: DisplayMode; reset: boolean } {
  const args = process.argv.slice(2);
  let watchPath = '';
  let mode: DisplayMode | 'auto' = 'auto';
  let reset = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--reset') {
      reset = true;
    } else if (args[i] === '--watch' && args[i + 1]) {
      watchPath = args[++i];
    } else if (args[i] === '--columns' && args[i + 1]) {
      const val = args[++i];
      if (val === '1' || val === '2') mode = Number(val) as DisplayMode;
    } else if (!watchPath && !args[i].startsWith('--')) {
      watchPath = args[i];
    }
  }

  if (!watchPath) {
    watchPath = resolve(process.cwd(), 'task.md');
  } else {
    watchPath = resolve(watchPath);
  }

  let resolvedMode: DisplayMode;
  if (mode === 'auto') {
    const cols = process.stdout.columns || 80;
    resolvedMode = cols >= 80 ? 2 : 1;
  } else {
    resolvedMode = mode;
  }

  return { watchPath, mode: resolvedMode, reset };
}

function main() {
  const { watchPath, mode: initialMode, reset } = parseArgs();

  if (!existsSync(watchPath)) {
    console.error(`エラー: ファイルが見つかりません: ${watchPath}`);
    process.exit(1);
  }

  if (reset) {
    resetTaskFile(watchPath);
    console.log(`✓ 完了済みセクションを削除しました: ${watchPath}`);
    console.log(`  バックアップ: ${watchPath}.bak`);
    process.exit(0);
  }

  let currentMode: DisplayMode = initialMode;
  const expandedSections = new Set<string>();

  function draw() {
    try {
      const state = parseTaskFile(watchPath);
      const output = render(state, currentMode, expandedSections);
      process.stdout.write(output);
    } catch (e) {
      console.error('描画エラー:', e);
    }
  }

  draw();

  const watcher = watchTaskFile(watchPath, draw);

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding('utf-8');

  process.stdin.on('data', (key: string) => {
    if (key === 'q' || key === '\x03') {
      process.stdout.write('\x1b[?25h\x1b[2J\x1b[H');
      watcher.close();
      process.exit(0);
    }
    if (key === '1') {
      currentMode = 1;
      draw();
    }
    if (key === '2') {
      currentMode = 2;
      draw();
    }
    if (key === 'r') {
      draw();
    }
    if (key === 'e') {
      const state = parseTaskFile(watchPath);
      const completedColumns = state.columns.filter(isColumnCompleted);
      if (completedColumns.length === 0) return;

      const allExpanded = completedColumns.every(c => expandedSections.has(c.name));
      if (allExpanded) {
        for (const col of completedColumns) {
          expandedSections.delete(col.name);
        }
      } else {
        for (const col of completedColumns) {
          expandedSections.add(col.name);
        }
      }
      draw();
    }
  });

  process.on('SIGINT', () => {
    process.stdout.write('\x1b[?25h');
    watcher.close();
    process.exit(0);
  });
}

main();
