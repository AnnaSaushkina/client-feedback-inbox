#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-157.22.231.139}"
VPS_USER="${VPS_USER:-root}"
VPS="$VPS_USER@$VPS_HOST"

cd "$(dirname "$0")"

echo "=== [1/5] Сборка сервера ==="
(cd server && pnpm install --frozen-lockfile && pnpm run build)
tar -czf /tmp/server-dist.tar.gz -C server/dist .

echo "=== [2/5] Деплой сервера ==="
scp /tmp/server-dist.tar.gz $VPS:/tmp/
ssh $VPS '
  for dir in /root/task-manager-server /root/task-manager-test; do
    rm -rf "$dir/dist" && mkdir -p "$dir/dist"
    tar -xzf /tmp/server-dist.tar.gz -C "$dir/dist"
  done
  pm2 delete task-manager task-manager-test 2>/dev/null || true
  PORT=3000 DB_PATH=/root/task-manager-server/tasks.json \
    pm2 start /root/task-manager-server/dist/index.js --name task-manager
  PORT=3001 DB_PATH=/root/task-manager-test/tasks-test.json \
    pm2 start /root/task-manager-test/dist/index.js --name task-manager-test
  pm2 save
'
echo "✓ Серверы запущены"

echo "=== [3/5] GitHub Pages ==="
DEPLOY_TARGET=github VITE_API_URL= VITE_PASSWORD= pnpm build
pnpm exec gh-pages -d dist
echo "✓ GitHub Pages"

echo "=== [4/5] Тестовый стенд :8080 ==="
VITE_API_URL="http://$VPS_HOST:8080/api" VITE_PASSWORD= pnpm build
scp -r dist/* $VPS:/var/www/test/
echo "✓ Тест"

echo "=== [5/5] Прод :80 ==="
VITE_API_URL="http://$VPS_HOST/api" pnpm build
scp -r dist/* $VPS:/var/www/html/
echo "✓ Прод"

echo ""
echo "Готово. Стенды:"
echo "  GitHub Pages : https://annasaushkina.github.io/client-feedback-inbox/"
echo "  Тест         : http://$VPS_HOST:8080"
echo "  Прод         : http://$VPS_HOST"
