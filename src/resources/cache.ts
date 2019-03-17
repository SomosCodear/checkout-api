import { CacheStore } from "../utils/cache";

let cache: CacheStore;

export const CacheKeys = {
  MERCADOPAGO_PAYMENT_METHODS: "mercadopago/payment_methods",
  MERCADOPAGO_CARD_CONFIGURATION: "mercadopago/card_configuration"
};

export default class Cache {
  public static initialize() {
    cache = new CacheStore();
  }

  public static getInstance() {
    return cache;
  }
}
