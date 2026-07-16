# SdDDをプロジェクトへ導入する

このリポジトリはSdDDの**参照実装とテンプレート配布元**である。ここ自身を利用者の開発プロジェクトとして扱わない。導入先を確認してから、既存ファイルを勝手に上書きしない。

## Step 1: 導入先を確認する

発注者に次を確認する。

- 導入先プロジェクトの絶対パス（空の新規プロジェクトでも既存プロジェクトでもよい）
- GitHubのIssue/PRテンプレートも入れるか
- Claude Code用のアダプターとコマンドも入れるか（不要なら `-WithoutClaude`）

導入先がまだ無い場合は、先に空のディレクトリまたはGitリポジトリを作ってもらう。既存のプロジェクトでは、先にGitの状態を確認する。

## Step 2: インストーラーを実行する

このリポジトリのルートで、対象に応じて次を実行する。

```powershell
.\scripts\install-sddd.ps1 -ProjectPath 'C:\Projects\my-app'
```

Issue/PRテンプレートも使う時:

```powershell
.\scripts\install-sddd.ps1 -ProjectPath 'C:\Projects\my-app' -WithGitHub
```

macOS/Linux:

```sh
./scripts/install-sddd.sh /path/to/my-app --with-github
```

同名ファイルがある場合、インストーラーは既定でスキップする。`-Overwrite` / `--overwrite` は、対象とバックアップ方針を発注者が確認した後だけ使う。

## Step 3: 導入結果を確認する

導入先に少なくとも次があることを確認する。

- `SDDD.md`（ツールに依存しない正本ルール）
- `AGENTS.md`（汎用AI向けアダプター）
- `docs/requests.md`、`docs/requests_log.md`、`docs/spec/`、`docs/SPEC.md`
- `task.md` と `docs/handover/`
- Claude Codeを選んだ場合は `CLAUDE.md` と `.claude/commands/`

`.sddd/` と `.codegraph/` はローカルの再生成可能な補助データとして `.gitignore` に追加される。

## Step 4: 利用を始める

導入先でAIに `SDDD.md` を読むよう伝える。利用者は最初の要望を `docs/requests.md` に書くか、AIへ伝える。AIは先に入力へ記録し、仕様・要望台帳・タスクを順に整える。

## 禁止事項

- グローバルな `CLAUDE.md` へSdDDの規則を混ぜない
- この参照リポジトリのテンプレートを、利用者の既存文書へ無確認で上書きしない
- `requests_log.md` の履歴、R-ID、状態を初期化・再利用しない
