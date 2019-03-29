import { KnexProcessor, Operation, Resource } from "@joelalejandro/jsonapi-ts";
import Hype from "./resource";

export default class HypeProcessor extends KnexProcessor {
  public resourceClass = Hype;

  public async get(op: Operation): Promise<Hype[]> {
    if (!((op.params || { include: [] }).include || []).includes("y-eia")) {
      return [];
    }

    const ticketsSold = (await this.knex("Tickets")
      .where({ status: "owned" })
      .count())[0].count;
    const ticketsBooked = (await this.knex("Tickets")
      .where({ status: "booked" })
      .count())[0].count;
    const ticketsBlocked = (await this.knex("Tickets")
      .where({ status: "blocked" })
      .count())[0].count;
    const ticketsAvailable = (await this.knex("Tickets")
      .where({ status: "forSale" })
      .count())[0].count;

    return [
      {
        type: "hype",
        attributes: {
          ticketsSold,
          ticketsBooked,
          ticketsBlocked,
          ticketsAvailable
        },
        relationships: {}
      }
    ];
  }
}
