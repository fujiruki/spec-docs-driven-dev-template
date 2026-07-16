SdDDセッションを開始する。

## 手順

1. プロジェクト直下の `SDDD.md` を読む。存在しない場合は、SdDDは未導入であることを伝え、推測でファイルを作らない。導入元の `scripts/install-sddd.ps1` または `scripts/install-sddd.sh` を使うよう案内する
2. `docs/SPEC.md`、`docs/requests.md`、`docs/requests_log.md`、`task.md`、必要な `docs/spec/` と `docs/handover/` を読む
3. 現在の要望、実装中のR-ID、保留事項、直近の引継ぎを短く整理する
4. 会話で新しい要望を受けた場合は、最初に `docs/requests.md` へ原文を記録する。以降の扱いは `SDDD.md` のライフサイクルに従う

`SDDD.md` が正本であり、このコマンドはその読み込みを補助するだけである。
