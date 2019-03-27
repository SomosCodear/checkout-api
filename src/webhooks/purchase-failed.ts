import { Application, Operation, Resource } from "@joelalejandro/jsonapi-ts";
import { Context } from "koa";
import bodyParser from "koa-bodyparser";
import CustomerProcessor from "../resources/customer/processor";
import PurchaseProcessor from "../resources/purchase/processor";
import TicketProcessor from "../resources/ticket/processor";

export default (application: Application) => {
  const noop = async () => {
    return;
  };

  const ticketProcessor = application.processorFor({
    ref: { type: "Ticket", id: "", lid: "", relationship: "" }
  } as Operation) as TicketProcessor;

  const customerProcessor = application.processorFor({
    ref: { type: "Customer", id: "", lid: "", relationship: "" }
  } as Operation) as CustomerProcessor;

  const purchaseProcessor = application.processorFor({
    ref: { type: "Purchase", id: "", lid: "", relationship: "" }
  } as Operation) as PurchaseProcessor;

  return async function purchaseFailedWebhook(
    ctx: Context,
    next: () => Promise<void>
  ) {
    if (!ctx.request.url.includes("/webhooks/purchase-failed")) {
      return next();
    }

    await bodyParser()(ctx, noop);

    const {
      external_reference // These are the ticket IDs
    } = ctx.request.query;
    const ticketIds = external_reference.split("|");

    await Promise.all(
      ticketIds.map(async ticketId => {
        const ticket = await ticketProcessor.getById(ticketId);

        await purchaseProcessor.removeById(
          ticket.relationships.purchase.data.id
        );
        await customerProcessor.removeById(
          ticket.relationships.customer.data.id
        );

        return Promise.resolve();
      })
    );

    await Promise.all(ticketIds.map(id => ticketProcessor.markForSale(id)));

    // TODO: Send e-mail here.
    // lambda.mail()

    ctx.redirect(`${process.env.WEBCONF_CONGRATS_FAILED}`);
  };
};
