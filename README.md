# Task Board

Система управления задачами с канбан-доской, drag-and-drop и WebSocket-синхронизацией.

**Стек:** React 19 · TypeScript · Vite · Redux Toolkit · Ant Design · Node.js · Express · SQLite

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

## Переменные окружения

| Переменная | Описание |
|-----------|----------|
| `VITE_API_URL` | URL бэкенда. Без значения — localStorage-режим |
| `VITE_PASSWORD` | Пароль для входа. Без значения — гейт отключён (dev, GitHub Pages) |

## Тесты

```bash
pnpm test          # unit-тесты (Vitest)
pnpm test:e2e      # E2E (Playwright)
```

## Деплой

CI деплоит автоматически при пуше в `main`:

| Стенд | Данные |
|-------|--------|
| GitHub Pages | localStorage |
| VPS тест `:8080` | JSON (tasks-test) |
| VPS прод `:80` | JSON (tasks) |

Ручной деплой: `pnpm run deploy:all`
