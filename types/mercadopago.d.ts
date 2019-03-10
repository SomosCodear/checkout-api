export = mercadopago;
declare class mercadopago {
  static cancelPayment(id: any, ...args: any[]): any;
  static cancelPreapprovalPayment(id: any, ...args: any[]): any;
  static configure(options: any): void;
  static createPreapprovalPayment(preapproval: any, ...args: any[]): any;
  static createPreference(preferences: any, ...args: any[]): any;
  static get(uri: any, ...args: any[]): any;
  static getAccessToken(...args: any[]): any;
  static getAuthorizedPayment(id: any, ...args: any[]): any;
  static getPayment(id: any, ...args: any[]): any;
  static getPaymentInfo(id: any, ...args: any[]): any;
  static getPreapprovalPayment(id: any, ...args: any[]): any;
  static getPreference(id: any, ...args: any[]): any;
  static post(uri: any, ...args: any[]): any;
  static put(uri: any, ...args: any[]): any;
  static refundPayment(id: any, ...args: any[]): any;
  static sandboxMode(enabled: any): void;
  static searchPayment(
    filters: any,
    offset: any,
    limit: any,
    ...args: any[]
  ): any;
  static updatePreapprovalPayment(
    id: any,
    preapproval: any,
    ...args: any[]
  ): any;
  static updatePreference(id: any, preference: any, ...args: any[]): any;
  static utils: {
    DATE_TIME_PATTERN: RegExp;
    ISO_8601_PATTERN: RegExp;
    ONLY_DATE_PATTERN: RegExp;
    date: {
      from: Function;
      now: Function;
    };
  };
  static version: string;
  constructor(...args: any[]);
  cancelPayment(id: any, ...args: any[]): any;
  cancelPreapprovalPayment(id: any, ...args: any[]): any;
  configure(options: any): void;
  createPreapprovalPayment(preapproval: any, ...args: any[]): any;
  createPreference(preferences: any, ...args: any[]): any;
  get(uri: any, ...args: any[]): any;
  getAccessToken(...args: any[]): any;
  getAuthorizedPayment(id: any, ...args: any[]): any;
  getPayment(id: any, ...args: any[]): any;
  getPaymentInfo(id: any, ...args: any[]): any;
  getPreapprovalPayment(id: any, ...args: any[]): any;
  getPreference(id: any, ...args: any[]): any;
  post(uri: any, ...args: any[]): any;
  put(uri: any, ...args: any[]): any;
  refundPayment(id: any, ...args: any[]): any;
  sandboxMode(enabled: any): void;
  searchPayment(filters: any, offset: any, limit: any, ...args: any[]): any;
  updatePreapprovalPayment(id: any, preapproval: any, ...args: any[]): any;
  updatePreference(id: any, preference: any, ...args: any[]): any;
}
declare namespace mercadopago {
  namespace configurations {
    function areTestsRunnning(): any;
    const cache_max_size: number;
    class configure {
      constructor(configurations: any);
      sandbox: any;
      show_promise_error: any;
    }
    function getAccessToken(): any;
    function getBaseUrl(): any;
    function getClientId(): any;
    function getClientSecret(): any;
    function getRefreshToken(): any;
    function getUserAgent(): any;
    const sandbox: boolean;
    function setAccessToken(token: any): any;
    function setRefreshToken(token: any): any;
    const show_promise_error: boolean;
  }
  namespace connect {
    function get(...args: any[]): any;
    function getCredentials(
      clientSecret: any,
      authorizationCode: any,
      redirectURI: any,
      callback: any
    ): any;
    function getCredentialsAndConfigure(
      clientSecret: any,
      authorizationCode: any,
      redirectURI: any,
      callback: any
    ): any;
    function sendAuthorizationCode(
      clientId: any,
      redirectURI: any,
      callback: any
    ): any;
  }
  namespace customers {
    namespace cards {
      function all(...args: any[]): any;
      function create(...args: any[]): any;
      function findById(...args: any[]): any;
      function get(...args: any[]): any;
      function save(...args: any[]): any;
      function update(...args: any[]): any;
    }
    function create(...args: any[]): any;
    function findById(...args: any[]): any;
    function get(...args: any[]): any;
    function remove(...args: any[]): any;
    function save(...args: any[]): any;
    const schema: {
      additionalProperties: boolean;
      properties: {
        address: {
          properties: any;
          type: any;
        };
        addresses: {
          items: any;
          type: any;
        };
        cards: {
          properties: any;
          type: any;
        };
        date_registered: {
          pattern: any;
          type: any;
        };
        default_address: {
          type: any;
        };
        default_card: {
          type: any;
        };
        description: {
          type: any;
        };
        email: {
          format: any;
          type: any;
        };
        first_name: {
          type: any;
        };
        identification: {
          properties: any;
          type: any;
        };
        last_name: {
          type: any;
        };
        metadata: {
          type: any;
        };
        phone: {
          properties: any;
          type: any;
        };
      };
    };
    function search(...args: any[]): any;
    function update(...args: any[]): any;
  }
  namespace ipn {
    function authorized_payment(id: any, callback: any): any;
    const available_topics: string[];
    function getAuthorizedPayment(...args: any[]): any;
    function getPayment(...args: any[]): any;
    function manage(request: any, callback: any): any;
    function merchant_order(id: any, callback: any): any;
    function payment(id: any, callback: any): any;
    function preapproval(id: any, callback: any): any;
  }
  namespace merchant_orders {
    function create(...args: any[]): any;
    function findById(...args: any[]): any;
    function get(...args: any[]): any;
    function save(...args: any[]): any;
    const schema: {
      additionalProperties: boolean;
      properties: {
        additional_info: {
          maxLength: any;
          type: any;
        };
        application_id: {
          type: any;
        };
        cancelled: {
          type: any;
        };
        collector: {
          properties: any;
          type: any;
        };
        external_reference: {
          maxLength: any;
          type: any;
        };
        marketplace: {
          maxLength: any;
          type: any;
        };
        notification_url: {
          maxLength: any;
          type: any;
        };
        payer: {
          properties: any;
          type: any;
        };
        preference_id: {
          type: any;
        };
        shipments: {
          properties: any;
          type: any;
        };
        site_id: {
          type: any;
        };
        sponsor_id: {
          type: any;
        };
      };
    };
    function update(...args: any[]): any;
  }
  namespace money_requests {
    function create(...args: any[]): any;
    function findById(...args: any[]): any;
    function get(...args: any[]): any;
    function save(...args: any[]): any;
    const schema: {
      additionalProperties: boolean;
      properties: {
        amount: {
          type: any;
        };
        collector_id: {
          type: any;
        };
        concept_type: {
          enum: any;
        };
        currency_id: {
          enum: any;
        };
        description: {
          type: any;
        };
        id: {
          type: any;
        };
        init_point: {
          type: any;
        };
        payer_email: {
          format: any;
          type: any;
        };
        site_id: {
          enum: any;
        };
        status: {
          enum: any;
        };
      };
    };
  }
  namespace payment {
    function cancel(id: any, callback: any, ...args: any[]): any;
    function create(...args: any[]): any;
    function findById(...args: any[]): any;
    function get(...args: any[]): any;
    const idempotency: boolean;
    function oldSearch(...args: any[]): any;
    function refund(id: any, callback: any, ...args: any[]): any;
    function refundPartial(refund: any, callback: any): any;
    function save(...args: any[]): any;
    const schema: {
      additionalProperties: boolean;
      properties: {
        additional_info: {
          properties: any;
          type: any;
        };
        application_fee: {
          type: any;
        };
        binary_mode: {
          type: any;
        };
        callback_url: {
          type: any;
        };
        campaign_id: {
          type: any;
        };
        capture: {
          type: any;
        };
        coupon_amount: {
          type: any;
        };
        coupon_code: {
          type: any;
        };
        description: {
          type: any;
        };
        differential_pricing_id: {
          type: any;
        };
        external_reference: {
          type: any;
        };
        installments: {
          type: any;
        };
        issuer_id: {
          type: any;
        };
        metadata: {
          type: any;
        };
        notification_url: {
          type: any;
        };
        order: {
          properties: any;
          type: any;
        };
        payer: {
          properties: any;
          type: any;
        };
        payment_method_id: {
          type: any;
        };
        statement_descriptor: {
          type: any;
        };
        token: {
          type: any;
        };
        transaction_amount: {
          type: any;
        };
      };
    };
    function search(...args: any[]): any;
    function update(...args: any[]): any;
  }
  namespace preapproval {
    function cancel(id: any, callback: any, ...args: any[]): any;
    function create(...args: any[]): any;
    function findById(...args: any[]): any;
    function get(...args: any[]): any;
    function pause(id: any, callback: any, ...args: any[]): any;
    function save(...args: any[]): any;
    const schema: {
      additionalProperties: boolean;
      properties: {
        auto_recurring: {
          properties: any;
          type: any;
        };
        back_url: {
          maxLength: any;
          type: any;
        };
        external_reference: {
          maxLength: any;
          type: any;
        };
        reason: {
          maxLength: any;
          type: any;
        };
        status: {
          enum: any;
        };
      };
    };
    function search(...args: any[]): any;
    function update(...args: any[]): any;
  }
  namespace preferences {
    function create(...args: any[]): any;
    function findById(...args: any[]): any;
    function get(...args: any[]): any;
    function save(...args: any[]): any;
    const schema: {
      additionalProperties: boolean;
      properties: {
        additional_info: {
          maxLength: any;
          type: any;
        };
        auto_return: {
          enum: any;
        };
        back_urls: {
          properties: any;
          type: any;
        };
        client_id: {
          type: any;
        };
        collector_id: {
          type: any;
        };
        differential_pricing: {
          properties: any;
          type: any;
        };
        expiration_date_from: {
          pattern: any;
          type: any;
        };
        expiration_date_to: {
          pattern: any;
          type: any;
        };
        expires: {
          type: any;
        };
        external_reference: {
          maxLength: any;
          type: any;
        };
        items: {
          items: any;
          type: any;
        };
        marketplace: {
          maxLength: any;
          type: any;
        };
        marketplace_fee: {
          type: any;
        };
        mode: {
          enum: any;
        };
        notification_url: {
          maxLength: any;
          type: any;
        };
        payer: {
          properties: any;
          type: any;
        };
        payment_methods: {
          properties: any;
          type: any;
        };
        shipments: {
          properties: any;
          type: any;
        };
      };
    };
    function update(...args: any[]): any;
  }
}
