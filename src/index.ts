import { Application, jsonApiKoa } from "@ebryn/jsonapi-ts";
import * as cors from "@koa/cors";
import * as Koa from "koa";

import BankProcessor from "./resources/bank/processor";
import Bank from "./resources/bank/resource";
import CurrencyProcessor from "./resources/currency/processor";
import Currency from "./resources/currency/resource";
import PaymentMethodProcessor from "./resources/payment-method/processor";
import PaymentMethod from "./resources/payment-method/resource";

const api = new Koa();

api.use(cors()).use(
  jsonApiKoa(
    new Application({
      namespace: "api",
      types: [Bank, Currency, PaymentMethod],
      processors: [
        new BankProcessor(),
        new CurrencyProcessor(),
        new PaymentMethodProcessor()
      ]
    })
  )
);

api.listen(3000);
