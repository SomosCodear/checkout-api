import { Operation, OperationProcessor } from "@ebryn/jsonapi-ts";
import * as TodoPago from "todo-pago";

import PaymentMethod from "./resource";

export default class PaymentMethodProcessor extends OperationProcessor<
  PaymentMethod
> {
  public resourceClass = PaymentMethod;

  public async get(op: Operation): Promise<PaymentMethod[]> {
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

  private serializeGet(
    data: TodoPago.GetPaymentMethodsResponse
  ): PaymentMethod[] {
    const originalPaymentMethodsList =
      data.PaymentMethodsCollection[0].PaymentMethod;
    const originalBanksList = data.BanksCollection[0].Bank;
    const originalPaymentMethodsBankList =
      data.PaymentMethodBanksCollection[0].PaymentMethodBank;

    return originalPaymentMethodsList.map(paymentMethod => {
      const attributes = {
        name: paymentMethod.Name[0],
        cardNumberLengthMax: Number(paymentMethod.CardNumberLengthMax[0]),
        cardNumberLengthMin: Number(paymentMethod.CardNumberLengthMin[0]),
        expirationDateCheck: Boolean(paymentMethod.ExpirationDateCheck[0]),
        logo: paymentMethod.Logo[0],
        paymentMethodTypeId: Number(paymentMethod.IdTipoMedioPago[0]),
        securityCodeCheck: Boolean(paymentMethod.SecurityCodeCheck[0]),
        securityCodeLength: Number(paymentMethod.SecurityCodeLength[0])
      };

      const currency = {
        data: Array.isArray(paymentMethod.CurrenciesCollection[0].Currency)
          ? paymentMethod.CurrenciesCollection[0].Currency.map(currencyRel => ({
              id: currencyRel.Id[0],
              type: "currency"
            }))
          : []
      };

      const bank = {
        data: originalPaymentMethodsBankList
          .filter(
            relatedBank =>
              relatedBank.PaymentMethodId[0] === paymentMethod.Id[0]
          )
          .map(relatedBank => ({ id: relatedBank.BankId[0], type: "bank" }))
      };

      return {
        type: "paymentMethod",
        id: paymentMethod.Id[0],
        attributes,
        relationships: {
          currency,
          bank
        }
      } as PaymentMethod;
    });
  }
}
