import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { TaskStatus } from './types.js';

interface Section {
  lines: string[];
  isH2: boolean;
  allDone: boolean;
}

function parseTaskStatusForReset(line: string): TaskStatus | null {
  const match = line.match(/^-\s+\[([ x\-])\]\s+/);
  if (!match) return null;
  if (match[1] === 'x') return 'done';
  if (match[1] === '-') return 'in_progress';
  return 'todo';
}

export function resetTaskContent(content: string): string {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  const headerLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isH2 = /^##\s+/.test(trimmed);

    if (isH2) {
      if (currentSection) sections.push(currentSection);
      currentSection = { lines: [line], isH2: true, allDone: true };
      continue;
    }

    if (!currentSection) {
      headerLines.push(line);
    } else {
      currentSection.lines.push(line);
      const status = parseTaskStatusForReset(trimmed);
      if (status !== null && status !== 'done') {
        currentSection.allDone = false;
      }
    }
  }

  if (currentSection) sections.push(currentSection);

  const keptSections = sections.filter(s => {
    if (!s.isH2) return true;
    const hasTasks = s.lines.some(l => parseTaskStatusForReset(l.trim()) !== null);
    if (!hasTasks) return true;
    return !s.allDone;
  });

  const resultParts = [headerLines.join('\n')];
  for (const section of keptSections) {
    resultParts.push(section.lines.join('\n'));
  }

  let result = resultParts.join('\n');
  result = result.replace(/\n{3,}/g, '\n\n');
  if (!result.endsWith('\n')) result += '\n';

  return result;
}

export function resetTaskFile(filePath: string): void {
  const backupPath = filePath + '.bak';
  copyFileSync(filePath, backupPath);

  const content = readFileSync(filePath, 'utf-8');
  const result = resetTaskContent(content);
  writeFileSync(filePath, result, 'utf-8');
}
