import { Context } from "koa";

export = index;
declare function index(options?: {
  disabled?: boolean;
  trustProxy?: boolean;
  disallow?: (ctx: Context) => void;
}): any;
