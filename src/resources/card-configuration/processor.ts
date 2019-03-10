import { Operation, OperationProcessor } from "@joelalejandro/jsonapi-ts";
import * as MercadoPago from "mercadopago";

import { MPPaymentMethod, MPResponse } from "../../types";
import CardConfiguration from "./resource";

export default class CardConfigurationProcessor extends OperationProcessor<
  CardConfiguration
> {
  public resourceClass = CardConfiguration;

  public async get(op: Operation): Promise<CardConfiguration[]> {
    const paymentMethods = ((await MercadoPago.get(
      "/v1/payment_methods"
    )) as MPResponse).body as MPPaymentMethod[];

    // Exclude cash-only payment methods.
    const cards = paymentMethods.filter(
      pm =>
        pm.status === "active" &&
        (pm.payment_type_id === "credit_card" ||
          pm.payment_type_id === "debit_card" ||
          pm.payment_type_id === "prepaid_card")
    );

    const { bin } = op.params.filter;

    if (!bin) {
      return;
    }

    return cards
      // Force all settings to [], because the MP API mixes
      // single objects and arrays under the same key :/
      .map(card => ({
        ...card,
        settings: Array.isArray(card.settings) ? card.settings : [card.settings]
      }))
      // Exclude any card configuration from BIN numbers
      // that aren't accepted by Mercado Pago.
      .map(card => ({
        ...card,
        settings: card.settings.find(
          setting =>
            new RegExp(setting.bin.pattern).test(bin) &&
            !new RegExp(setting.bin.exclusion_pattern).test(bin)
        )
      }))
      // Exclude any card configuration without settings.
      .filter(card => card.settings)
      // Build CardConfiguration object.
      .map((card, index) => ({
        id: `${card.payment_type_id}_${card.id}_${index}`,
        type: "cardConfiguration",
        attributes: {
          allowsInstallments: new RegExp(
            card.settings.bin.installments_pattern
          ).test(bin),
          cardNumberLength: Number(card.settings.card_number.length),
          cardType: card.payment_type_id.replace(/_card/g, ""),
          icon: card.secure_thumbnail,
          paymentMethodId: card.id,
          paymentMethodName: card.name,
          securityCodeCardLocation: card.settings.security_code.card_location,
          securityCodeLength: card.settings.security_code.length,
          requiresCardNumberValidation:
            card.settings.card_number.validation === "standard",
          requiresCardholderIdentificationNumber: (
            card.settings.additional_info_needed || []
          ).includes("cardholder_identification_number"),
          requiresCardholderIdentificationType: (
            card.settings.additional_info_needed || []
          ).includes("cardholder_identification_type"),
          requiresCardholderName: (
            card.settings.additional_info_needed || []
          ).includes("cardholder_name"),
          requiresIssuerID: (
            card.settings.additional_info_needed || []
          ).includes("issuer_id"),
          requiresSecurityCode: card.settings.security_code.mode === "mandatory"
        },
        relationships: {}
      })) as CardConfiguration[];
  }
}
