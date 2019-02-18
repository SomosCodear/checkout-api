import { Operation, OperationProcessor } from "@ebryn/jsonapi-ts";

import Currency from "./resource";

export default class CurrencyProcessor extends OperationProcessor<Currency> {
  public resourceClass = Currency;

  public async get(op: Operation): Promise<Currency[]> {
    return [
      {
        id: "032",
        attributes: {
          name: "Peso Argentino"
        }
      },
      {
        id: "841",
        attributes: {
          name: "Dólar Estadounidense"
        }
      }
    ] as Currency[];
  }
}
