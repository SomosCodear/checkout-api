import { Application, jsonApiKoa } from "@joelalejandro/jsonapi-ts";
import * as cors from "@koa/cors";
import * as Koa from "koa";
import { KoaLoggingMiddleware as logs } from "logepi";
import * as MercadoPago from "mercadopago";
import { resolve } from "path";

import Errors from "./errors";
import CardConfigurationProcessor from "./resources/card-configuration/processor";
import CardConfiguration from "./resources/card-configuration/resource";
import CustomerProcessor from "./resources/customer/processor";
import Customer from "./resources/customer/resource";
import PaymentMethodProcessor from "./resources/payment-method/processor";
import PaymentMethod from "./resources/payment-method/resource";
import PurchaseProcessor from "./resources/purchase/processor";
import Purchase from "./resources/purchase/resource";
import TicketProcessor from "./resources/ticket/processor";
import Ticket from "./resources/ticket/resource";

MercadoPago.configure({
  sandbox: Boolean(process.env.MP_SANDBOX),
  access_token: process.env.MP_ACCESS_TOKEN
});

const api = new Koa();
let connection = process.env.DATABASE_URL;

if (process.env.NODE_ENV !== "development") {
  // Enforce SSL for DB connections.
  connection += "?ssl=true";

  // Enforce SSL for HTTP requests.
  api.use(async (ctx: Koa.Context, next: () => Promise<void>) => {
    if (ctx.headers["x-forwarded-proto"] !== "https") {
      ctx.body = Errors.SSLRequired();
      return;
    }

    await next();
  });
}

const db = { client: "pg", connection };

const checkout = () =>
  jsonApiKoa(
    new Application({
      namespace: "api",
      types: [CardConfiguration, PaymentMethod, Purchase, Ticket, Customer],
      processors: [
        new CardConfigurationProcessor(),
        new PaymentMethodProcessor(),
        new PurchaseProcessor(db),
        new TicketProcessor(db),
        new CustomerProcessor(db)
      ]
    })
  );

api
  .use(cors())
  .use(checkout())
  .use(logs());

api.listen(process.env.PORT || 3000);
