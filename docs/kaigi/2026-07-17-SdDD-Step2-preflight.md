# SdDD Step 2 preflight 改定会議

- 開催日: 2026-07-17
- 参照: `templates/.claude/commands/kaigi.md`
- 基準コミット: `9c8fe3b`
- 作業ブランチ: `codex/sddd-doctor-preflight`

## テーマ

SdDDを「Steps of AI Adoption」のStep 2（Parallel）として実働させ、将来Step 3へ進めるため、次の改定で実装する最小範囲と順序を決める。

## ゴール

- 次のブランチへ入れる機能と入れない機能を決める
- 完了条件と非保証範囲を決める
- Markdown正本と既存利用者を壊さない進め方を決める

## 前提条件

- Markdownを正本とし、CLIが正本を置き換えない
- 特定のAI製品を必須にしない
- 既存プロジェクトの正本・独自追記を自動更新しない
- 次の機能は現時点で文書上の候補であり、実装済みではない: `doctor`、`context`、`verify`、`dispatch`
- Agent数を増やす前に、検査と検証の信頼性を作る

## 参加者

1. 技術・実装担当
2. ビジネス・継続性担当
3. UX・利用者視点担当
4. リスク・法・倫理担当

## ラウンド1: 発散

主な候補は次のとおりだった。

- `doctor` を先行し、R-ID、必須ファイル、リンク、状態の構造整合を読み取り専用で検査する
- `verify` を先行し、テスト・build・lint等の結果をSHA付き証拠として扱う
- `context` を先行し、R-ID別の仕様・台帳・タスク・引継ぎをAgentへ渡す
- `doctor + context + evidence` をTrust Gate MVPとして縦に通す
- 既存プロジェクト向けupgrade planを普及の入口にする
- 2 R-ID / 2 worktreeのParallel Golden Pathを作る
- 権限境界、誤GREEN防止、rollback、能力表示を先に定義する

## ラウンド2: 反論

### `verify` 先行案の弱点

- 言語、OS、package manager、E2E、security scanの差を初版で抱えすぎる
- 任意コマンド実行、秘密情報を含むログ、timeout、0 tests、all skipped、古いSHAへの対策が必要になる
- exit code 0と受け入れ条件達成を混同する危険がある

### `context` 先行案の弱点

- 参照解決が安定する前に、古い仕様や壊れたリンクをもっともらしく束ねる危険がある
- 秘密情報や無関係なR-IDを一か所へ集約する新しい漏えい面になる
- 初版では既存の「読むべきファイル一覧」と価値が重なりやすい

### upgrade / dispatch / Golden Path同時実装の弱点

- 移行、バックアップ、rollback、worktree、Agent起動、cleanupまで責務が広がる
- Step 2の中核である検査・検証より、環境別の運用保守が主役になる
- 一つのブランチとしてレビュー可能な範囲を超える

### `doctor` 先行案の注意点

- 構造が整っていても、仕様・実装・セキュリティが正しいとは限らない
- `GREEN`、`Trust Gate`、`Step 2完成`という表現は保証範囲を誇張する
- Markdownを厳格な専用DSLへ変えないよう、確実な破損だけをerrorにする必要がある

## ラウンド3: 収束

### 結論

**条件付きYes。次ブランチは、読み取り専用の `sddd doctor` に限定して改定を開始する。**

位置づけは「Step 2完成」ではなく、**Step 2 readiness preflight v0** とする。

### 採用するもの

1. `sddd doctor <project> --format text|json`
2. 初版の検査対象
   - 必須Markdownの有無
   - ローカルMarkdownリンク切れ
   - R-IDの形式と重複
   - 未知の要望状態値
3. rule ID付きの `error` / `warning`
4. 安定したexit codeと決定的なJSON出力
5. current / legacy / broken fixture
6. Windows・Linuxテスト
7. 実行前後で対象ファイルが変化しないことのテスト
8. READMEの機能状態表と非保証範囲

### 非保証範囲

`doctor` は次を保証しない。

- 仕様内容の妥当性
- コードが受け入れ条件を満たすこと
- テストが実際に実行されたこと
- セキュリティ、安全性、法令適合
- GitHub Issue / PR / CIの実在・成功

出力では、構造検査の成功を実装検証済みと表現しない。

### 次ブランチから棄却・後回しにするもの

- `context`
- 汎用 `verify` runner
- `handover` 自動生成
- `dispatch`、Agent自動起動、worktree自動作成・削除
- GitHub API、SQLite、dashboard連携
- 自動修復
- upgrade engine、backup、rollback
- telemetry、コスト計測、Routine
- Step 2完成という対外表現
- `/kaigi` 自体の改定

## 完了条件

- current fixtureはexit 0になる
- legacy fixtureは破壊せず、必要なwarningを返す
- broken fixtureは非0となり、安定したrule IDを返す
- textとJSONの結果が同じ診断内容を表す
- 同一入力では診断順序を含めて決定的である
- 対象treeのhashがdoctor実行前後で変わらない
- CLIがなくても従来のMarkdown運用を継続できる
- READMEで実装済み機能と文書のみの候補を区別する

## 想定リスク

- Markdown表記揺れによる誤検出
- warning過多による利用断念
- 構造PASSを品質保証と誤認されること
- CLI実装とMarkdown規則の二重保守

初版ではerrorを明白な破損へ限定し、意味判断・ネットワークアクセス・自動修正を行わないことで抑える。

## 次アクション

1. CLIの配置、package構成、診断rule IDを設計する
2. current / legacy / broken fixtureを先に作る
3. read-only coreとtext / JSON reporterを実装する
4. CIでWindows・Linuxテストを実行する
5. READMEと自動化文書へ能力状態と非保証範囲を反映する
6. doctorの利用結果を見て、次の候補を `context` と `verify evidence` から選ぶ
