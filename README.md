# SdDD — AIに読ませる開発手法・運用テンプレート

> **要望を書けば、仕様書になり、実装へ進む。**

SdDD（Spec-docs Driven Development）は、AIに読ませる共通ルールとMarkdownテンプレートをプロジェクトへ入れ、要望 → 仕様 → タスク → 実装 → 検証を一つの記録として進める開発手法です。

利用者は、要望をファイルに書くかAIへ伝え、必要な判断に答えます。AI・自動化は、要望の記録、仕様化、タスク化、実装、検証、引継ぎを進めます。AIやセッションが交代しても、仕様と要望台帳に残った判断から再開できます。

## AIに導入を任せる場合

SdDD未導入のプロジェクトを操作できるAIへ、[INSTALL_WITH_AI.md](INSTALL_WITH_AI.md) を渡してください。AIが導入先を確認し、既存ファイルを既定で上書きせずにテンプレートを展開します。

```text
このプロジェクトにSdDDを導入したいです。INSTALL_WITH_AI.md を最後まで読み、
このプロジェクトを対象に安全に導入してください。既存ファイルは上書きしないでください。
```

## 既存SdDDプロジェクトをAIにアップグレードさせる場合

すでにSdDDを使っているプロジェクトでは、利用中の `requests.md`、`requests_log.md`、`spec/`、`task.md` をテンプレートで上書きしてはいけません。プロジェクトを操作できるAIへ、次のプロンプトを渡してください。

```text
このプロジェクトは、以前のSdDDテンプレートを導入済みです。
最新版の fujiruki/spec-docs-driven-dev-template を参照して、今回のSdDD改定を安全にアップグレードしてください。

最初に、現在のプロジェクトの SDDD.md、AGENTS.md、CLAUDE.md、docs/requests.md、
docs/requests_log.md（または旧 request_log.md）、docs/spec/、task.md、引継書を読んでください。
次に、最新版の参照リポジトリにある README.md、templates/SDDD.md、templates/AGENTS.md、
templates/CLAUDE.md、templates/.claude/commands/、docs/07_導入ガイド.md を読んで、差分を整理してください。

以下のルールを守ってアップグレードしてください。
- 既存の要望、要望台帳、仕様、タスク、引継書、プロジェクト固有の指示を消去・初期化・テンプレートで上書きしない
- まず不足している新規ファイルだけを追加する。SDDD.md と AGENTS.md を追加し、CLAUDE.md はプロジェクト固有の部分を残したまま SDDD.md を読むアダプターにする
- 旧 docs/request_log.md がある場合は、履歴を変えず docs/requests_log.md への名称移行を提案・実施する。過去の状態や要望IDを捏造しない
- 新しいR-IDは R-0001 形式の連番・再利用禁止にし、状態「統合」は「他要望へ統合」へ移行する。該当履歴がある場合は、統合先R-IDが分からなければ勝手に補完せず確認事項として残す
- .sddd/ と .codegraph/ を .gitignore に追加し、CodeGraph、SQLite、HTMLはMarkdown正本を上書きしない補助として扱う
- 既存ファイルとの衝突、意味が変わる移行、秘密情報・公開範囲の判断は、変更前に質問する
- 更新後はMarkdownリンク、要望IDの参照、AIが最初に読む SDDD.md と SPEC.md の導線を確認する
- Gitのコミット、push、デプロイは行わない。必要なら最後に提案する

作業前に「追加・変更・手作業確認が必要」の3分類で計画を示し、作業後は変更内容、保持した既存データ、未解決事項、次に確認すべきことを報告してください。
```

参照リポジトリをローカルに持つ導入では、導入時に作られる `.sddd/template-source.md` から取得元を確認できます。存在しない場合は、AIが別のテンプレートを推測で混ぜず、最新版の参照リポジトリを明示して差分を確認します。

## なぜSdDDか

通常のバイブコーディングでは、要望を伝えるたびにコードは変わっても、以前に残したかった仕様が消えたり、別の要望と衝突したりしがちです。

SdDDは先に仕様を確定し、その仕様に沿って実装します。実装の前提・受け入れ条件・変更理由を要望IDで結ぶため、過去の要望を忘れず、実装漏れや仕様衝突を見つけやすくなります。

```text
利用者: 要望を書く / AIへ伝える / 判断に答える
  ↓
AI: 原文を requests.md に記録し、仕様を整理する
  ↓ 仕様確定
AI: requests_log.md・spec/・task.md を同じR-IDで更新する
  ↓
AI・実装担当: 仕様と受け入れ条件に沿って実装・検証する
  ↓
AI: 台帳に結果・根拠・次の判断を残す
```

## これは何か

SdDDは、特定のAIやモデルに依存しない**開発手法**であり、AIに読ませる**運用ルールとテンプレート**のセットです。

- `SDDD.md` — ツールに依存しない正本ルール
- `AGENTS.md` / `CLAUDE.md` — 各AI環境に正本ルールを読ませるアダプター
- `requests.md` / `requests_log.md` / `spec/` / `task.md` — 要望から実装までを残すMarkdownの正本

Claude Code向けコマンド、Codex、GitHub、CodeGraph、SQLite、HTMLダッシュボードは、環境に応じて使う補助機構です。

## 導入する

このリポジトリは参照実装とテンプレート配布元です。新規・既存を問わず、利用するプロジェクトへインストーラーで展開します。既存の同名ファイルは、既定では上書きしません。

PowerShell:

```powershell
git clone https://github.com/fujiruki/spec-docs-driven-dev-template.git
cd spec-docs-driven-dev-template
.\scripts\install-sddd.ps1 -ProjectPath 'C:\Projects\my-app'
```

GitHubのIssue/PRテンプレートも入れる場合:

```powershell
.\scripts\install-sddd.ps1 -ProjectPath 'C:\Projects\my-app' -WithGitHub
```

macOS/Linux:

```sh
git clone https://github.com/fujiruki/spec-docs-driven-dev-template.git
cd spec-docs-driven-dev-template
./scripts/install-sddd.sh /path/to/my-app --with-github
```

導入後は、プロジェクトのAIに `SDDD.md` を読むよう伝えます。Claude Codeでは `/sddd` が、その読み込みとセッション開始を補助します。詳細は[導入ガイド](docs/07_導入ガイド.md)を参照してください。

## 利用者とAIがすること

| 利用者 | AI・自動化 |
|:--|:--|
| 要望を `docs/requests.md` に書く、またはAIへ伝える | 会話で受けた要望も、仕様の話を始める前に原文で記録する |
| 仕様上の判断が必要な質問に答える | 仕様化を始める時にR-IDを採番し、仕様を整理する |
| 結果確認、マージ、公開の承認をする | 仕様確定時に台帳・仕様・タスクを同じR-IDで更新する |
|  | 実装・テスト・レビュー・引継ぎ・状態更新を進める |

利用者が要望IDでファイルをつなぐ必要はありません。その記録と整合確認は、AI・自動化側の仕事です。

## 要望のライフサイクル

1. `requests.md` に、未整理の要望を原文で置く
2. 仕様化を始める時に `R-0001` のような一意のIDを付ける
3. 仕様が確定したら、`requests_log.md`・`spec/`・`SPEC.md`・`task.md` を更新する
4. 記録を確認してから、該当の入力だけを `requests.md` から取り除く
5. 実装中・検証中・完了・保留・見送り・取り下げ・他要望への統合を、同じ台帳記録に追記する

IDは再利用しません。`他要望への統合` は別のR-IDへ統合する時だけの状態で、Gitのマージとは別です。統合先R-IDと理由を必ず残します。

## テンプレートに含まれるもの

```text
templates/
├── SDDD.md                 ← ツール非依存の正本ルール
├── AGENTS.md               ← 汎用AI向けアダプター
├── CLAUDE.md               ← Claude Code向けアダプター
├── task.md                 ← 実装・検証計画
├── docs/
│   ├── SPEC.md             ← 現在の仕様への入口
│   ├── requests.md         ← 未整理・仕様確認中の要望
│   ├── requests_log.md     ← 仕様確定後の全要望台帳
│   ├── spec/               ← 現在有効な仕様
│   ├── handover/           ← 担当交代時の再開記録
│   ├── automation.md       ← 自動化・索引の方針
│   └── collaboration.md    ← worktree・複数Agent・GitHub協業の方針
├── .claude/commands/       ← Claude Code用の補助コマンド
└── .github/                ← Issue / PRテンプレート（任意）
```

## 必要になった時だけ広げる

| 課題 | SdDDで追加するもの |
|:--|:--|
| 台帳の検索・集計が重い | Markdownから再生成するSQLite索引 |
| 人が状況を見づらい | Markdownから生成するHTML一覧・ダッシュボード |
| 影響範囲が読みにくい | [CodeGraph](https://github.com/colbymchenry/codegraph) によるローカルのコード索引 |
| 独立作業を並列に進めたい | 1要望ID / 1ブランチ / 1worktree / 1実装担当 |
| 複数人で開発したい | 仕様確定後のIssue、PR、保護ブランチ |

Markdownが正本です。SQLite、HTML、CodeGraphなどは、検索・表示・影響調査を助ける再生成可能な補助として使い、正本を勝手に上書きしません。

## ドキュメント

1. [思想と原則](docs/01_思想と原則.md) — SdDDが守る不変条件
2. [役割定義](docs/02_役割定義.md) — 利用者・指揮・実装・レビュー・統合の責務
3. [フォルダ構成](docs/03_フォルダ構成.md) — 正本と補助データの境界
4. [ワークフロー](docs/04_ワークフロー.md) — 要望から完了までの進め方
5. [Agent運用](docs/05_Agent運用.md) — 指揮、実装、独立レビュー、引継ぎ
6. [導入ガイド](docs/07_導入ガイド.md) — 新規・既存プロジェクトへの導入
7. [運用自動化と索引](docs/08_運用自動化と索引.md) — SQLite、HTML、CodeGraph
8. [並列・協業開発](docs/09_並列・協業開発.md) — worktree、複数Agent、GitHub

## 公開範囲

`requests.md` と `requests_log.md` は通常Git管理されます。公開または外部共有するリポジトリには、パスワード、トークン、秘密鍵、個人情報、契約上の秘匿情報、生の会話原文を書かないでください。必要なら、安全な保管先を参照する公開可能な要約だけを残します。

## ライセンス

MIT License
