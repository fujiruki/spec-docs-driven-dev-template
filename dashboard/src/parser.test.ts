import { describe, it, expect } from 'vitest';
import { parseTaskContent, isColumnCompleted } from './parser.js';

describe('parseTaskContent', () => {
  it('基本的なtask.mdをパースできる', () => {
    const content = `# テストプロジェクト

## 指揮AI

- [x] タスクA
- [-] タスクB
- [ ] タスクC

## Agent-実装

- [x] タスクD
- [ ] タスクE
`;
    const state = parseTaskContent(content);
    expect(state.projectName).toBe('テストプロジェクト');
    expect(state.columns).toHaveLength(2);
    expect(state.columns[0].name).toBe('指揮AI');
    expect(state.columns[0].tasks).toHaveLength(3);
    expect(state.columns[1].name).toBe('Agent-実装');
    expect(state.columns[1].tasks).toHaveLength(2);
  });
});

describe('セクション完了判定', () => {
  it('全タスクが完了したセクションを判定できる', () => {
    const content = `# プロジェクト

## Agent-完了済み

- [x] タスク1
- [x] タスク2
- [x] タスク3

## Agent-進行中

- [x] タスク4
- [-] タスク5
- [ ] タスク6
`;
    const state = parseTaskContent(content);
    const completedCol = state.columns[0];
    const inProgressCol = state.columns[1];

    expect(completedCol.tasks.every(t => t.status === 'done')).toBe(true);
    expect(inProgressCol.tasks.every(t => t.status === 'done')).toBe(false);
  });
});

describe('isColumnCompleted', () => {
  it('全タスク完了のカラムはtrue', () => {
    const col = {
      name: 'Agent-テスト',
      role: 'agent' as const,
      tasks: [
        { name: 'タスク1', status: 'done' as const },
        { name: 'タスク2', status: 'done' as const },
      ],
    };
    expect(isColumnCompleted(col)).toBe(true);
  });

  it('未完了タスクがあるカラムはfalse', () => {
    const col = {
      name: 'Agent-テスト',
      role: 'agent' as const,
      tasks: [
        { name: 'タスク1', status: 'done' as const },
        { name: 'タスク2', status: 'todo' as const },
      ],
    };
    expect(isColumnCompleted(col)).toBe(false);
  });

  it('タスクが0件のカラムはfalse', () => {
    const col = {
      name: 'Agent-空',
      role: 'agent' as const,
      tasks: [],
    };
    expect(isColumnCompleted(col)).toBe(false);
  });
});
