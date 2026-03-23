# 仕様書駆動開発（Spec-Driven Development）

**「こうしたい」と言うだけで、AIが勝手に作る開発体制。**

仕様書駆動開発は、AIに仕様書を管理させ、実装もAIに任せる開発スタイルです。
人間がやることは3つだけ：

1. **要望を伝える**（雑でいい）
2. **確認に答える**（「Googleログインだけでいい」とか）
3. **承認する**（「マージして」「デプロイして」）

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
思いついた瞬間に次の要望を伝えられます。

## 前提ツール

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)（Agent機能を使用）

## はじめての方へ（読む順番）

### まず概要をつかむ（10分）

1. **[思想と原則](docs/01_思想と原則.md)** — なぜこの手法なのか
2. **[役割定義](docs/02_役割定義.md)** — 登場人物は3人だけ
3. **[フォルダ構成](docs/03_フォルダ構成.md)** — プロジェクトに入れるファイル群

### 実践する（15分）

4. **[導入ガイド](docs/07_導入ガイド.md)** — 自分のプロジェクトに導入する手順
5. **[templates/](templates/)** をプロジェクトにコピーして使い始める

### 深く理解する

6. **[ワークフロー](docs/04_ワークフロー.md)** — 6フェーズの詳細
7. **[Agent運用](docs/05_Agent運用.md)** — 並列Agent体制・劣化監視・引き継ぎ
8. **[トークン節約](docs/06_トークン節約.md)** — 大規模プロジェクト向け

## クイックスタート

### 1. テンプレートをコピー

```bash
# あなたのプロジェクトに docs/ と CLAUDE.md をコピー
cp -r templates/docs/ /path/to/your-project/docs/
cp templates/CLAUDE.md /path/to/your-project/CLAUDE.md
```

### 2. CLAUDE.md を編集

コピーした `CLAUDE.md` 内のプレースホルダーをプロジェクト情報に置き換えます。

### 3. Claude Code を起動

```bash
cd /path/to/your-project
claude
```

AIが `CLAUDE.md` を読み、仕様書駆動開発モードで動き始めます。

## 進捗ダッシュボード

バックグラウンドAgentの進捗をリアルタイムで可視化するCLIツールを同梱しています。

```bash
cd dashboard
npm install
npx sdd-dashboard --watch /path/to/your-project/task.md
```

詳細は [dashboard/README.md](dashboard/README.md) を参照。

## ライセンス

MIT License
