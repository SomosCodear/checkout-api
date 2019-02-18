import { Resource } from "@ebryn/jsonapi-ts";

export default class Bank extends Resource {
  public attributes: {
    code: string;
    name: string;
    logo: string;
  };
}
