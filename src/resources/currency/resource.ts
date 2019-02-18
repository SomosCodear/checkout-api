import { Resource } from "@ebryn/jsonapi-ts";

export default class Currency extends Resource {
  public attributes: {
    name: string;
  };
}
