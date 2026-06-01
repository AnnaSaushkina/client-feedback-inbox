#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-157.22.231.139}"
VPS_USER="${VPS_USER:-root}"
VPS="$VPS_USER@$VPS_HOST"

cd "$(dirname "$0")"

echo "=== [1/5] Сборка сервера ==="
(cd server && pnpm install --frozen-lockfile && pnpm run build)

# Пакуем dist/ + package.json вместе — чтобы npm install на VPS знал зависимости
tar -czf /tmp/server-update.tar.gz -C server dist package.json

echo "=== [2/5] Деплой сервера ==="
scp /tmp/server-update.tar.gz $VPS:/tmp/

ssh $VPS bash << 'ENDSSH'
  set -e

  # Установить build-tools если нет (нужно для компиляции better-sqlite3)
  apt-get install -y build-essential python3 2>/dev/null || true

  # Обновить dist и установить зависимости для обоих стендов
  for dir in /root/task-manager-server /root/task-manager-test; do
    mkdir -p "$dir"
    tar -xzf /tmp/server-update.tar.gz -C "$dir"
    (cd "$dir" && npm install --omit=dev --silent)
  done

  rm -f /tmp/server-update.tar.gz

  # Перезапустить (или запустить если первый раз)
  pm2 delete task-manager task-manager-test 2>/dev/null || true
  PORT=3000 DB_PATH=/root/task-manager-server/tasks.db \
    pm2 start /root/task-manager-server/dist/index.js --name task-manager
  PORT=3001 DB_PATH=/root/task-manager-test/tasks-test.db \
    pm2 start /root/task-manager-test/dist/index.js --name task-manager-test
  pm2 save
ENDSSH
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
echo "Готово:"
echo "  GitHub Pages : https://annasaushkina.github.io/client-feedback-inbox/"
echo "  Тест         : http://$VPS_HOST:8080"
echo "  Прод         : http://$VPS_HOST"
