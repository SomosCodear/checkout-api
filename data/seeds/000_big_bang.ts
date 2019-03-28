import * as Knex from "knex";

exports.seed = async (knex: Knex): Promise<any> => {
  await knex("Payments").del();
  await knex("Purchases").del();
  await knex("Tickets").del();
  await knex("Customers").del();
  await knex("TicketTypes").del();
  await knex("Events").del();
};
