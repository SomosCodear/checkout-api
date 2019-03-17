import {
  KnexProcessor,
  Operation,
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

    ticket.attributes.customerId = (ticket.relationships.customer
      .data as ResourceRelationship).id as string;

    ticket.attributes.status = "booked";
    ticket.attributes.dateBooked = new Date().toJSON();
    ticket.relationships = {};

    const assignedTicketId = await this.getFirstSellableTicketId();
    ticket.attributes.price = Number(
      await this.getTicketPrice(assignedTicketId)
    );

    const updatedTicket = await super.update({
      ...op,
      data: ticket,
      ref: { type: "Ticket", id: assignedTicketId }
    } as Operation);

    updatedTicket.relationships = {
      event: {
        data: {
          id: updatedTicket.attributes.eventId as string,
          type: "event"
        }
      },
      ticketType: {
        data: {
          id: updatedTicket.attributes.ticketTypeId as string,
          type: "ticketType"
        }
      },
      customer: {
        data: {
          id: updatedTicket.attributes.customerId as string,
          type: "customer"
        }
      }
    };

    delete updatedTicket.attributes.customerId;
    delete updatedTicket.attributes.eventId;
    delete updatedTicket.attributes.ticketTypeId;
    delete updatedTicket.attributes.purchaseId;

    return updatedTicket;
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

  private async getTicketPrice(ticketId: string): Promise<number> {
    const [{ ticketTypeId, eventId }] = await this.knex("Tickets")
      .select("ticketTypeId", "eventId")
      .where({
        id: ticketId
      })
      .limit(1);

    const [{ defaultPrice }] = await this.knex("TicketTypes")
      .select("defaultPrice")
      .where({
        id: ticketTypeId,
        eventId,
        canBePurchased: true
      })
      .limit(1);

    return Number(defaultPrice);
  }
}
