import { Resource } from "@joelalejandro/jsonapi-ts";

export default class Hype extends Resource {
  static get type() {
    return "hype";
  }

  public static attributes = {
    ticketsSold: 0,
    ticketsAvailable: 0
  };
}
