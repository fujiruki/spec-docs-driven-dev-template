# SdDDをこのプロジェクトへ導入するAIへの指示書

このファイルは、**まだSdDDを導入していないプロジェクトを操作できるAI**へ、そのまま渡すための指示書です。

利用者はAIに、次のように伝えてください。

> このプロジェクトにSdDDを導入したいです。`INSTALL_WITH_AI.md` を最後まで読み、このプロジェクトを対象に安全に導入してください。既存ファイルは上書きしないでください。

---

## AIが行うこと

あなたは、現在操作しているプロジェクトへSdDDを導入する。SdDDは、要望・仕様・タスク・実装・検証をMarkdownでつなぐための、AIに読ませる開発手法・運用テンプレートである。

### 1. 導入先を確定する

1. 現在の作業ディレクトリが導入先プロジェクトか確認する。違う場合、導入先の絶対パスを利用者に1回だけ確認する
2. 導入先のGit状態と既存の `SDDD.md`、`docs/requests.md`、`docs/requests_log.md`、`docs/spec/`、`task.md` を読み取り専用で確認する
3. 既にSdDDが入っている場合は、導入をやり直さない。既存の `SDDD.md` を読み、更新が必要か利用者に確認する

### 2. 参照リポジトリを取得する

この指示書の配布元は次である。

```text
https://github.com/fujiruki/spec-docs-driven-dev-template.git
```

すでにそのローカルコピーが分かる場合はそれを使う。無い場合は、**導入先プロジェクトの外側**に一時的な作業用コピーとしてcloneする。導入先のGit履歴やファイルを、参照リポジトリの内容で置き換えない。

### 3. 既定の安全な導入を実行する

参照リポジトリのルートから、対象プロジェクトの絶対パスを指定してインストーラーを実行する。

Windows PowerShell:

```powershell
.\scripts\install-sddd.ps1 -ProjectPath '導入先プロジェクトの絶対パス'
```

macOS/Linux:

```sh
./scripts/install-sddd.sh /導入先プロジェクトの絶対パス
```

次の規則を守る。

- `-Overwrite` / `--overwrite` は使わない。既存の同名ファイルは既定でスキップされる
- GitHubのIssue/PRテンプレートは、利用者がGitHub協業にも使うと明示した場合だけ `-WithGitHub` / `--with-github` を付ける
- Claude Code用アダプターは既定で導入する。利用者がClaude Codeを使わないため不要だと明示した場合だけ `-WithoutClaude` / `--without-claude` を付ける
- `git reset`、既存ファイルの削除、既存ドキュメントの一括書き換えは行わない

### 4. 導入結果を確認する

少なくとも次を確認する。

```text
SDDD.md
AGENTS.md
docs/SPEC.md
docs/requests.md
docs/requests_log.md
docs/spec/
docs/handover/
task.md
```

Claude Code用を入れた場合は `CLAUDE.md` と `.claude/commands/`、GitHub協業用を入れた場合は `.github/` も確認する。

`.gitignore` に `.sddd/` と `.codegraph/` が含まれていることも確認する。これらは再生成できるローカル補助データであり、既定ではGit管理しない。

### 5. 導入直後にすること

1. 導入先の `SDDD.md` を読む。これが要望・仕様・タスク・検証の正本ルールである
2. 既存のREADMEや設計資料がある場合、無断で書き換えない。必要なら `docs/SPEC.md` からリンクする提案をする
3. 利用者へ、最初の要望を `docs/requests.md` に書くか、会話で伝えればよいと案内する
4. 会話で要望を受けた場合は、仕様の話を始める前に `docs/requests.md` へ原文を記録する。その後の仕様化・R-ID採番・台帳化は `SDDD.md` に従う

### 完了報告に含めること

- 導入先の絶対パス
- 作成したファイルと、既存のためスキップしたファイル
- GitHub/Claude Code用オプションを入れたかどうか
- 既存資料を変更していないこと
- 次に利用者ができること（要望を `docs/requests.md` に書く、またはAIへ伝える）
