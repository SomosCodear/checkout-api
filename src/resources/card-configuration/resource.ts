import { Resource } from "@joelalejandro/jsonapi-ts";
import { MPSecurityCodeCardLocation } from "../../types";

export default class CardConfiguration extends Resource {
  public static attributes: {
    allowsInstallments: boolean;
    cardNumberLength: number;
    cardType: "debit" | "credit" | "prepaid";
    icon: string;
    paymentMethodId: string;
    paymentMethodName: string;
    securityCodeLength: number;
    securityCodeCardLocation: MPSecurityCodeCardLocation;
    requiresCardNumberValidation: boolean;
    requiresCardholderIdentificationType: boolean;
    requiresCardholderIdentificationNumber: boolean;
    requiresCardholderName: boolean;
    requiresIssuerID: boolean;
    requiresSecurityCode: boolean;
  } = {
    allowsInstallments: false,
    cardNumberLength: 0,
    cardType: "credit",
    icon: "",
    paymentMethodId: "",
    paymentMethodName: "",
    securityCodeLength: 0,
    securityCodeCardLocation: "back",
    requiresCardNumberValidation: false,
    requiresCardholderIdentificationNumber: false,
    requiresCardholderIdentificationType: false,
    requiresCardholderName: false,
    requiresIssuerID: false,
    requiresSecurityCode: false
  };
}
