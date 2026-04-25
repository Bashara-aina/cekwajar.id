// Type declarations for midtrans-client
// Official @types package is incomplete, so we declare what we need

declare module "midtrans-client" {
  export interface SnapConfig {
    isProduction?: boolean;
    serverKey?: string;
    clientKey?: string;
  }

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface ItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  export interface CustomerDetails {
    callback_url?: string;
  }

  export interface TransactionData {
    transaction_details: TransactionDetails;
    item_details?: ItemDetails[];
    customer_details?: CustomerDetails;
  }

  export class Snap {
    constructor(options?: SnapConfig);
    createTransaction(parameter: TransactionData): Promise<{ token: string; redirect_url: string }>;
    createTransactionToken(parameter: TransactionData): Promise<string>;
    createTransactionRedirectUrl(parameter: TransactionData): Promise<string>;
  }

  export interface MidtransStatic {
    Snap: typeof Snap;
  }

  const Midtrans: MidtransStatic;
  export default Midtrans;
}
