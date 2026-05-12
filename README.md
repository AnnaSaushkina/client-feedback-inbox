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
| GitHub Pages | `[Посмотреть](https://annasaushkina.github.io/client-feedback-inbox/)` | localStorage      | CI при пуше |
| VPS тест     | `[Посмотреть](http://157.22.231.139:8080)`       | JSON (tasks-test) | CI при пуше |
| VPS прод     | `           | JSON (tasks)      | CI при пуше |
