import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("Payments", table => {
    table
      .uuid("id")
      .primary("pk_payments")
      .notNullable()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("externalId").notNullable();
    table.dateTime("datePaid").nullable();
    table.uuid("purchaseId").notNullable();
    table.string("paymentType", 25).notNullable();
    table.string("paymentMethod", 25).notNullable();
    table.string("issuer", 25).nullable();
    table.integer("installments").nullable();
    table.string("cardId").nullable();
    table.decimal("amountDue", 10, 2).notNullable();
    table.decimal("amountPaid", 10, 2).nullable();
    table.decimal("interestFee", 10, 2).nullable();
    table.decimal("gatewayFee", 10, 2).notNullable();
    table
      .string("status", 25)
      .notNullable()
      .defaultTo("pending");
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTableIfExists("Payments");
}
