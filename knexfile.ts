// tslint:disable-next-line
const { resolve } = require("path");

module.exports = {
  development: {
    client: "pg",
    connection: `${process.env.DATABASE_URL}${process.env.NODE_ENV !== "development" ? "?ssl=true" : ""}`,
    migrations: {
      directory: "data/migrations",
      tableName: "__knex__migrations__"
    },
    seeds: {
      directory: "data/seeds"
    }
  }
};
