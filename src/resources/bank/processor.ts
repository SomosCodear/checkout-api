import { Operation, OperationProcessor } from "@ebryn/jsonapi-ts";
import * as TodoPago from "todo-pago";

import Bank from "./resource";

export default class BankProcessor extends OperationProcessor<Bank> {
  public resourceClass = Bank;

  public async get(op: Operation): Promise<Bank[]> {
    return new Promise((resolve, reject) => {
      TodoPago.getPaymentMethods(
        {
          endpoint: "developers",
          Authorization: `TODOPAGO ${process.env.TP_API_KEY}`
        },
        process.env.TP_MERCHANT_ID as string,
        (result, err) => {
          if (err) {
            reject(err);
            return;
          }

          const paymentMethods = this.serializeGet(result);

          resolve(paymentMethods);
        }
      );
    });
  }

  private serializeGet(data: TodoPago.GetPaymentMethodsResponse): Bank[] {
    const originalBanksList = data.BanksCollection[0].Bank;

    return originalBanksList.map(bank => {
      const attributes = {
        name: bank.Name[0],
        logo: bank.Logo[0],
        code: bank.Code[0]
      };

      return {
        type: "bank",
        id: bank.Id[0],
        attributes
      } as Bank;
    });
  }
}
