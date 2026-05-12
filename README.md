# О проекте

Система управления заявками с визуальной автоматизацией

## Стек

**Frontend:** React 19 · TypeScript · Vite · Redux Toolkit · Ant Design  
**Backend:** Node.js · Express · WebSocket · SQLite
**Testing:** Vitest · RTL · Playwright · k6  
**Infra:** Nginx · pm2 · GitHub Actions CI/CD

## Ключевые особенности

- Канбан с drag-and-drop, валидацией графа переходов в реал-тайме
- Виртуализация списков — 10 000+ элементов без лагов
- WebSocket синхронизация для единовременной работы
- Три стенда из одного пуша: GitHub Pages · VPS тест · VPS прод
- Unit-, E2E-, нагрузочные тесты

## Локальный запуск

```bash
pnpm install
pnpm dev          # frontend на localhost:5173 (localStorage-режим, бэкенд не нужен)
```

С бэкендом:

```bash
cd server && pnpm install && pnpm dev   # сервер на localhost:3000
# в другом терминале:
VITE_API_URL=http://localhost:3000 pnpm dev
```

## Тесты

```bash
pnpm test          # unit-тесты (Vitest)
pnpm test:e2e      # E2E (Playwright)
pnpm test:load     # нагрузочный (k6)
```

## Деплой

### Три стенда

| Стенд        | URL                                | Данные            | Кто деплоит |
| ------------ | ---------------------------------- | ----------------- | ----------- |
| GitHub Pages | `https://<user>.github.io/<repo>/` | localStorage      | CI при пуше |
| VPS тест     | `http://157.22.231.139:8080`       | JSON (tasks-test) | CI при пуше |
| VPS прод     | `http://157.22.231.139`            | JSON (tasks)      | CI при пуше |

### Автоматический деплой (CI/CD)

Любой пуш в `main` запускает GitHub Actions:

1. Тесты (lint + unit)
2. **GitHub Pages** — сборка без API URL → `gh-pages` ветка
3. **VPS** — сборка сервера → scp на VPS → pm2 restart, затем фронтенд для тест и прод

#### Секреты GitHub (Settings → Secrets → Actions)

| Секрет        | Значение                      |
| ------------- | ----------------------------- |
| `VPS_HOST`    | IP-адрес VPS                  |
| `VPS_USER`    | `root`                        |
| `VPS_SSH_KEY` | Приватный SSH-ключ (см. ниже) |

#### Настройка SSH-ключа для CI (один раз)

```bash
# Локально — генерируем ключ для деплоя
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""

# Добавляем публичный ключ на VPS
ssh-copy-id -i ~/.ssh/deploy_key.pub root@157.22.231.139

# Содержимое приватного ключа добавить в GitHub Secret VPS_SSH_KEY:
cat ~/.ssh/deploy_key
```

### Ручной деплой (все три стенда за раз)

```bash
VPS_HOST=157.22.231.139 VPS_USER=root bash deploy.sh
```

Скрипт попросит пароль SSH при необходимости.

### Архитектура на VPS

```
nginx :80  → /var/www/html  (прод-фронтенд)
       /api/ → pm2: task-manager   (PORT=3000, tasks.json)
       /socket.io/ → pm2: task-manager

nginx :8080 → /var/www/test  (тест-фронтенд)
       /api/ → pm2: task-manager-test  (PORT=3001, tasks-test.json)
       /socket.io/ → pm2: task-manager-test
```

Данные хранятся в JSON-файлах:

- Прод: `/root/task-manager-server/tasks.json`
- Тест: `/root/task-manager-test/tasks-test.json`
