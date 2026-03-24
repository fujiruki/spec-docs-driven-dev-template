仕様書駆動開発（SdDD）を開始します。

## まず仕様を詰めましょう

1. `docs/requests.md` にやりたいことを書くか、直接会話で伝えてください
2. 私（指揮AI）が仕様書（`docs/spec/`）に整理します
3. 仕様が固まったらタスクを分解し、承認を得てから実装に進みます

## ダッシュボード

実装が始まったら、**別のターミナル**で進捗ダッシュボードを表示できます：

```bash
sdd-dashboard task.md
```

Agentが `task.md` を更新するたびにリアルタイムで画面が変わります。

> 初回セットアップ（まだの場合）:
> ```bash
> cd C:\Fujiruki\Projects\仕様書駆動開発\dashboard && npm install && npm run build && npm link
> ```

## 主要コマンド

| コマンド | 用途 |
|---------|------|
| `/spec-sync` | `requests.md` の要望を仕様書に反映 |
| `/kakunin` | 実装前に止まって確認 |
| `/soudan` | 相談（コードに触らない） |
| `/debug` | エラー修正（根本原因追求） |
| `/kaigi` | AI専門家会議（多角的な議論） |
| `/sddd` | このヘルプを表示 |

## ワークフロー

```
Phase 1: 受付 → Phase 2: 仕様整理 → Phase 3: タスク分解・承認
→ Phase 4: 実装（Agent） → Phase 5: レビュー → Phase 6: デプロイ
```

**では、何を作りますか？**
