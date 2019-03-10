import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("Customers", table => {
    table
      .uuid("id")
      .primary("pk_customers")
      .notNullable();
    table.string("fullName", 100).notNullable();
    table.date("dateOfBirth").nullable();
    table.string("city", 255).nullable();
    table.string("state", 255).nullable();
    table
      .string("country", 2)
      .nullable()
      .defaultTo("AR");
    table
      .string("identificationType", 4)
      .notNullable()
      .defaultTo("DNI");
    table.string("identificationNumber", 15).notNullable();
    table.string("emailAddress", 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTableIfExists("Customers");
}
