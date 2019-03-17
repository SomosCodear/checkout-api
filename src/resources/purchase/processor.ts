import {
  JsonApiParams,
  KnexProcessor,
  Operation,
  Resource,
  ResourceRelationship
} from "@joelalejandro/jsonapi-ts";

import * as MercadoPago from "mercadopago";
import Purchase from "./resource";

import { MPPayerData } from "../../types";

export default class PurchaseProcessor extends KnexProcessor<Purchase> {
  public resourceClass = Purchase;

  public async add(op: Operation) {
    const data = { ...op.data };

    // 1: Get all tickets to figure out quantity and total price.
    const { ticketCount, totalPrice, tickets } = await this.getTickets(data
      .relationships.ticket.data as ResourceRelationship[]);

    // 2: Create payer data from customer record.
    const payer = await this.getPayerData(data.relationships.customer
      .data as ResourceRelationship);

    // 3: Execute Mercado Pago payment.
    const payment = await this.postPayment({
      payer,
      ticketCount,
      totalPrice,
      paymentMethod: data.attributes.paymentMethod as string,
      cardToken: data.attributes.cardId as string
    });

    // 4: Create the Purchase itself.
    data.attributes = {
      ...op.data.attributes,
      dateCreated: new Date().toJSON(),
      status: payment.status === "approved" ? "paid" : "unpaid",
      amountBilled: totalPrice
    };

    const purchase = await super.add({ ...op, data });

    // 5: Store the Payment, related to the purchase.
    const checkoutPayment = await this.savePaymentResponse(purchase);

    // 6: Generate QR codes for each ticket.
    // TODO: HOW?

    // 7: Update the tickets with the new purchase ID, their new owner and the status
    // according to the payment operation result.
    await this.bindTicketsToPurchase(tickets, purchase);

    return {
      type: "purchase",
      id: purchase.id,
      attributes: {
        ...purchase.attributes,
        paymentID: checkoutPayment.id,
        paymentStatus: checkoutPayment.attributes.status
      },
      relationships: {}
    } as Purchase;
  }

  private async getTickets(
    tickets: ResourceRelationship[]
  ): Promise<{ ticketCount: number; totalPrice: number; tickets: Resource[] }> {
    const ticketCount: number = tickets.length;
    const ticketRecords = (await this.app.executeOperations(
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
    )).map(operationResponse => (operationResponse.data as Resource[])[0]);
    const totalPrice: number = ticketRecords
      .map(record => record.attributes.price as number)
      .reduce((priceSum: number, price: number) => priceSum + price, 0);

    return { ticketCount, totalPrice, tickets: ticketRecords };
  }

  private async getPayerData(
    customer: ResourceRelationship
  ): Promise<MPPayerData> {
    const [customerProcessorResponse] = await this.app.executeOperations([
      {
        op: "get",
        ref: customer
      } as Operation
    ]);
    const [customerResponse] = customerProcessorResponse.data as Resource[];
    const payer: MPPayerData = {
      email: customerResponse.attributes.emailAddress as string,
      identification: {
        type: customerResponse.attributes.identificationType as string,
        number: customerResponse.attributes.identificationNumber as string
      },
      first_name: customerResponse.attributes.firstName as string,
      last_name: customerResponse.attributes.lastName as string
    };

    return payer;
  }

  private async postPayment(data: {
    payer: MPPayerData;
    ticketCount: number;
    totalPrice: number;
    paymentMethod: string;
    cardToken?: string;
  }) {
    const payment: {
      id: string;
      status: string;
    } = (await MercadoPago.payment.create({
      payer: data.payer,
      binary_mode: false,
      description: `${data.ticketCount} x Entradas Córdoba WebConf 2019`,
      metadata: {},
      transaction_amount: data.totalPrice,
      payment_method_id: data.paymentMethod,
      ...(data.cardToken ? { card_token_id: data.cardToken } : {})
    })).response;

    return payment;
  }

  private calculateGatewayFee(totalPrice: number) {
    return (
      // Ticket prices
      totalPrice *
      // Mercado Pago fee (i.e. 5.99%)
      (Number(process.env.MP_GATEWAY_FEE) / 100) *
      // VAT (i.e. 21%)
      (1 + Number(process.env.VAT_RATE) / 100)
    );
  }

  private async savePaymentResponse(purchase: Resource) {
    const gatewayFee = this.calculateGatewayFee(purchase.attributes
      .amountDue as number);

    const checkoutPayment = {
      ...purchase.attributes,
      gatewayFee,
      datePaid: new Date().toJSON(),
      purchaseId: purchase.id
    };

    const [id] = await this.knex("Payments")
      .insert(checkoutPayment)
      .returning("id");

    return {
      id,
      type: "payment",
      attributes: {
        ...checkoutPayment
      },
      relationships: {}
    } as Resource;
  }

  private async bindTicketsToPurchase(
    tickets: Resource[],
    purchase: Resource
  ): Promise<void> {
    await this.app.executeOperations(
      tickets.map(
        ticket =>
          ({
            op: "update",
            data: {
              type: "ticket",
              id: ticket.id as string,
              attributes: {
                purchaseId: purchase.id as string
              },
              relationships: {}
            } as Resource,
            ref: {
              type: "ticket",
              id: ticket.id as string
            }
          } as Operation)
      )
    );
  }
}
