import { Application, Operation, Resource } from "@joelalejandro/jsonapi-ts";
import FormData from "form-data";
import { readFileSync } from "fs";
import { Context } from "koa";
import bodyParser from "koa-bodyparser";
import MercadoPago from "mercadopago";
import { resolve as resolvePath } from "path";
import uuid = require("uuid");

import eTicket from "../middleware/e-ticket";
import CustomerProcessor from "../resources/customer/processor";
import PaymentProcessor from "../resources/payment/processor";
import PurchaseProcessor from "../resources/purchase/processor";
import TicketProcessor from "../resources/ticket/processor";
import Ticket from "../resources/ticket/resource";

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

  const paymentProcessor = application.processorFor({
    ref: { type: "Payment", id: "", lid: "", relationship: "" }
  } as Operation) as PaymentProcessor;

  const purchaseProcessor = application.processorFor({
    ref: { type: "Purchase", id: "", lid: "", relationship: "" }
  } as Operation) as PurchaseProcessor;

  return async function purchaseSuccessWebhook(
    ctx: Context,
    next: () => Promise<void>
  ) {
    if (!ctx.request.url.includes("/webhooks/purchase-success")) {
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
    const ticketIds = external_reference.split("|");
    const firstTicket = await ticketProcessor.getById(ticketIds[0]);
    const purchaseId = firstTicket.relationships.purchase.data.id as string;

    await paymentProcessor.addPayment({
      paymentLocalId,
      lastPayment,
      payment,
      order,
      purchaseId
    });

    await purchaseProcessor.markAsPaid(purchaseId);

    await Promise.all(
      ticketIds.map((id: string) => ticketProcessor.markAsOwned(id))
    );

    const allTickets = await Promise.all(
      ticketIds.map(async ticketId => ticketProcessor.getById(ticketId))
    );

    const ticketWithCustomers = await Promise.all(
      allTickets.map(async (ticket: Ticket) => ({
        ...ticket,
        relationships: {
          ...ticket.relationships,
          customer: {
            data: await customerProcessor.getById(
              ticket.relationships.customer.data.id
            )
          }
        }
      }))
    );

    await Promise.all(
      ticketWithCustomers.map(async ticket => {
        const emailPayload = new FormData();
        const {
          emailAddress,
          identificationNumber,
          identificationType,
          fullName
        } = ticket.relationships.customer.data.attributes;

        const ticketBuffer = (await eTicket(application)(
          {
            ...ctx,
            request: {
              ...ctx.request,
              query: { id: ticket.id, format: "ticket", internalCall: true }
            }
          },
          noop
        )) as Buffer;

        const iCalBuffer = (await eTicket(application)(
          {
            ...ctx,
            request: {
              ...ctx.request,
              query: {
                id: ticket.id,
                format: "ticket",
                internalCall: true
              }
            }
          },
          noop
        )) as Buffer;

        emailPayload.append(
          "subject",
          process.env.WEBCONF_CHECKOUT_SUCCESS_SUBJECT
        );
        emailPayload.append("specificAddress", emailAddress);
        emailPayload.append(
          "secret",
          process.env.WEBCONF_MAIL_SEND_LAMBDA_SECRET
        );
        emailPayload.append("templateName", "mail_checkout_success");
        emailPayload.append(
          "templateParameters",
          JSON.stringify({
            ticket_id: ticket.id,
            purchase_id: purchaseId,
            ticket_date: new Date()
              .toJSON()
              .substr(0, 23)
              .concat("-03:00"),
            ticket_owner_name: (fullName as string).toUpperCase(),
            ticket_owner_identification_type: identificationType,
            ticket_owner_identification_number: identificationNumber,
            checkout_url: "https://checkout.webconf.tech"
          })
        );
        emailPayload.append("ticketFile", ticketBuffer, {
          filename: `ticket-${ticket.id}.png`,
          contentType: "image/png",
          knownLength: ticketBuffer.length
        });
        emailPayload.append("icalFile", iCalBuffer, {
          filename: `ical-${ticket.id}.ics`,
          contentType: "text/calendar",
          knownLength: iCalBuffer.length
        });

        return new Promise((resolve, reject) => {
          emailPayload.submit(
            {
              host: process.env.WEBCONF_MAIL_SEND_LAMBDA_HOST,
              path: "/lambdas/mail_send",
              protocol: "https:"
            },
            (err, res) => {
              if (err) {
                reject(err);
              } else if (res.statusCode >= 400) {
                reject(`${res.statusCode} ${res.statusMessage}`);
              } else {
                resolve();
              }
            }
          );
        });
      })
    );

    ctx.redirect(`${process.env.WEBCONF_CONGRATS_SUCCESS}`);
  };
};
