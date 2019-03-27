import { Application, Operation, Resource } from "@joelalejandro/jsonapi-ts";
import { Context } from "koa";
import bodyParser from "koa-bodyparser";
import MercadoPago from "mercadopago";
import uuid = require("uuid");
import PaymentProcessor from "../resources/payment/processor";
import TicketProcessor from "../resources/ticket/processor";

export default (application: Application) => {
  const noop = async () => {
    return;
  };

  const ticketProcessor = application.processorFor({
    ref: { type: "Ticket", id: "", lid: "", relationship: "" }
  } as Operation) as TicketProcessor;

  const paymentProcessor = application.processorFor({
    ref: { type: "Payment", id: "", lid: "", relationship: "" }
  } as Operation) as PaymentProcessor;

  return async function purchasePendingWebhook(
    ctx: Context,
    next: () => Promise<void>
  ) {
    if (!ctx.request.url.includes("/webhooks/purchase-pending")) {
      return next();
    }

    await bodyParser()(ctx, noop);

    const {
      external_reference, // These are the ticket IDs
      merchant_order_id
    } = ctx.request.query;
    const order = (await MercadoPago.merchant_orders.findById(
      merchant_order_id
    )).response;
    const [lastPayment] = order.payments.slice(-1);
    const payment = (await MercadoPago.payment.findById(lastPayment.id))
      .response;
    const paymentLocalId = uuid.v4();
    const [firstTicketId] = external_reference.split("|");
    const ticket = await ticketProcessor.getById(firstTicketId);

    await paymentProcessor.addPayment({
      paymentLocalId,
      lastPayment,
      payment,
      order,
      purchaseId: ticket.attributes.purchaseId
    });

    // TODO: Send e-mail here.
    // lambda.mail()

    ctx.redirect(`${process.env.WEBCONF_CONGRATS_PENDING}/${paymentLocalId}`);
  };
};
