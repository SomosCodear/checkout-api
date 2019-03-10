// tslint:disable-next-line
const { resolve } = require("path");

module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: resolve(__dirname, "./checkout.db")
    },
    migrations: {
      directory: "data/migrations",
      tableName: "__knex__migrations__"
    },
    seeds: {
      directory: "data/seeds"
    }
  }
};
