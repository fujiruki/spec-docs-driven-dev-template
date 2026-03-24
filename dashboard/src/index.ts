#!/usr/bin/env node
import { existsSync } from 'fs';
import { resolve } from 'path';
import { parseTaskFile } from './parser.js';
import { watchTaskFile } from './watcher.js';
import { render } from './renderer.js';

type DisplayMode = 1 | 2;

function parseArgs(): { watchPath: string; mode: DisplayMode } {
  const args = process.argv.slice(2);
  let watchPath = '';
  let mode: DisplayMode | 'auto' = 'auto';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--watch' && args[i + 1]) {
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

  return { watchPath, mode: resolvedMode };
}

function main() {
  const { watchPath, mode: initialMode } = parseArgs();

  if (!existsSync(watchPath)) {
    console.error(`エラー: ファイルが見つかりません: ${watchPath}`);
    process.exit(1);
  }

  let currentMode: DisplayMode = initialMode;

  function draw() {
    try {
      const state = parseTaskFile(watchPath);
      const output = render(state, currentMode);
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
  });

  process.on('SIGINT', () => {
    process.stdout.write('\x1b[?25h');
    watcher.close();
    process.exit(0);
  });
}

main();
