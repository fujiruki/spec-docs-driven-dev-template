# sdd-dashboard

仕様書駆動開発（SDD）の進捗ダッシュボードCLIツール。
指揮AIが管理する `task.md` ファイルを監視し、バックグラウンドAgentの進捗をリアルタイムでターミナルに表示する。

## セットアップ

```bash
cd dashboard
npm install
npm run build
```

## 使い方

```bash
# task.md のパスを指定して起動
npx sdd-dashboard --watch /path/to/task.md

# カレントディレクトリの task.md を監視
npx sdd-dashboard

# 初期表示モードを指定
npx sdd-dashboard --watch task.md --columns 1
```

## キー操作

| キー | 動作 |
|------|------|
| `1` | 1列表示（縦並び） |
| `2` | 2列表示（横並び） |
| `q` | 終了 |

## task.md フォーマット

```markdown
# プロジェクト名

## 指揮AI
### 待機タスク
- [ ] タスク名

## Agent-認証
### タスク
- [x] 完了タスク
- [-] 進行中タスク
- [ ] 未着手タスク
```

### ステータス記法

| 記法 | 意味 |
|------|------|
| `- [x]` | 完了 |
| `- [-]` | 進行中 |
| `- [ ]` | 未着手 |

### セクション規約

- `## 指揮AI` → 指揮AI列（role: commander）
- `## Agent-XXX` → Agent列（role: agent）
- `### ` 見出しはセクションラベル（表示には使わない）
- `# ` 見出しはプロジェクト名として使用
