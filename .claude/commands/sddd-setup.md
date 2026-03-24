SdDD（仕様書駆動開発）をこのPCのClaude Code環境にグローバルセットアップします。
これは1回だけ実行すれば十分です。以降、どのプロジェクトでも `/sddd` でSdDD開発を始められるようになります。

## 手順

### Step 1: 現状スキャン

以下を調べて報告する:

- グローバル CLAUDE.md（`~/.claude/CLAUDE.md`）が存在するか、SdDDの記述が既にあるか
- グローバルコマンド（`~/.claude/commands/`）にSdDD系コマンドが配置済みか
- このリポジトリ（`spec-docs-driven-dev-template`）の絶対パスを特定する

### Step 2: グローバル CLAUDE.md への追記

`~/.claude/CLAUDE.md` に以下を追記する（既にSdDD記述があればスキップ）:

```markdown
## 仕様書駆動開発（SdDD）

SdDDのルールとワークフローは以下のリポジトリで管理されている。
- リポジトリ: <spec-docs-driven-dev-templateの絶対パス>
- ルール詳細: 上記リポジトリの `templates/CLAUDE.md` を参照

プロジェクトで `/sddd` を実行するとSdDD開発を開始できる。
```

**追記前に発注者に内容を確認してもらう。許可なく書き込まない。**

### Step 3: グローバルコマンドの配置

`~/.claude/commands/` に以下のコマンドをコピーする（既にあればスキップ）:

コピー元: このリポジトリの `templates/.claude/commands/` から:
- `sddd.md` — SdDD開発開始（プロジェクトごとのセットアップ含む）
- `spec-sync.md` — 要望→仕様書反映
- `debug.md` — エラー修正
- `kaigi.md` — AI専門家会議
- `kakunin.md` — 実装前に止まれ
- `keikaku.md` — 設計に集中
- `minaoshi.md` — 対策の見直し
- `sekkei.md` — 詳細設計
- `siyousyo.md` — 仕様書作成
- `soudan.md` — 相談モード
- `teitai.md` — 停滞分析
- `wanna-make.md` — やりたいこと計画

**既存の同名ファイルがある場合は上書きしてよいか確認する。**

### Step 4: ダッシュボードのセットアップ確認

ダッシュボードCLI（`sdd-dashboard`）がインストール済みか確認する。
未インストールなら以下を案内:

```
進捗ダッシュボード（任意）を使うと、Agentの作業状況をリアルタイムで確認できます。

セットアップ:
  cd <spec-docs-driven-dev-templateのパス>/dashboard
  npm install && npm run build && npm link
```

### Step 5: 完了報告

```
SdDDグローバルセットアップ完了しました。

配置したもの:
- ~/.claude/CLAUDE.md（SdDD参照を追記）
- ~/.claude/commands/（SdDDコマンド群を配置）

使い方:
- 任意のプロジェクトで /sddd を実行するとSdDD開発を開始できます
- 初回は仕様書テンプレートの配置から対話で進みます
```

## 注意

- 発注者の許可なくファイルを上書きしない
- 既存のグローバルCLAUDE.mdの内容を削除しない
- このコマンドはグローバル環境のセットアップのみ。プロジェクト個別のセットアップは `/sddd` が行う
