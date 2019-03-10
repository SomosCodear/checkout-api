import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("Tickets", table => {
    table
      .uuid("id")
      .primary("pk_tickets")
      .notNullable();
    table.uuid("customerId").nullable();
    table.uuid("purchaseId").nullable();
    table.decimal("price", 10, 2).nullable();
    table
      .integer("eventId")
      .notNullable()
      .defaultTo(1);
    table
      .string("ticketTypeId", 25)
      .notNullable()
      .defaultTo("attendee");
    table
      .string("status", 25)
      .notNullable()
      .defaultTo("blocked");
    table.dateTime("dateBooked").nullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTableIfExists("Tickets");
}
