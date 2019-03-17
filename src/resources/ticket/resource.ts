import { Resource } from "@joelalejandro/jsonapi-ts";
import { TicketStatus } from "../../types";

export default class Ticket extends Resource {
  public static attributes: {
    status: TicketStatus;
    ticketTypeId: string;
    price: number;
  } = {
    status: "forSale",
    ticketTypeId: "attendee",
    price: 0
  };

  public relationships: {
    customer: {
      data: { id: string; type: "customer" };
    };
  };
}
