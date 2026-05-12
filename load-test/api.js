import http from "k6/http";
import { check, sleep } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export const options = {
  stages: [
    { duration: "30s", target: 20 },  // разгон до 20 пользователей
    { duration: "1m",  target: 20 },  // держим нагрузку
    { duration: "20s", target: 0 },   // плавное завершение
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],  // 95% запросов быстрее 500ms
    http_req_failed:   ["rate<0.01"],  // менее 1% ошибок
  },
};

const BASE = __ENV.API_URL || "http://localhost:3000";

export default function () {
  // Получить все задачи
  const list = http.get(`${BASE}/tasks`);
  check(list, { "GET /tasks → 200": (r) => r.status === 200 });

  // Создать задачу
  const payload = JSON.stringify({
    id: randomString(8),
    title: `Load test task ${randomString(4)}`,
    completed: false,
    status: "свободно",
  });
  const create = http.post(`${BASE}/tasks`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  check(create, { "POST /tasks → 200": (r) => r.status === 200 });

  sleep(1);
}
