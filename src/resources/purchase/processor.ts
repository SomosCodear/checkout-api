import {
  JsonApiParams,
  KnexProcessor,
  Operation,
  Resource,
  ResourceRelationship
} from "@joelalejandro/jsonapi-ts";
import { randomBytes } from "crypto";

import * as MercadoPago from "mercadopago";
import Purchase from "./resource";

export default class PurchaseProcessor extends KnexProcessor<Purchase> {
  public resourceClass = Purchase;

  public async add(op: Operation) {
    const { data } = op;

    // 1. Get all tickets to figure out quantity and total price.
    const tickets = data.relationships.ticket.data as ResourceRelationship[];
    const ticketCount = tickets.length;
    const totalPrice = (await this.app.executeOperations(
      tickets.map(
        ticket =>
          ({
            op: "get",
            ref: ticket,
            params: {
              fields: {
                ticket: ["price"]
              }
            } as JsonApiParams
          } as Operation)
      )
    ))
      .map(
        operationResponse =>
          (operationResponse.data as Resource[])[0].attributes.price
      )
      .reduce((priceSum: number, price: number) => priceSum + price, 0);

    // 2: Create payer data.
    const payer = {
      email: data.attributes.payerEmail,
      identification: {
        type: data.attributes.payerIdentificationType,
        number: data.attributes.payerIdentificationNumber
      },
      first_name: data.attributes.payerFirstName,
      last_name: data.attributes.payerLastName
    };

    // 3: Execute Mercado Pago payment.
    const payment: {
      id: string;
      status: string;
    } = (await MercadoPago.payment.create({
      payer,
      binary_mode: false,
      description: `${ticketCount} x Entradas Córdoba WebConf 2019`,
      metadata: {},
      transaction_amount: totalPrice,
      payment_method_id: data.attributes.paymentMethod,
      card_token_id: data.attributes
    })).response;

    // 4: Create the Purchase itself.
    data.attributes = {
      ...op.data.attributes,
      dateCreated: new Date().toJSON(),
      status: payment.status === "approved" ? "paid" : "unpaid",
      amountBilled: totalPrice
    };

    const purchase = await super.add({ ...op, data });

    // 5: Store the Payment, related to the purchase.
    const checkoutPayment = {
      datePaid: new Date().toJSON(),
      paymentType: data.attributes.paymentType,
      paymentMethod: data.attributes.paymentMethod,
      issuer: data.attributes.issuer,
      installments: data.attributes.installments,
      cardId: data.attributes.cardId,
      amountDue: totalPrice,
      amountPaid: totalPrice, // not really
      interestFee: 0, // also, not really
      gatewayFee: 0, // also, very much not really
      status: payment.status
    };

    console.log(checkoutPayment);

    // 6: Generate QR codes for each ticket.
    // TODO: HOW?

    // 7: Update the tickets with the new purchase ID, their new owner and the status
    // according to the payment operation result.

    // STAP: Hold your horses.

    return {
      id: randomBytes(10).toString("hex"),
      attributes: {
        ...op.data.attributes,
        paymentID: payment.id,
        paymentStatus: payment.status
      },
      type: "purchase",
      relationships: {}
    } as Purchase;
  }
}
