import {
  KnexProcessor,
  Operation,
  Resource,
  ResourceRelationship
} from "@joelalejandro/jsonapi-ts";
import Errors from "../../errors";
import Ticket from "./resource";

export default class TicketProcessor extends KnexProcessor<Ticket> {
  public resourceClass = Ticket;

  public async add(op: Operation): Promise<Ticket> {
    const ticket = op.data;

    if (!ticket.relationships.customer) {
      throw Errors.DataRequired("relationships.customer");
    }

    ticket.attributes.customerID = (ticket.relationships.customer
      .data as ResourceRelationship).id as string;

    ticket.relationships = {};

    const assignedTicketId = await this.getFirstSellableTicketId();

    return super.update({
      ...op,
      data: ticket,
      ref: { type: "ticket", id: assignedTicketId }
    } as Operation);
  }

  private async getFirstSellableTicketId(): Promise<string> {
    const [{ id }] = await this.knex("Tickets")
      .select("id")
      .where({
        ticketTypeId: "attendee",
        eventId: 1,
        status: "forSale"
      })
      .limit(1);

    return id;
  }
}
