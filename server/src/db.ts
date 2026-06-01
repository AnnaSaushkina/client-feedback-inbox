import Database from "better-sqlite3";
import fs from "fs";

const dbPath = process.env.DB_PATH || "./tasks.db";

// Путь к старому JSON-файлу для однократной миграции
const legacyPath = dbPath.replace(/\.db$/, ".json");

const db = new Database(dbPath);
db.exec(`CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, data TEXT NOT NULL)`);

// Однократная миграция из tasks.json если таблица пустая
const isEmpty = (db.prepare("SELECT COUNT(*) as n FROM tasks").get() as { n: number }).n === 0;
if (isEmpty && fs.existsSync(legacyPath)) {
  try {
    const tasks: any[] = JSON.parse(fs.readFileSync(legacyPath, "utf-8"));
    const insert = db.prepare("INSERT OR IGNORE INTO tasks (id, data) VALUES (?, ?)");
    db.transaction(() => tasks.forEach((t) => insert.run(t.id, JSON.stringify(t))))();
    console.log(`Migrated ${tasks.length} tasks from ${legacyPath}`);
  } catch (e) {
    console.error("Migration error:", e);
  }
}

export function readTasks(): any[] {
  return (db.prepare("SELECT data FROM tasks").all() as { data: string }[])
    .map((row) => JSON.parse(row.data));
}

export function writeTasks(tasks: any[]): void {
  db.transaction(() => {
    db.prepare("DELETE FROM tasks").run();
    const insert = db.prepare("INSERT INTO tasks (id, data) VALUES (?, ?)");
    tasks.forEach((t) => insert.run(t.id, JSON.stringify(t)));
  })();
}

export async function initDb(): Promise<void> {
  // SQLite инициализируется синхронно выше
}
