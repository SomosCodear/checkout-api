import {
  KnexProcessor,
  Operation,
  ResourceRelationship
} from "@joelalejandro/jsonapi-ts";
import Errors from "../../errors";
import Ticket from "./resource";

export default class TicketProcessor extends KnexProcessor<Ticket> {
  public resourceClass = Ticket;

  public async getById(id: string): Promise<Ticket> {
    const ticket = await this.knex("Tickets")
      .where({ id })
      .first();

    if (!ticket) {
      return {} as Ticket;
    }

    return Promise.resolve(this.asResource(ticket));
  }

  public async markAsOwned(id: string): Promise<Ticket> {
    const ticket = await this.knex("Tickets")
      .update({
        status: "owned"
      })
      .where({ id });

    return this.asResource(ticket);
  }

  public async get(op: Operation): Promise<Ticket[]> {
    return (await super.get(op)).map(this.asResource.bind(this));
  }

  public async markForSale(id: string): Promise<void> {
    await this.knex("Tickets")
      .update({
        status: "forSale",
        customerId: null
      })
      .where({ id });
  }

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

  private asResource(ticketObject): Ticket {
    const ticket = { ...ticketObject };

    delete ticket.id;

    const result = {
      id: ticketObject.id,
      type: "ticket",
      attributes: ticket.attributes ? ticket.attributes : ticket,
      relationships: {
        event: {
          data: {
            id: (ticket.attributes || ticket).eventId as string,
            type: "event"
          }
        },
        ticketType: {
          data: {
            id: (ticket.attributes || ticket).ticketTypeId as string,
            type: "ticketType"
          }
        },
        customer: {
          data: {
            id: (ticket.attributes || ticket).customerId as string,
            type: "customer"
          }
        },
        purchase: {
          data: {
            id: (ticket.attributes || ticket).purchaseId as string,
            type: "purchase"
          }
        }
      }
    };

    delete result.attributes.eventId;
    delete result.attributes.customerId;
    delete result.attributes.ticketTypeId;
    delete result.attributes.purchaseId;

    return result as Ticket;
  }
}
