import { Application, jsonApiKoa } from "@joelalejandro/jsonapi-ts";
import * as cors from "@koa/cors";
import * as Koa from "koa";
import * as ssl from "koa-ssl";
import { KoaLoggingMiddleware as logs } from "logepi";
import * as MercadoPago from "mercadopago";

import Errors from "./errors";

import CustomerProcessor from "./resources/customer/processor";
import Customer from "./resources/customer/resource";
import PurchaseProcessor from "./resources/purchase/processor";
import Purchase from "./resources/purchase/resource";
import TicketProcessor from "./resources/ticket/processor";
import Ticket from "./resources/ticket/resource";
import ipnWebhook from "./webhooks/ipn";
import purchaseFailedWebhook from "./webhooks/purchase-failed";
import purchasePendingWebhook from "./webhooks/purchase-pending";
import purchaseSuccessWebhook from "./webhooks/purchase-success";
import Payment from "./resources/payment/resource";
import PaymentProcessor from "./resources/payment/processor";

MercadoPago.configure({
  client_id: process.env.MP_CLIENT_ID,
  client_secret: process.env.MP_CLIENT_SECRET
});

const api = new Koa();
let connection = process.env.DATABASE_URL;

if (process.env.NODE_ENV !== "development") {
  // Enforce SSL for DB connections.
  connection += "?ssl=true";
}

const db = { client: "pg", connection };

const application = new Application({
  namespace: "api",
  types: [Purchase, Ticket, Customer, Payment],
  processors: [
    new PurchaseProcessor(db),
    new TicketProcessor(db),
    new CustomerProcessor(db),
    new PaymentProcessor(db)
  ]
});

const checkout = () => jsonApiKoa(application);

api
  .use(cors())
  .use(
    ssl({
      trustProxy: true,
      disallow: ctx => {
        ctx.body = Errors.SSLRequired();
        ctx.status = 400;
      }
    })
  )
  .use(ipnWebhook())
  .use(purchaseSuccessWebhook(application))
  .use(purchasePendingWebhook(application))
  .use(purchaseFailedWebhook(application))
  .use(checkout())
  .use(logs());

api.listen(process.env.PORT || 3000);
