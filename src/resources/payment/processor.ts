import {
  JsonApiErrors,
  KnexProcessor,
  Operation
} from "@joelalejandro/jsonapi-ts";
import Payment from "./resource";

const calculateGatewayFee = (totalPrice: number) =>
  // Ticket prices
  totalPrice *
  // Mercado Pago fee (i.e. 5.99%)
  (Number(process.env.MP_GATEWAY_FEE) / 100) *
  // VAT (i.e. 21%)
  (1 + Number(process.env.VAT_RATE) / 100);

export default class PaymentProcessor extends KnexProcessor<Payment> {
  public resourceClass = Payment;

  public async addPayment({
    paymentLocalId,
    lastPayment,
    payment,
    purchaseId,
    order
  }): Promise<Payment> {
    return super.add({
      op: "add",
      ref: {
        type: "Payment",
        id: paymentLocalId,
        lid: "",
        relationship: ""
      },
      data: {
        type: "payment",
        id: paymentLocalId,
        attributes: {
          purchaseId,
          externalId: lastPayment.id,
          datePaid: lastPayment.date_approved,
          paymentType: payment.payment_type_id,
          paymentMethod: payment.payment_method_id,
          issuer: payment.issuer_id,
          installments: payment.installments,
          cardId: payment.card.id,
          amountDue: Number(order.total_amount),
          amountPaid: Number(order.paid_amount),
          interestFee: (
            payment.fee_details.find(
              (fee: { type: string }) => fee.type === "financing_fee"
            ) || {}
          ).financing_fee,
          gatewayFee: calculateGatewayFee(Number(order.total_amount)),
          status: payment.status
        },
        relationships: {}
      },
      included: [],
      links: {},
      meta: {},
      params: {}
    } as Operation);
  }

  public async update(): Promise<Payment> {
    throw JsonApiErrors.AccessDenied();
  }

  public async delete() {
    throw JsonApiErrors.AccessDenied();
  }
}
