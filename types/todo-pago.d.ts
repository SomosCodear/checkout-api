declare module "todo-pago" {
  export type Context = {
    endpoint: "developers" | "production";
    Authorization: string;
  };

  export type ApiCallback<T = object> = (result: T, err: string) => void;

  export type GetAuthorizeAnswerParameters = {
    Security: string;
    Merchant: string;
    RequestKey: string;
    AnswerKey: string;
  };

  export type GetByRangeDateTimeParameters = {
    MERCHANT: string;
    STARTDATE: string;
    ENDDATE: string;
    PAGENUMBER: number;
  };

  export type ReturnRequestParameters = {
    Security: string;
    Merchant: string;
    RequestKey: string;
    Amount: number;
  };

  export type SendAuthorizeRequestParameters = {
    Session: string;
    Security: string;
    EncodingMethod: "XML";
    Merchant: number;
    URL_OK: string;
    URL_ERROR: string;
    MERCHANT: string;
    OPERATIONID: string;
    CURRENCYCODE: string;
    AMOUNT: string;
    MAXINSTALLMENTS: string;
    MININSTALLMENTS: string;
    TIMEOUT: string;
    AVAILABLEPAYMENTMETHODSIDS: string;
  };

  export type SendAuthorizeFraudControl = {
    CSBTCITY: string;
    CSSTCITY: string;
    CSBTCOUNTRY: string;
    CSSTCOUNTRY: string;
    CSBTEMAIL: string;
    CSSTEMAIL: string;
    CSBTFIRSTNAME: string;
    CSSTFIRSTNAME: string;
    CSBTLASTNAME: string;
    CSSTLASTNAME: string;
    CSBTPHONENUMBER: string;
    CSSTPHONENUMBER: string;
    CSBTPOSTALCODE: string;
    CSSTPOSTALCODE: string;
    CSBTSTATE: string;
    CSSTSTATE: string;
    CSBTSTREET1: string;
    CSSTSTREET1: string;
    CSBTCUSTOMERID: string;
    CSBTIPADDRESS: string;
    CSPTCURRENCY: string;
    CSPTGRANDTOTALAMOUNT: string;
    CSMDD7: "Y" | "";
    CSMDD8: "Y" | "";
    CSMDD9: "Y" | "";
    CSMDD10: "Y" | "";
    CSMDD11: "Y" | "";
    CSMDD12: "Y" | "";
    CSMDD13: "Y" | "";
    CSMDD14: "Y" | "";
    CSMDD15: "Y" | "";
    CSMDD16: "Y" | "";
    CSITPRODUCTCODE: string;
    CSITPRODUCTDESCRIPTION: string;
    CSITPRODUCTNAME: string;
    CSITPRODUCTSKU: string;
    CSITTOTALAMOUNT: string;
    CSITQUANTITY: string;
    CSITUNITPRICE: string;
  };

  export type VoidRequestParametres = {
    Security: string;
    Merchant: string;
    RequestKey: string;
  };

  export function discoverPaymentMethods(
    options: Context,
    callback: ApiCallback
  ): void;
  export function getAutorizeAnswer(
    options: Context,
    parameters: GetAuthorizeAnswerParameters,
    callback: ApiCallback
  ): void;
  export function getByRangeDateTime(
    options: Context,
    parameters: GetByRangeDateTimeParameters,
    callback: ApiCallback
  ): void;
  export function getCredentials(
    email: string,
    pass: string,
    options: Context,
    callback: ApiCallback
  ): void;
  export function getPaymentMethods(
    options: Context,
    merchant: string,
    callback: ApiCallback<GetPaymentMethodsResponse>
  ): void;
  export function getStatus(
    options: Context,
    merchant: string,
    operationId: string,
    callback: ApiCallback
  ): void;
  export function returnRequest(
    options: Context,
    parameters: ReturnRequestParameters,
    callback: ApiCallback
  ): void;
  export function sendAutorizeRequest(
    options: Context,
    parameters: SendAuthorizeRequestParameters,
    fraudControl: SendAuthorizeFraudControl,
    callback: ApiCallback
  ): void;
  export function voidRequest(
    options: Context,
    parameters: VoidRequestParametres,
    callback: ApiCallback
  ): void;

  export type GetPaymentMethodsResponse = {
    PaymentMethodsCollection: [
      {
        PaymentMethod: ({
          Id: [string];
          IdTipoMedioPago: [string];
          Name: [string];
          Logo: [string];
          ExpirationDateCheck: ["true" | "false"];
          SecurityCodeLength: [string];
          SecurityCodeCheck: ["true" | "false"];
          CardNumberLengthMax: [string];
          CardNumberLengthMin: [string];
          CurrenciesCollection: [
            {
              Currency: ({
                Id: [string];
                Name: [string];
              })[];
            }
          ];
        })[];
      }
    ];
    BanksCollection: [
      {
        Bank: ({
          Id: [string];
          Code: [string];
          Name: [string];
          Logo: [string];
        })[];
      }
    ];
    PaymentMethodBanksCollection: [
      {
        PaymentMethodBank: ({
          PaymentMethodId: [string];
          BankId: [string];
        })[];
      }
    ];
  };
}
