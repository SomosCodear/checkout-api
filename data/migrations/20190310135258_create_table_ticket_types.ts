import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("TicketTypes", table => {
    table
      .string("id", 20)
      .primary("pk_ticket_types")
      .notNullable();
    table.integer("eventId").notNullable();
    table.decimal("defaultPrice", 10, 2).notNullable();
    table.boolean("canBePurchased").notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTableIfExists("TicketTypes");
}
