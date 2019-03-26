import { Context } from "koa";
import * as bodyParser from "koa-bodyparser";
import * as MercadoPago from "mercadopago";

const noop = async () => {
  return;
};

export default () =>
  async function purchasePendingWebhook(
    ctx: Context,
    next: () => Promise<void>
  ) {
    if (!ctx.request.url.includes("/webhooks/purchase-pending")) {
      return next();
    }

    await bodyParser()(ctx, noop);

    const {
      preference_id,
      external_reference,
      merchant_order_id
    } = ctx.request.query;

    const order = await MercadoPago.merchant_orders.findById(merchant_order_id);

    ctx.body = {
      params: ctx.request.query,
      headers: ctx.request.headers,
      body: order
    };
  };
