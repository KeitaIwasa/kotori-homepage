# kotori-homepage
多言語翻訳LINEボット「KOTORI」のホームページです。
https://kotori-ai.com/

CloudFront + S3 の同一オリジン構成でホスティングされています（GitHub Pages は無効化済み）。
ドメインはCloudFlareのDNSで管理。wrangler使用可能。Cloudflare API 経由でDNS操作できます。

## 現行配信構成（2026-03-25）
- 公開URL: `https://kotori-ai.com`
- フロント配信: CloudFront (`E38ONIMIEBQ6UE`) → S3 website origin
- API配信: CloudFront `/api/*` → API Gateway `/prod`
- フロント実装は API を相対パス `/api/...` で呼び出す

## デプロイ手順（静的ファイル）
```bash
# CloudFront の static origin バケットへ同期（README/CNAME は除外）
aws s3 sync ./kotori-homepage/ s3://kotori-ai-static-origin-215896857123-1774415519/ \
  --delete \
  --exclude ".git/*" \
  --exclude "AGENTS.md" \
  --exclude "README.md" \
  --exclude "CNAME" \
  --profile line-translate-bot

# キャッシュ無効化
aws cloudfront create-invalidation \
  --distribution-id E38ONIMIEBQ6UE \
  --paths '/*' \
  --profile line-translate-bot
```

## 国旗SVGについて
https://flagicons.lipis.dev/から1:1のアスペクト比でダウンロードしたSVGを使用しています。
