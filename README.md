# Task Board

Система управления задачами с канбан-доской, drag-and-drop и WebSocket-синхронизацией.

**Стек:** React 19 · TypeScript · Vite · Redux Toolkit · Ant Design · Node.js · Express · SQLite

## Локальный запуск

```bash
pnpm install
pnpm dev         
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
```
