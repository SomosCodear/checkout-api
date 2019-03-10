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

    return super.add({ ...op, data: ticket });
  }
}
