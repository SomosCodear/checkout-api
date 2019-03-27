import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("Purchases", table => {
    table
      .uuid("id")
      .primary("pk_purchases")
      .notNullable()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.dateTime("dateCreated").notNullable();
    table.decimal("amountBilled", 10, 2).notNullable();
    table
      .string("status", 25)
      .notNullable()
      .defaultTo("unpaid");
    table.string("externalId", 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTableIfExists("Purchases");
}
