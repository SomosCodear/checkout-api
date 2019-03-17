import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return Promise.all([
    knex.schema.alterTable("Tickets", table => {
      table
        .foreign("customerId")
        .references("id")
        .inTable("Customers")
        .onUpdate("cascade")
        .onDelete("cascade");
      table
        .foreign("purchaseId")
        .references("id")
        .inTable("Purchases")
        .onUpdate("cascade")
        .onDelete("cascade");
      table
        .foreign("eventId")
        .references("id")
        .inTable("Events")
        .onUpdate("cascade")
        .onDelete("cascade");
      table
        .foreign("ticketTypeId")
        .references("id")
        .inTable("TicketTypes")
        .onUpdate("cascade")
        .onDelete("cascade");
    }),
    knex.schema.alterTable("Purchases", table => {
      table
        .foreign("customerId")
        .references("id")
        .inTable("Customers")
        .onUpdate("cascade")
        .onDelete("cascade");
    }),
    knex.schema.alterTable("Payments", table => {
      table
        .foreign("purchaseId")
        .references("id")
        .inTable("Purchases")
        .onUpdate("cascade")
        .onDelete("cascade");
    }),
    knex.schema.alterTable("TicketTypes", table => {
      table
        .foreign("eventId")
        .references("id")
        .inTable("Events")
        .onUpdate("cascade")
        .onDelete("cascade");
    })
  ]);
}

export async function down(knex: Knex): Promise<any> {
  return Promise.all([
    knex.schema.alterTable("Tickets", table => {
      table.dropForeign(["customerId"]);
      table.dropForeign(["purchaseId"]);
      table.dropForeign(["eventId"]);
      table.dropForeign(["ticketTypeId"]);
    }),
    knex.schema.alterTable("Purchases", table => {
      table.dropForeign(["customerId"]);
    }),
    knex.schema.alterTable("Payments", table => {
      table.dropForeign(["purchaseId"]);
    }),
    knex.schema.alterTable("TicketTypes", table => {
      table.dropForeign(["eventId"]);
    })
  ]);
}
