import express from "express";
import http from "http";
import { Server } from "socket.io";
import multer from "multer";
import cors from "cors";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, "../db.json");
const UPLOAD_DIR = path.join(__dirname, "../uploads");

fs.ensureFileSync(DB_FILE);
fs.ensureDirSync(UPLOAD_DIR);

app.use("/uploads", express.static(UPLOAD_DIR));

function readDB() {
  return fs.readJsonSync(DB_FILE);
}

function writeDB(data) {
  fs.writeJsonSync(DB_FILE, data, { spaces: 2 });
}

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.get("/api/tasks", (req, res) => {
  const db = readDB();
  res.json(db.tasks || []);
});

app.post("/api/tasks", upload.array("files"), (req, res) => {
  const db = readDB();
  if (!db.tasks) db.tasks = [];

  const newTask = {
    id: Date.now(),
    ticket: req.body.ticket || "",
    title: req.body.title || "",
    description: req.body.description || "",
    status: "new",
    deadline: req.body.deadline || null,
    createdAt: new Date().toISOString(),
    files: (req.files || []).map((f) => ({
      filename: f.filename,
      original: f.originalname,
      type: f.mimetype,
    })),
  };

  db.tasks.unshift(newTask);
  writeDB(db);

  io.emit("tasks_updated");
  res.json(newTask);
});

app.patch("/api/tasks/:id", (req, res) => {
  const db = readDB();
  const task = db.tasks.find((t) => t.id == req.params.id);

  if (!task) return res.status(404).json({ error: "Not found" });

  task.status = req.body.status;
  writeDB(db);

  io.emit("tasks_updated");
  res.json(task);
});

io.on("connection", () => {
  console.log("Client connected");
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
