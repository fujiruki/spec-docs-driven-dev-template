# 仕様書駆動開発 — Spec-docs Driven Development (SdDD)

**「こうしたい」と言うだけで、AIが仕様書を管理しながら開発する体制。**

セッションが切れても、AIが入れ替わっても、仕様書が全てを引き継ぐ。
コードだけが残る開発から、**意図と経緯が残る開発**へ。

## 解決する問題

- セッションが切れて、次のAIに一から説明し直し
- 「前にこう言ったよね」が通じない
- 後から仕様を変えたけど、どこにも記録が残ってない
- 何を作ってるのか、自分でもわからなくなる

## 仕組み

```
あなた
  │ 「こうしたい」を伝えるだけ
  ▼
指揮AI（コードを書かない。聞く・まとめる・渡す・報告する）
  │
  ├── 仕様書に整理（requests.md → spec/*.md）
  │
  ├── Agent-A（バックグラウンドで実装中）
  │     機能完成後も生存 → デバッグも担当
  │
  ├── Agent-B（別の機能をバックグラウンドで実装中）
  │
  └── 完了報告 →「マージしていいですか？」
```

指揮AIと実装Agentを分けることで、AIが開発している間も会話が止まりません。

## クイックスタート

### 方法1: AIにセットアップしてもらう（推奨）

```bash
git clone https://github.com/fujiruki/spec-driven-dev.git
```

クローンしたディレクトリで Claude Code を起動すると、AIが「SdDDセットアップしましょうか？」と提案します。
対象プロジェクトを指定するだけで、CLAUDE.md・仕様書テンプレート・コマンド群を自動配置します。

既存のプロジェクトに導入する場合も、既存の CLAUDE.md への追記や既存ドキュメントの仕様書への取り込みをAIが対話しながら進めます。

```
AI: 「SdDDを別のプロジェクトにセットアップしますか？」
あなた: 「/path/to/my-project にお願い」
AI: 「既存のCLAUDE.mdがありますね。SdDDルールを追記しますか？」
あなた: 「追記して」
AI: 「README.mdと旧仕様.mdがあります。仕様書に取り込みましょうか？」
あなた: 「お願い」
AI: 「セットアップ完了。/sddd で開発を始められます」
```

### 方法2: GitHub Template

```bash
gh repo create my-project --template fujiruki/spec-driven-dev
cd my-project
```

仕様書テンプレート・CLAUDE.md・スラッシュコマンドが全部揃った状態で始められます。

### 方法3: 手動で導入

```bash
git clone https://github.com/fujiruki/spec-driven-dev.git

cp spec-driven-dev/templates/CLAUDE.md /path/to/your-project/
cp spec-driven-dev/templates/task.md /path/to/your-project/
cp -r spec-driven-dev/templates/docs/ /path/to/your-project/docs/
cp -r spec-driven-dev/templates/.claude/ /path/to/your-project/.claude/
```

### 方法4: 段階的に導入

一気に全部入れなくてOK。詳しくは [導入ガイド](docs/07_導入ガイド.md) を参照。

### 導入後の開始方法

テンプレートの配置が済んだら、Claude Code で `/sddd` を実行するだけで開発を始められます。

### ダッシュボードのセットアップ（任意）

進捗ダッシュボードを使うと、Agentの作業状況をリアルタイムで確認できます。

```bash
cd spec-docs-driven-dev-template/dashboard
npm install && npm run build && npm link

# プロジェクトディレクトリで、別のターミナルから起動
sdd-dashboard task.md
```

## 人間がやること

1. **要望を書く** — `docs/requests.md` に「こういう機能ほしい」と書くだけ。雑でいい
2. **確認に答える** — 「Googleログインだけでいい」とか
3. **承認する** — 「マージして」「デプロイして」

## AIがやること

1. 要望を仕様書（`docs/spec/*.md`）に整理
2. タスクに分解してAgent（バックグラウンド）に実装させる
3. 完了報告・レビュー依頼
4. 仕様変更があれば仕様書も自動更新
5. 変更履歴に「いつ・何を・なぜ変えたか」を記録

## テンプレートに含まれるもの

```
templates/
├── CLAUDE.md              ← 指揮AIのルール（これが核心）
├── task.md                ← タスク管理ファイル（ダッシュボード連携）
├── docs/
│   ├── SPEC.md            ← 仕様の目次（AIが最初に読む）
│   ├── requests.md        ← 人間が要望を書く場所
│   ├── request_log.md     ← リクエスト履歴（AIが管理）
│   └── spec/
│       ├── 01_概要.md
│       ├── 02_機能仕様.md
│       ├── 03_画面設計.md
│       ├── 04_データ設計.md
│       ├── 05_技術設計.md
│       └── 06_変更履歴.md
├── .claude/commands/       ← スラッシュコマンド（12個 + ガイド）
│   ├── sddd.md            ← SdDD開始ガイド（/sddd で呼び出し）
│   ├── sddd-setup.md      ← SdDD環境セットアップ（/sddd-setup で呼び出し）
│   ├── spec-sync.md       ← 要望→仕様書反映
│   ├── debug.md           ← エラーの根本原因追求
│   ├── kaigi.md           ← AI専門家会議
│   ├── kakunin.md         ← 実装前に止まれ
│   ├── keikaku.md         ← 設計に集中
│   ├── minaoshi.md        ← 対策の見直し
│   ├── sekkei.md          ← 詳細設計
│   ├── siyousyo.md        ← 仕様書作成
│   ├── soudan.md          ← 相談モード
│   ├── teitai.md          ← 停滞分析
│   └── wanna-make.md      ← やりたいこと計画
└── handover/
    └── TEMPLATE.md        ← Agent引き継ぎ用テンプレート
```

`task.md` は進捗ダッシュボード（`sdd-dashboard`）と連携するタスク管理ファイルです。Agentがタスクの完了チェックを入れると、ダッシュボードにリアルタイムで反映されます。

## スラッシュコマンド

Claude Code で使えるコマンドが付属しています。

| コマンド | 用途 |
|---------|------|
| `/sddd` | SdDD開始ガイドを表示（最初にこれを実行） |
| `/sddd-setup` | 対象プロジェクトにSdDD環境を自動セットアップ |
| `/spec-sync` | 要望を仕様書に反映する |
| `/debug` | エラー修正（根本原因追求・対症療法禁止） |
| `/kaigi` | AI専門家会議（4名の専門家が3ラウンドで議論） |
| `/kakunin` | 実装前に止まって確認を求める |
| `/keikaku` | 現状把握と設計に集中（実行しない） |
| `/minaoshi` | 現在の対策を客観的に見直す |
| `/sekkei` | 詳細設計・行動計画を策定 |
| `/siyousyo` | AIが理解しやすい仕様書を作成 |
| `/soudan` | 相談モード（コードに触らない） |
| `/teitai` | 停滞の原因分析と再発防止 |
| `/wanna-make` | やりたいことの計画（実装はまだ） |

## ドキュメント

### まず概要をつかむ（10分）

1. **[思想と原則](docs/01_思想と原則.md)** — なぜこの手法なのか
2. **[役割定義](docs/02_役割定義.md)** — 登場人物は3人だけ
3. **[フォルダ構成](docs/03_フォルダ構成.md)** — プロジェクトに入れるファイル群

### 実践する（15分）

4. **[導入ガイド](docs/07_導入ガイド.md)** — 自分のプロジェクトに導入する手順

### 深く理解する

5. **[ワークフロー](docs/04_ワークフロー.md)** — 6フェーズの詳細
6. **[Agent運用](docs/05_Agent運用.md)** — 並列Agent体制・劣化監視・引き継ぎ
7. **[トークン節約](docs/06_トークン節約.md)** — 大規模プロジェクト向け

## 前提ツール

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)（Agent機能を使用）

## ライセンス

MIT License
