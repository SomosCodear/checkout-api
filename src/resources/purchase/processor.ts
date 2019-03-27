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
    let purchase = { ...op.data };

    // 1: Get all tickets to figure out quantity and total price.
    const { totalPrice, tickets, quantitiesByType } = await this.getTickets(
      purchase.relationships.ticket.data as ResourceRelationship[]
    );

    // 2: Create preference.
    const preference = await this.postPreference({ tickets, quantitiesByType });

    // 3: Create the purchase.
    purchase.attributes = {
      dateCreated: new Date().toJSON(),
      status: "unpaid",
      amountBilled: totalPrice,
      externalId: preference.id
    };

    purchase = await super.add({ ...op, data: purchase });

    // 4: Mark the tickets as booked.
    await this.bindTicketsToPurchase(tickets, purchase);

    return purchase;
  }

  public async removeById(id: string): Promise<void> {
    await this.knex("Purchases")
      .where({ id })
      .delete();
  }

  public async getById(id: string): Promise<Purchase> {
    const purchase = await this.knex("Purchases")
      .where({ id })
      .first();

    return Promise.resolve(this.asResource(purchase));
  }

  public async markAsPaid(id: string): Promise<void> {
    await this.knex("Purchases")
      .where({ id })
      .update({
        status: "paid"
      });
  }

  private async getTickets(
    tickets: ResourceRelationship[]
  ): Promise<{
    totalPrice: number;
    tickets: Resource[];
    quantitiesByType: { [key: string]: number };
  }> {
    const ticketRecords = await this.knex("Tickets")
      .select()
      .where("id", "in", tickets.map(ticket => ticket.id));

    const totalPrice: number = ticketRecords
      .map(record => Number(record.price))
      .reduce((priceSum: number, price: number) => priceSum + price, 0);

    const quantitiesByType = ticketRecords
      .map(record => record.ticketTypeId)
      .reduce(
        (accumulator, type) => ({ [type]: (accumulator[type] || 0) + 1 }),
        {}
      );

    return {
      totalPrice,
      tickets: ticketRecords,
      quantitiesByType
    };
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
        type: (data.identificationType as string) || "DNI",
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

  private async postPreference({
    tickets,
    quantitiesByType
  }: {
    tickets: any[];
    quantitiesByType: { [key: string]: number };
  }) {
    const TOMORROW = Date.now() + 60 * 60 * 60 * 24 * 1000;
    const preferenceConfiguration = {
      items: tickets.map(ticket => ({
        id: "WEBCONF-TICKET",
        title: "Entradas WebConf 2019",
        quantity: quantitiesByType[ticket.ticketTypeId as string],
        currency_id: "ARS",
        unit_price: Number(ticket.price),
        picture_url:
          "https://mla-s2-p.mlstatic.com/752385-MLA29687494966_032019-N.jpg",
        category_id: "tickets"
      })),
      payment_methods: {
        excluded_payment_types: (process.env.MP_EXCLUDED_PAYMENT_TYPES || "")
          .split(",")
          .map(paymentType => ({ id: paymentType }))
      },
      back_urls: {
        success: "https://checkout.webconf.tech/webhooks/purchase-success",
        failure: "https://checkout.webconf.tech/webhooks/purchase-failure",
        pending: "https://checkout.webconf.tech/webhooks/purchase-pending"
      },
      auto_return: "approved",
      // TODO: Enable this feature when the IPN webhook is working.
      // notification_url: "https://checkout.webconf.tech/webhooks/ipn",
      external_reference: tickets.map(ticket => ticket.id).join("|"),
      expires: true,
      expiration_date_from: new Date()
        .toJSON()
        .substr(0, 23)
        .concat("-03:00"),
      expiration_date_to: new Date(TOMORROW)
        .toJSON()
        .substr(0, 23)
        .concat("-03:00")
    };

    const preference = (await MercadoPago.preferences.create(
      preferenceConfiguration
    )).response;

    return preference;
  }

  private async bindTicketsToPurchase(
    tickets: Resource[],
    purchase: Resource
  ): Promise<void> {
    await this.knex("Tickets")
      .update({
        purchaseId: purchase.id,
        status: "booked"
      })
      .where("id", "in", tickets.map(ticket => ticket.id));
  }

  private asResource(purchaseObject): Purchase {
    const purchase = { ...purchaseObject };

    delete purchase.id;

    const result = {
      id: purchaseObject.id,
      type: "purchase",
      attributes: purchase.attributes ? purchase.attributes : purchase,
      relationships: {}
    };

    return result as Purchase;
  }
}
