/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: "./src/backend/db/schema.js",
  out: "./src/backend/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./src/backend/data/calculations.db",
  },
};
