const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "task_queue",
  user: "mohammedmasroorahmed",
  password: ""
});

module.exports = pool;