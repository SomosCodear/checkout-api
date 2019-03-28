import { Resource } from "@joelalejandro/jsonapi-ts";

export default class Payment extends Resource {
  static get type() {
    return "payment";
  }

  public static attributes: {
    purchaseId: string;
    externalId: string;
    datePaid: string;
    paymentType: string;
    paymentMethod: string;
    issuer: string;
    installments: number;
    cardId: string;
    amountDue: number;
    amountPaid: number;
    interestFee: number;
    gatewayFee: number;
    status: string;
  } = {
    purchaseId: "",
    externalId: "",
    datePaid: "",
    paymentType: "",
    paymentMethod: "",
    issuer: "",
    installments: 0,
    cardId: "",
    amountDue: 0,
    amountPaid: 0,
    interestFee: 0,
    gatewayFee: 0,
    status: ""
  };
}
