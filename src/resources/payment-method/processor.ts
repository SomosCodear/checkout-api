import { Operation, OperationProcessor } from "@joelalejandro/jsonapi-ts";
import * as MercadoPago from "mercadopago";

import { MPPaymentMethod, MPResponse } from "../../types";
import PaymentMethod from "./resource";

export default class PaymentMethodProcessor extends OperationProcessor<
  PaymentMethod
> {
  public resourceClass = PaymentMethod;

  public async get(op: Operation): Promise<PaymentMethod[]> {
    const paymentMethods = ((await MercadoPago.get(
      "/v1/payment_methods"
    )) as MPResponse).body as MPPaymentMethod[];

    if (!op.ref.id) {
      return paymentMethods
        .filter(
          pm =>
            pm.status === "active" &&
            !process.env.MP_EXCLUDE_PAYMENT_METHODS.includes(pm.id)
        )
        .map(pm => ({
          id: pm.id,
          attributes: {
            name: pm.name,
            paymentTypeId: pm.payment_type_id,
            thumbnail: pm.secure_thumbnail
          },
          type: "paymentMethod",
          relationships: {}
        })) as PaymentMethod[];
    }

    return paymentMethods
      .filter(pm => pm.status === "active" && pm.id === op.ref.id)
      .map(pm => ({
        id: pm.id,
        attributes: {
          name: pm.name,
          paymentTypeId: pm.payment_type_id,
          thumbnail: pm.secure_thumbnail
        },
        type: "paymentMethod",
        relationships: {}
      })) as PaymentMethod[];
  }
}
