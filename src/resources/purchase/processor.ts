import {
  JsonApiParams,
  KnexProcessor,
  Operation,
  Resource,
  ResourceRelationship
} from "@joelalejandro/jsonapi-ts";
import * as MercadoPago from "mercadopago";
import uuid = require("uuid");

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
    const customer = data.relationships.customer.data as ResourceRelationship;
    const payer = await this.getPayerData(customer);

    // 3: Execute Mercado Pago payment.
    const payment = await this.postPayment({
      payer,
      ticketCount,
      totalPrice,
      paymentMethod: data.attributes.paymentMethod as string,
      cardToken: data.attributes.cardId as string
    });

    // 4: Create the Purchase itself.
    data.id = uuid.v4();
    data.attributes = {
      dateCreated: new Date().toJSON(),
      status: payment.status === "approved" ? "paid" : "unpaid",
      amountBilled: totalPrice,
      customerId: customer.id
    };

    const [purchaseRecord] = await this.knex("Purchases")
      .insert({
        id: data.id,
        ...data.attributes
      })
      .returning(["id", "dateCreated", "status", "amountBilled", "customerId"]);

    const purchase = {
      id: purchaseRecord.id,
      type: "purchase",
      relationships: {},
      attributes: {
        dateCreated: purchaseRecord.dateCreated,
        status: purchaseRecord.status,
        amountBilled: purchaseRecord.amountBilled,
        customerId: purchaseRecord.customerId
      }
    };

    // 5: Store the Payment, related to the purchase.
    const checkoutPayment = await this.savePaymentResponse(purchase, payment);

    // 6: Generate QR codes for each ticket.
    // TODO: HOW?

    // 7: Update the tickets with the new purchase ID, their new owner and the status
    // according to the payment operation result.
    await this.bindTicketsToPurchase(tickets, purchase);

    return {
      ...purchase,
      relationships: {
        payment: {
          data: {
            id: checkoutPayment.id,
            type: checkoutPayment.type
          }
        }
      }
    } as Purchase;
  }

  private async getTickets(
    tickets: ResourceRelationship[]
  ): Promise<{ ticketCount: number; totalPrice: number; tickets: Resource[] }> {
    const ticketCount: number = tickets.length;
    const ticketRecords = await this.knex("Tickets")
      .select()
      .where("id", "in", tickets.map(ticket => ticket.id));

    const totalPrice: number = ticketRecords
      .map(record => Number(record.price))
      .reduce((priceSum: number, price: number) => priceSum + price, 0);

    return { ticketCount, totalPrice, tickets: ticketRecords };
  }

  private async getPayerData(
    customer: ResourceRelationship
  ): Promise<MPPayerData> {
    const [data] = await this.knex("Customers")
      .select()
      .where("id", customer.id);

    const payer: MPPayerData = {
      email: data.emailAddress as string,
      identification: {
        type: data.identificationType as string,
        number: data.identificationNumber as string
      },
      first_name: data.fullName.split(" ")[0] as string,
      last_name: data.fullName
        .split(" ")
        .slice(1)
        .join(" ") as string
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
      transaction_amount: Number(data.totalPrice),
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

  private async savePaymentResponse(purchase: Resource, payment: any) {
    const gatewayFee = this.calculateGatewayFee(purchase.attributes
      .amountBilled as number);

    const attributes = {
      externalId: payment.id,
      datePaid: new Date().toJSON(),
      purchaseId: purchase.id,
      paymentType: payment.payment_type_id,
      paymentMethod: payment.payment_method_id,
      issuer: payment.issuer_id,
      installments: payment.installments,
      cardId: payment.card_id,
      amountDue: purchase.attributes.amountBilled,
      amountPaid: 0,
      interestFee: 0,
      gatewayFee,
      status: payment.status
    };

    const [id] = await this.knex("Payments")
      .insert({
        id: uuid.v4(),
        ...attributes
      })
      .returning("id");

    const paymentResource = {
      id,
      type: "payment",
      attributes,
      relationships: {}
    };

    this.include([paymentResource]);

    return paymentResource as Resource;
  }

  private async bindTicketsToPurchase(
    tickets: Resource[],
    purchase: Resource
  ): Promise<void> {
    await this.knex("Tickets")
      .update({
        purchaseId: purchase.id,
        status: "owned"
      })
      .where("id", "in", tickets.map(ticket => ticket.id));
  }
}
