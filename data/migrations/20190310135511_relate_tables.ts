import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return Promise.all([
    knex.schema.alterTable("Tickets", table => {
      table
        .foreign("customerId")
        .references("id")
        .inTable("Customers");
      table
        .foreign("purchaseId")
        .references("id")
        .inTable("Purchases");
      table
        .foreign("eventId")
        .references("id")
        .inTable("Events");
      table
        .foreign("ticketTypeId")
        .references("id")
        .inTable("TicketTypes");
    }),
    knex.schema.alterTable("Purchases", table => {
      table
        .foreign("customerId")
        .references("id")
        .inTable("Customers");
    }),
    knex.schema.alterTable("Payments", table => {
      table
        .foreign("purchaseId")
        .references("id")
        .inTable("Purchases");
    }),
    knex.schema.alterTable("TicketTypes", table => {
      table
        .foreign("eventId")
        .references("id")
        .inTable("Events");
    })
  ]);
}

export async function down(knex: Knex): Promise<any> {
  // return Promise.all([
  //   knex.schema.alterTable("Tickets", table => {
  //     table.dropForeign(["customerId"]);
  //     table.dropForeign(["purchaseId"]);
  //     table.dropForeign(["eventId"]);
  //     table.dropForeign(["ticketTypeId"]);
  //   }),
  //   knex.schema.alterTable("Purchases", table => {
  //     table.dropForeign(["customerId"]);
  //   }),
  //   knex.schema.alterTable("Payments", table => {
  //     table.dropForeign(["purchaseId"]);
  //   }),
  //   knex.schema.alterTable("TicketTypes", table => {
  //     table.dropForeign(["eventId"]);
  //   })
  // ]);
}
