import { Resource } from "@joelalejandro/jsonapi-ts";

export default class PaymentMethod extends Resource {
  public static attributes: {
    name: string;
    paymentTypeId: string;
    thumbnail: string;
    binPattern: string;
  } = {
    name: "",
    paymentTypeId: "",
    thumbnail: "",
    binPattern: ""
  };
}
