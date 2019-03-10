import * as Knex from "knex";

exports.seed = async (knex: Knex): Promise<any> => {
  const events = [[1, "Córdoba WebConf 2019", "2019-05-11"]];

  return Promise.all(
    events.map(([id, name, dateScheduled]) =>
      knex("Events").insert({ id, name, dateScheduled })
    )
  );
};
