SdDD（仕様書駆動開発）をこのPCのClaude Code環境にグローバルセットアップします。
これは1回だけ実行すれば十分です。以降、どのプロジェクトでも `/sddd` でSdDD開発を始められるようになります。

## 手順

### Step 1: 現状スキャン

以下を調べて報告する:

- グローバル CLAUDE.md（`~/.claude/CLAUDE.md`）が存在するか、SdDDの記述が既にあるか
- 作業ディレクトリの CLAUDE.md が存在するか、SdDDの記述が既にあるか
- グローバルコマンド（`~/.claude/commands/`）にSdDD系コマンドが配置済みか
- このリポジトリ（`spec-docs-driven-dev-template`）の絶対パスを特定する

### Step 2: CLAUDE.md の追記先を確認

発注者に追記先を確認する:

```
SdDDの必須ルールをどのCLAUDE.mdに追記しますか？

【A】グローバル CLAUDE.md（~/.claude/CLAUDE.md）
  ✅ どのディレクトリでClaude Codeを起動しても常にSdDDルールが有効
  ⚠️ SdDDを使わないプロジェクトでも読み込まれる

【B】作業ディレクトリの CLAUDE.md（現在のディレクトリ）
  ✅ このディレクトリから起動したときだけ有効
  ✅ 他の環境に影響しない
  ⚠️ 別のディレクトリから起動すると読まれない
```

### Step 3: ハイブリッド方式で CLAUDE.md に追記

選ばれた CLAUDE.md に以下を追記する（既にSdDD記述があればスキップ）。
**追記前に発注者に内容を確認してもらう。許可なく書き込まない。**

追記内容（ハイブリッド方式 = 最低限ルール直接記載 + 詳細は参照）:

```markdown
## SdDD 必須ルール

* 指揮AIはコードを直接編集しない（バグ修正・デバッグ・「1行だけ」も例外なし）。実装はAgentに委譲する
* 仕様未整理のまま実装に入らない
* 仕様書を更新せずにコードだけ変えない
* Agentの完了報告なくマージしない
* `/sddd` でセッションを開始すると全ルールが有効になる
* 詳細ルール: `<spec-docs-driven-dev-templateの絶対パス>/templates/CLAUDE.md`
```

**ポイント:**
- 必須ルール（禁止事項）は直接記載 → `/sddd` 実行前でも常に有効
- ワークフロー・Agent運用・ダッシュボード等の詳細は参照先に委譲 → CLAUDE.mdを汚さない
- `/sddd` を実行すると参照先のフルルールが展開される

### Step 4: グローバルコマンドの配置

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
- `sddd-update.md` — SdDDルールの最新版をプロジェクトに反映

**既存の同名ファイルがある場合は上書きしてよいか確認する。**

### Step 5: ダッシュボードのセットアップ確認

ダッシュボードCLI（`sdd-dashboard`）がインストール済みか確認する。
未インストールなら以下を案内:

```
進捗ダッシュボード（任意）を使うと、Agentの作業状況をリアルタイムで確認できます。

セットアップ:
  cd <spec-docs-driven-dev-templateのパス>/dashboard
  npm install && npm run build && npm link
```

### Step 6: 完了報告

```
SdDDグローバルセットアップ完了しました。

配置したもの:
- CLAUDE.md（SdDD必須ルール + 詳細参照を追記）
- ~/.claude/commands/（SdDDコマンド群を配置）

使い方:
- 任意のプロジェクトで /sddd を実行するとSdDD開発を開始できます
- /sddd 実行前でも必須ルール（コード編集禁止等）は常に有効です
- 初回は仕様書テンプレートの配置から対話で進みます
```

## 注意

- 発注者の許可なくファイルを上書きしない
- 既存のCLAUDE.mdの内容を削除しない
- このコマンドはグローバル環境のセットアップのみ。プロジェクト個別のセットアップは `/sddd` が行う
