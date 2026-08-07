const express = require("express");
const app = express();
const port = 3000;

const tasks = [
  { id: 1, title: "Buy groceries", done: false },
  { id: 2, title: "Walk the dog", done: true },
  { id: 3, title: "Read a book", done: false },
];
// app.get("/", (req, res) => {
//   res.send("Hello server!");
// });

// app.get("/", (req, res) =>
//   res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] }),
// );

// app.get("/health", (req, res) =>
//   res.json({ status: "ok" })
// );

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

app.listen(port, () => {
  console.log(`CRUD API listening on port ${port}`);
});
