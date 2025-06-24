const { Pool } = require('pg');

const ENV = process.env.NODE_ENV || 'development';

// loads environment variables from the appropriate .env file
require('dotenv').config({ path: `${__dirname}/../.env.${ENV}` });

// checks for required database environment variables
if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error('PGDATABASE or DATABASE_URL not set');
} else {
  // logs the database being connected to
  console.log(`Connected to ${process.env.PGDATABASE}`);
}

const config = {};

// sets up connection config for production environment
if (ENV === 'production') {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2;
}

// exports a new PostgreSQL connection pool
module.exports = new Pool(config);
