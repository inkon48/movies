const { Pool } = require("pg");

// require("dotenv").config();
require('@dotenvx/dotenvx').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
