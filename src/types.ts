export type MPResponse = {
  body: any;
  status: number;
  idempotency: string;
  pagination: any;
  next: () => void;
  hasNext: () => boolean;
  prev: () => void;
  hasPrev: () => boolean;
};

export type MPPaymentType =
  | "ticket"
  | "atm"
  | "credit_card"
  | "debit_card"
  | "prepaid_card";

export type MPPaymentTypeStatus = "active" | "deactive" | "temporally_deactive";

export type MPDeferredCaptureSupport =
  | "supported"
  | "unsupported"
  | "does_not_apply";

export type MPCardValidationType = "standard" | "none";

export type MPSecurityCodeMode = "mandatory" | "optional";

export type MPSecurityCodeCardLocation = "back" | "front";

export type MPAdditionalInfoNeededField =
  | "cardholder_identification_number"
  | "cardholder_identification_type"
  | "cardholder_name"
  | "issuer_id";

export type MPFinancialInstitution = {
  id: number;
  description: string;
};

export type MPPaymentMethodSettings = {
  bin: {
    pattern: string;
    exclusion_pattern: string;
    installments_pattern: string;
  };
  card_number: {
    length: string;
    validation: MPCardValidationType;
  };
  security_code: {
    mode: MPSecurityCodeMode;
    length: number;
    card_location: MPSecurityCodeCardLocation;
  };
  additional_info_needed: MPAdditionalInfoNeededField[];
  min_allowed_amount: number;
  max_allowed_amount: number;
  accreditation_time: number;
  financial_institutions: MPFinancialInstitution[];
};

export type MPPaymentMethod = {
  id: string;
  name: string;
  payment_type_id: MPPaymentType;
  status: MPPaymentTypeStatus;
  secure_thumbnail: string;
  thumbnail: string;
  deferred_capture: MPDeferredCaptureSupport;
  settings: MPPaymentMethodSettings | MPPaymentMethodSettings[];
};

export type TicketType = "attendee" | "sponsored" | "speaker" | "staff";

export type TicketStatus = "forSale" | "booked" | "owned" | "blocked";
