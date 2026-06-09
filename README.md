# Task Board

Система управления задачами с канбан-доской, drag-and-drop и WebSocket-синхронизацией.

**Стек:** React 19 · TypeScript · Vite · Redux Toolkit · Ant Design · Express · SQLite

## Архитектура

```
src/
├── features/
│   ├── kanban/          # Канбан-доска: колонки, карточки, drag-and-drop
│   └── tasks/           # Форма задачи, просмотр, константы
├── components/
│   ├── Archive/         # Архив и секция "Выполнено сегодня"
│   └── Assignees/       # Управление исполнителями
├── store/               # Redux: slice, thunks, middleware для localStorage
├── hooks/               # Глобальные хуки (WebSocket, звук)
├── contexts/            # Провайдеры звука и исполнителей
├── layout/              # AppLayout - корневой UI-компонент
└── types.ts / utils.tsx / constants.ts / api.ts

server/                  # Express + SQLite бэкенд
scripts/                 # deploy.sh - ручной деплой на VPS
```

### Назначение файлов

| Файл                                  | Что хранит                                 |
| ------------------------------------- | ------------------------------------------ |
| `src/types.ts`                        | Все типы проекта                           |
| `src/store/tasksThunks.ts`            | Все API-вызовы и мутации задач             |
| `src/features/tasks/TaskEditor.tsx`   | Модалка создания/редактирования задачи     |
| `src/features/kanban/KanbanBoard.tsx` | Канбан                                     |
| `src/hooks/useSocket.ts`              | WebSocket-подписка на изменения от сервера |
| `server/index.ts`                     | Express-сервер                             |

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
pnpm build     # production сборка
```
