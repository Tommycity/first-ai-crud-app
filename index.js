const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./openapi.json");

const app = express();
const port = process.env.PORT || 3000;

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use(express.json());

let tasks = [
  { id: 1, title: "Buy groceries", done: false },
  { id: 2, title: "Walk the dog", done: true },
  { id: 3, title: "Read a book", done: false },
];

const seedTasks = () => [
  { id: 1, title: "Buy groceries", done: false },
  { id: 2, title: "Walk the dog", done: true },
  { id: 3, title: "Read a book", done: false },
];

app.get("/", (req, res) => {
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks", "/health", "/stats"] });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/tasks", (req, res) => {
  const { done, search } = req.query;
  let filteredTasks = [...tasks];

  if (done !== undefined) {
    const parsedDone = done === "true";
    filteredTasks = filteredTasks.filter((task) => task.done === parsedDone);
  }

  if (search) {
    const query = search.toString().toLowerCase();
    filteredTasks = filteredTasks.filter((task) => task.title.toLowerCase().includes(query));
  }

  res.json(filteredTasks);
});

app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  res.json(task);
});

app.post("/tasks", (req, res) => {
  const { title } = req.body;
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required and cannot be empty" });
  }

  const newTask = { id: Date.now(), title: title.trim(), done: false };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  const { title, done } = req.body;
  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: "request body must include title and/or done" });
  }

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "title cannot be empty" });
    }
    task.title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "done must be a boolean" });
    }
    task.done = done;
  }

  res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.get("/stats", (req, res) => {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  res.json({ total, done, open: total - done });
});

app.post("/reset", (req, res) => {
  tasks = seedTasks();
  res.json(tasks);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`CRUD API listening on port ${port}`);
  });
}

module.exports = { app };
