# Task Board

Система управления задачами с канбан-доской, drag-and-drop и WebSocket-синхронизацией.

**Стек:** React 19 · TypeScript · Vite · Redux Toolkit · Ant Design · Express · SQLite · Socket.IO · dnd-kit · dayjs · PWA (Workbox) · PM2

## Структура проекта

```
src/
├── features/
│   ├── kanban/          # Канбан-доска: колонки, карточки, drag-and-drop
│   └── tasks/           # Задачи: форма, просмотр, Redux slice/thunks, отчёт
├── components/
│   ├── Archive/         # Архив и секция «Выполнено сегодня»
│   └── Assignees/       # Управление исполнителями
├── store/               # Redux: configureStore, localStorage middleware
├── hooks/               # useSocket, useTaskSound, useInstallPrompt и др.
├── contexts/            # Sound и Assignees провайдеры
├── layout/              # AppLayout — корневой компонент страницы
└── types.ts / utils.tsx / constants.ts / api.ts

server/                  # Express + SQLite бэкенд
scripts/                 # deploy.sh — ручной деплой на VPS
```

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

## Команды

```bash
pnpm test      # unit-тесты (Vitest)
pnpm lint      # ESLint + Prettier check
pnpm format    # авто-форматирование src/
pnpm build     # production сборка
```
