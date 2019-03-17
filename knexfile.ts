// tslint:disable-next-line
const { resolve } = require("path");

module.exports = {
  development: {
    client: "pg",
    connection: `${process.env.DATABASE_URL}?ssl=true`,
    migrations: {
      directory: "data/migrations",
      tableName: "__knex__migrations__"
    },
    seeds: {
      directory: "data/seeds"
    }
  }
};
