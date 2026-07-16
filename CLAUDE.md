# SdDD参照リポジトリの案内

このリポジトリは、SdDD（Spec-docs Driven Development）の解説・テンプレート・導入スクリプトを管理する**配布元**である。利用者のアプリケーションや仕様の正本をここへ作らない。

## このリポジトリでAIがすること

1. 利用者がSdDDの考え方やテンプレートの改善を求めたら、関連する解説・テンプレート・導入手順を整合させる
2. 利用者が別プロジェクトへの導入を求めたら、まず導入先の絶対パス、GitHubテンプレートの要否、Claude Codeアダプターの要否を確認する
3. 導入先が確定したら、[.claude/commands/sddd-setup.md](.claude/commands/sddd-setup.md) と [docs/07_導入ガイド.md](docs/07_導入ガイド.md) に従い、`scripts/install-sddd.ps1` または `scripts/install-sddd.sh` を使う
4. 導入先に展開された `SDDD.md` が、利用者のプロジェクトにおける正本ルールになる。この配布元の `CLAUDE.md` は導入先へコピーしない

## このリポジトリの構成

| 場所 | 内容 |
|:--|:--|
| `docs/` | SdDDの解説ドキュメント |
| `templates/` | 導入先へ展開するテンプレート群 |
| `scripts/` | 既存ファイルを既定で上書きしない導入スクリプト |
| `INSTALL_WITH_AI.md` | 未導入プロジェクトを操作できるAIへ渡す導入指示書 |
| `landing-page/` | SdDDを説明するローカルLP |
| `.claude/commands/sddd-setup.md` | 導入先を確認して展開するための補助手順 |

## 正本の位置づけ

テンプレートにある `SDDD.md` がツール非依存の正本ルールである。`AGENTS.md` と `CLAUDE.md` は、各AI環境へその規則を読ませるアダプターである。SQLite、HTML、CodeGraph、GitHubは補助機構であり、Markdownの要望・仕様・台帳を上書きする正本ではない。

## 参照先

- [README.md](README.md) — 全体像と導入コマンド
- [docs/01_思想と原則.md](docs/01_思想と原則.md) — 不変条件
- [docs/07_導入ガイド.md](docs/07_導入ガイド.md) — 安全な導入手順
- [docs/08_運用自動化と索引.md](docs/08_運用自動化と索引.md) — SQLite、HTML、CodeGraph
- [docs/09_並列・協業開発.md](docs/09_並列・協業開発.md) — worktree、複数Agent、GitHub
