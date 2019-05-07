import { Application, Operation } from "@joelalejandro/jsonapi-ts";
import { Context } from "koa";
import CustomerProcessor from "../resources/customer/processor";
import TicketProcessor from "../resources/ticket/processor";

export default function(application: Application) {
  const ticketProcessor = application.processorFor({
    ref: { type: "Ticket", id: "", lid: "", relationship: "" }
  } as Operation) as TicketProcessor;

  const customerProcessor = application.processorFor({
    ref: { type: "Customer", id: "", lid: "", relationship: "" }
  } as Operation) as CustomerProcessor;

  return async (ctx: Context, next: () => Promise<void>) => {
    if (!ctx.url.endsWith("stickers")) {
      return next();
    }

    const tickets = await ticketProcessor.getAllOwned();
    const customers = await customerProcessor.getAll();

    const nameStickers = tickets.map(ticket => {
      const customer = customers.find(
        c => c.id === ticket.attributes.customerId
      );
      return `<label class="customer">${customer.attributes.fullName}<br><br>${
        customer.attributes.identificationType
      } ${customer.attributes.identificationNumber}</label>`;
    });

    const qrStickers = tickets.map(ticket => {
      const customer = customers.find(
        c => c.id === ticket.attributes.customerId
      );

      return `<img src="https://checkout.webconf.tech/e-ticket?id=${
        ticket.id
      }&format=qr"><br>${customer.attributes.fullName}`;
    });

    ctx.body = `${nameStickers}${qrStickers}`;
  };
}
