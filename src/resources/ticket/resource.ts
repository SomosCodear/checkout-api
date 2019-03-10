import { Resource } from "@joelalejandro/jsonapi-ts";
import { TicketStatus } from "../../types";

export default class Ticket extends Resource {
  public static attributes: {
    status: TicketStatus;
  } = {
    status: "forSale"
  };

  public relationships: {
    customer: {
      data: { id: string; type: "customer" };
    };
  };
}
