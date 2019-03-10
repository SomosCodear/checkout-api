import { Resource } from "@joelalejandro/jsonapi-ts";

export default class Purchase extends Resource {
  public static attributes: {
    dateCreated?: string;
    customerId: string;
    paymentType: string;
    paymentMethod: string;
    issuer?: string;
    installments?: number;
    cardId?: string;
    amountBilled?: number;
    status?: string;
  } = {
    dateCreated: new Date().toJSON(),
    customerId: "",
    paymentType: "",
    paymentMethod: "",
    amountBilled: 0,
    status: "unpaid"
  };
}
