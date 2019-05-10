import { Resource } from "@joelalejandro/jsonapi-ts";
import { TicketStatus } from "../../types";

export default class Ticket extends Resource {
  static get type() {
    return "ticket";
  }

  public static attributes: {
    status: TicketStatus;
    ticketTypeId: string;
    price: number;
    purchaseId?: string;
    customerId?: string;
    eventId?: string;
    comments: string;
  } = {
    status: "forSale",
    ticketTypeId: "attendee",
    price: 0,
    purchaseId: "",
    customerId: "",
    eventId: "",
    comments: ""
  };

  public relationships: {
    customer: {
      data: { id: string; type: "customer" };
    };
    purchase?: {
      data: { id: string; type: "purchase" };
    };
    ticketType: {
      data: { id: string; type: "ticketType" };
    };
    event: {
      data: { id: string; type: "event" };
    };
  };
}
