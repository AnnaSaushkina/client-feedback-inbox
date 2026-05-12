#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-157.22.231.139}"
VPS_USER="${VPS_USER:-root}"

echo "=== [1/4] Сборка сервера ==="
(cd server && pnpm install --frozen-lockfile && pnpm run build)
tar -czf /tmp/server-dist.tar.gz -C server/dist .

echo "=== [2/4] Деплой сервера на VPS ==="
scp /tmp/server-dist.tar.gz "$VPS_USER@$VPS_HOST:/tmp/"
ssh "$VPS_USER@$VPS_HOST" bash << 'VPS'
set -e
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
VPS
echo "✓ Серверы запущены"

echo "=== [3/4] GitHub Pages (localStorage) ==="
DEPLOY_TARGET=github VITE_API_URL= pnpm build
pnpm exec gh-pages -d dist
echo "✓ GitHub Pages"

echo "=== [4/4] Фронтенд на VPS ==="
VITE_API_URL="http://$VPS_HOST:8080/api" pnpm build
scp -r dist/* "$VPS_USER@$VPS_HOST:/var/www/test/"
echo "✓ Тест :8080"

VITE_API_URL="http://$VPS_HOST/api" pnpm build
scp -r dist/* "$VPS_USER@$VPS_HOST:/var/www/html/"
echo "✓ Прод :80"

echo ""
echo "Задеплоено:"
GH_REPO=$(git remote get-url origin | sed 's/.*github\.com[:/]\(.*\)\.git/\1/')
echo "  GitHub Pages : https://$(echo "$GH_REPO" | cut -d/ -f1).github.io/$(echo "$GH_REPO" | cut -d/ -f2)/"
echo "  Тест         : http://$VPS_HOST:8080"
echo "  Прод         : http://$VPS_HOST"
