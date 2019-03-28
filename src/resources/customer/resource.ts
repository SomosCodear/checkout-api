import { Resource } from "@joelalejandro/jsonapi-ts";

export default class Customer extends Resource {
  static get type() {
    return "customer";
  }

  public static attributes: {
    fullName: string;
    emailAddress: string;
    identificationType: string;
    identificationNumber: string;
  } = {
    fullName: "",
    emailAddress: "",
    identificationType: "",
    identificationNumber: ""
  };
}
