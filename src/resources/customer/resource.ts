import { Resource } from "@joelalejandro/jsonapi-ts";

export default class Customer extends Resource {
  public static attributes: {
    fullName: string;
    emailAddress: string;
    identificationType: string;
    identificationNumber: string;
    dateRegistered: string;
  } = {
    fullName: "",
    emailAddress: "",
    identificationType: "",
    identificationNumber: "",
    dateRegistered: new Date().toJSON()
  };
}
