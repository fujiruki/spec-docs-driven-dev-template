import { describe, it, expect } from 'vitest';
import { resetTaskContent } from './reset.js';

describe('resetTaskContent', () => {
  it('全タスク完了セクションを削除する', () => {
    const input = `# プロジェクト

## Agent-完了済み

- [x] タスク1
- [x] タスク2

## Agent-進行中

- [x] タスク3
- [-] タスク4
- [ ] タスク5
`;
    const result = resetTaskContent(input);
    expect(result).not.toContain('Agent-完了済み');
    expect(result).not.toContain('タスク1');
    expect(result).not.toContain('タスク2');
    expect(result).toContain('Agent-進行中');
    expect(result).toContain('タスク3');
    expect(result).toContain('タスク4');
    expect(result).toContain('タスク5');
  });

  it('H1見出しは保持する', () => {
    const input = `# プロジェクト名

## Agent-完了

- [x] 完了タスク
`;
    const result = resetTaskContent(input);
    expect(result).toContain('# プロジェクト名');
  });

  it('完了セクションがない場合はそのまま返す', () => {
    const input = `# プロジェクト

## Agent-進行中

- [-] タスクA
- [ ] タスクB
`;
    const result = resetTaskContent(input);
    expect(result).toContain('Agent-進行中');
    expect(result).toContain('タスクA');
    expect(result).toContain('タスクB');
  });

  it('全セクション完了の場合はH1だけ残る', () => {
    const input = `# プロジェクト

## Agent-A

- [x] タスク1

## Agent-B

- [x] タスク2
`;
    const result = resetTaskContent(input);
    expect(result).toContain('# プロジェクト');
    expect(result).not.toContain('Agent-A');
    expect(result).not.toContain('Agent-B');
  });

  it('H3見出し配下のタスクも含めてセクション完了判定する', () => {
    const input = `# プロジェクト

## Agent-完了済み

### サブセクション1

- [x] タスク1
- [x] タスク2

### サブセクション2

- [x] タスク3

## Agent-未完了

- [ ] タスク4
`;
    const result = resetTaskContent(input);
    expect(result).not.toContain('Agent-完了済み');
    expect(result).not.toContain('サブセクション1');
    expect(result).toContain('Agent-未完了');
  });
});
