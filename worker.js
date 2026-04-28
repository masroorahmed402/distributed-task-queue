const redis = require("./redis");
const pool = require("./db");
const WORKER_ID = Math.floor(Math.random() * 1000);

async function processTask(task) {
  console.log(`Worker ${WORKER_ID} processing task:`, task.id);
  // simulate work
  if (task.payload.includes("fail")) {
    throw new Error("Simulated failure");
  }

  console.log(`Worker ${WORKER_ID} completed task:`, task.id);
}

async function workerLoop() {
  while (true) {
    try {
      let taskId = await redis.rpop("queue:high");

if (!taskId) {
  taskId = await redis.rpop("queue:medium");
}

if (!taskId) {
  taskId = await redis.rpop("queue:low");
}

if (!taskId) {
  await new Promise(r => setTimeout(r, 1000));
  continue;
}

const result = await pool.query(
  `SELECT * FROM tasks WHERE id = $1`,
  [taskId]
);

const task = result.rows[0];

      await pool.query(
        `UPDATE tasks SET status = 'PROCESSING' WHERE id = $1`,
        [task.id]
      );

      try {
        await processTask(task);

        await pool.query(
          `UPDATE tasks SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`,
          [task.id]
        );

      } catch (err) {
        const retryCount = task.retry_count + 1;

if (retryCount >= task.max_retries) {
  await pool.query(
    `UPDATE tasks SET status = 'DEAD_LETTER' WHERE id = $1`,
    [task.id]
  );
} else {
  const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s

  console.log(`Retrying task ${task.id} in ${delay / 1000} seconds`);

  setTimeout(async () => {
    await redis.lpush("queue:high", task.id); // push back to queue
  }, delay);

  await pool.query(
    `UPDATE tasks SET status = 'PENDING', retry_count = $1 WHERE id = $2`,
    [retryCount, task.id]
  );
}
      }

    } catch (err) {
      console.error("Worker error:", err);
    }
  }
}

workerLoop();