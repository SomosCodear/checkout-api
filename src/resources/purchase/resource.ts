import { Resource } from "@joelalejandro/jsonapi-ts";

export default class Purchase extends Resource {
  static get type() {
    return "purchase";
  }

  public static attributes: {
    dateCreated?: string;
    status?: string;
    externalId: string;
  } = {
    dateCreated: new Date().toJSON(),
    status: "unpaid",
    externalId: ""
  };
}
