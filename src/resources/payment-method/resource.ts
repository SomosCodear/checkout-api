import { Resource } from "@ebryn/jsonapi-ts";

export default class PaymentMethod extends Resource {
  public attributes: {
    paymentMethodTypeId: number;
    name: string;
    logo: string;
    expirationDateCheck: boolean;
    securityCodeLength: number;
    securityCodeCheck: boolean;
    cardNumberLengthMax: number;
    cardNumberLengthMin: number;
  };

  public relationships: {
    currency: {
      data: Array<{ id: string; type: "currency" }>;
    };
    bank: {
      data: Array<{ id: string; type: "bank" }>;
    };
  };
}
