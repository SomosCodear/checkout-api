import { Context } from "koa";
import * as bodyParser from "koa-bodyparser";

const noop = async () => {
  return;
};

export default () =>
  async function ipnWebHook(ctx: Context, next: () => Promise<void>) {
    if (
      !ctx.request.url.includes("/ipn/success") ||
      !ctx.request.url.includes("/ipn/pending")
    ) {
      return next();
    }

    await bodyParser()(ctx, noop);

    ctx.body = {
      params: ctx.request.query,
      headers: ctx.request.headers,
      body: ctx.request.body
    };
  };
