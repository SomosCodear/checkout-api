import * as Knex from "knex";
import uuid = require("uuid");

exports.seed = async (knex: Knex): Promise<any> => {
  const tickets = [];

  for (let ticketIndex = 0; ticketIndex < 200; ticketIndex += 1) {
    tickets.push([uuid.v4(), null, null, null, 1, "attendee", "forSale", null]);
  }

  for (let ticketIndex = 0; ticketIndex < 50; ticketIndex += 1) {
    tickets.push([
      uuid.v4(),
      null,
      null,
      null,
      1,
      "sponsored",
      "blocked",
      null
    ]);
  }

  return Promise.all(
    tickets.map(
      ([
        id,
        customerId,
        purchaseId,
        price,
        eventId,
        ticketTypeId,
        status,
        dateBooked
      ]) =>
        knex("Tickets").insert({
          id,
          customerId,
          purchaseId,
          price,
          eventId,
          ticketTypeId,
          status,
          dateBooked
        })
    )
  );
};
