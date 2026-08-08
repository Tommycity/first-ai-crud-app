const express = require("express");
const app = express();
const port = 3000;
const swaggerUi = require("swagger-ui-express");
const openapi = require("./openapi.json");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

app.use(express.json());

const tasks = [
  { id: 1, title: "Buy groceries", done: false },
  { id: 2, title: "Walk the dog", done: true },
  { id: 3, title: "Read a book", done: false },
];
app.get("/", (req, res) => {
  res.send("Hello server!");
});

app.get("/", (req, res) =>
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] }),
);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// stage 2
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  res.json(task);
});

//stage 3
app.post("/tasks", (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask = { id: 4, title: title, done: false };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// stage 4
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  const { title, done } = req.body;
  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: "At least one field (title or done) is required" });
  }
  if (title !== undefined) task.title = title;
  if (done !== undefined) task.done = done;
  res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`CRUD API listening on port ${port}`);
});
