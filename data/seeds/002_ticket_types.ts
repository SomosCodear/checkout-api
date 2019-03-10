import * as Knex from "knex";

exports.seed = async (knex: Knex): Promise<any> => {
  const ticketTypes = [
    ["attendee", 1, 500, true],
    ["sponsored", 1, 0, false],
    ["speaker", 1, 0, false],
    ["staff", 1, 0, false]
  ];

  return Promise.all(
    ticketTypes.map(([id, eventId, defaultPrice, canBePurchased]) =>
      knex("TicketTypes").insert({ id, eventId, defaultPrice, canBePurchased })
    )
  );
};
