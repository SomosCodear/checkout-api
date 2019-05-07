import {
  JsonApiErrors,
  KnexProcessor,
  Operation
} from "@joelalejandro/jsonapi-ts";
import {
  ALLOWED_EMAIL_FORMAT,
  ALLOWED_IDENTIFICATION_TYPES
} from "../../defaults";
import Errors from "../../errors";
import Customer from "./resource";

export default class CustomerProcessor extends KnexProcessor<Customer> {
  public resourceClass = Customer;

  public async removeById(id: string): Promise<void> {
    await this.knex("Customers")
      .where({ id })
      .delete();
  }

  public async getById(id: string): Promise<Customer> {
    const customer = await this.knex("Customers")
      .where({ id })
      .first();

    return Promise.resolve(this.asResource(customer));
  }

  public async getAll(): Promise<Customer[]> {
    return (await super.get({
      op: "get",
      ref: { type: "Customer", id: "", lid: "", relationship: "" }
    } as Operation)).map(this.asResource.bind(this));
  }

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

    return super.add({
      ...op,
      data: customer
    } as Operation);
  }

  public async delete() {
    throw JsonApiErrors.AccessDenied();
  }

  private asResource(customerObject): Customer {
    const customer = { ...customerObject };

    delete customer.id;

    const result = {
      id: customerObject.id,
      type: "customer",
      attributes: customer.attributes ? customer.attributes : customer,
      relationships: {}
    };

    return result as Customer;
  }
}
