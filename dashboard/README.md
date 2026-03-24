# sdd-dashboard

仕様書駆動開発（SdDD）の進捗ダッシュボードCLIツール。
指揮AIが管理する `task.md` ファイルを監視し、バックグラウンドAgentの進捗をリアルタイムでターミナルに表示する。

## セットアップ

```bash
cd dashboard
npm install
npm run build
npm link
```

`npm link` により `sdd-dashboard` コマンドがグローバルに登録される。
以降はどのディレクトリからでもコマンド名だけで呼び出せる。

## 使い方

```bash
# プロジェクトの task.md を指定して起動（別ターミナルで実行）
sdd-dashboard /path/to/project/task.md

# カレントディレクトリの task.md を監視
sdd-dashboard

# 初期表示モードを指定
sdd-dashboard task.md --columns 1
```

**運用の流れ:**
1. ターミナル1: Claude Codeで仕様書駆動開発（指揮AI + Agent起動）
2. ターミナル2: `sdd-dashboard task.md` を起動しっぱなしにする
3. Agentが `task.md` を更新するたびにダッシュボードがリアルタイムで変わる

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

## 別マシンへの導入

このリポジトリをpullした後：

```bash
cd dashboard
npm install
npm run build
npm link
```

これだけで `sdd-dashboard` コマンドが使えるようになる。
`npm link` は `package.json` の `bin` フィールドに定義されたコマンド名をグローバルにシンボリックリンクする仕組み。
