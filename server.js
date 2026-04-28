const redis = require("./redis");
const express = require("express");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Distributed Task Queue API is running");
});

app.post("/tasks", async (req, res) => {
  try {
    const { type, payload, priority } = req.body;

    const result = await pool.query(
      `INSERT INTO tasks 
       (type, payload, status, priority, retry_count, max_retries, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [type, JSON.stringify(payload), "PENDING", priority, 0, 3]
    );

    // push task id into Redis queue
const queueName =
  priority === "HIGH" ? "queue:high" :
  priority === "MEDIUM" ? "queue:medium" :
  "queue:low";

await redis.lpush(queueName, result.rows[0].id);

res.status(201).json({
  message: "Task saved & queued successfully",
  task: result.rows[0]
});
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.get("/stats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT status, COUNT(*) 
      FROM tasks 
      GROUP BY status
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});