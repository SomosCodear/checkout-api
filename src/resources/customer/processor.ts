import { KnexProcessor, Operation } from "@joelalejandro/jsonapi-ts";
import { v4 as uuid } from "uuid";
import {
  ALLOWED_EMAIL_FORMAT,
  ALLOWED_IDENTIFICATION_TYPES
} from "../../defaults";
import Errors from "../../errors";
import Customer from "./resource";

export default class CustomerProcessor extends KnexProcessor<Customer> {
  public resourceClass = Customer;

  public async add(op: Operation): Promise<Customer> {
    const customer = op.data;

    if (!customer.attributes.fullName) {
      throw Errors.DataRequired("fullName");
    }

    if (!customer.attributes.identificationType) {
      throw Errors.DataRequired("identificationType");
    }

    if (
      !ALLOWED_IDENTIFICATION_TYPES.includes(customer.attributes
        .identificationType as string)
    ) {
      throw Errors.InvalidData(
        "identificationType",
        ALLOWED_IDENTIFICATION_TYPES
      );
    }

    if (!customer.attributes.identificationNumber) {
      throw Errors.DataRequired("identificationNumber");
    }

    if (!customer.attributes.emailAddress) {
      throw Errors.DataRequired("emailAddress");
    }

    if (
      !ALLOWED_EMAIL_FORMAT.test(customer.attributes.emailAddress as string)
    ) {
      throw Errors.InvalidData("emailAddress", ["a valid email address"]);
    }

    customer.id = uuid();
    op.ref.id = customer.id;

    console.log({
      ...op,
      data: customer
    });

    return super.add({
      ...op,
      data: customer
    } as Operation);
  }
}
