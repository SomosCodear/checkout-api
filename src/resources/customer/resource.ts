import { Resource } from "@joelalejandro/jsonapi-ts";

export default class Customer extends Resource {
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
