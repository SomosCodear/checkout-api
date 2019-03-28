import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("Events", table => {
    table
      .integer("id")
      .primary("pk_events")
      .notNullable();
    table.string("name", 255).notNullable();
    table.date("dateScheduled").notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTableIfExists("Events");
}
