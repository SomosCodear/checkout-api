import { Application, jsonApiKoa } from "@joelalejandro/jsonapi-ts";
import cors from "@koa/cors";
import Koa from "koa";
import ssl from "koa-ssl";
import { KoaLoggingMiddleware as logs } from "logepi";
import MercadoPago from "mercadopago";

import Errors from "./errors";

import eTicket from "./middleware/e-ticket";
import CustomerProcessor from "./resources/customer/processor";
import Customer from "./resources/customer/resource";
import PaymentProcessor from "./resources/payment/processor";
import Payment from "./resources/payment/resource";
import PurchaseProcessor from "./resources/purchase/processor";
import Purchase from "./resources/purchase/resource";
import TicketProcessor from "./resources/ticket/processor";
import Ticket from "./resources/ticket/resource";
// import ipnWebhook from "./webhooks/ipn";
import BitmapFonts from "./utils/graphics/fonts";
import purchaseFailedWebhook from "./webhooks/purchase-failed";
import purchasePendingWebhook from "./webhooks/purchase-pending";
import purchaseSuccessWebhook from "./webhooks/purchase-success";
import HypeProcessor from "./resources/hype/processor";
import Hype from "./resources/hype/resource";

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
  types: [Purchase, Ticket, Customer, Payment, Hype],
  processors: [
    new PurchaseProcessor(db),
    new TicketProcessor(db),
    new CustomerProcessor(db),
    new PaymentProcessor(db),
    new HypeProcessor(db)
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
  // TODO: Enable this endpoint when ready.
  // .use(ipnWebhook())
  .use(eTicket(application))
  .use(purchaseSuccessWebhook(application))
  .use(purchasePendingWebhook(application))
  .use(purchaseFailedWebhook(application))
  .use(checkout())
  .use(logs());

api.listen(process.env.PORT || 3000, async () => BitmapFonts.load());
