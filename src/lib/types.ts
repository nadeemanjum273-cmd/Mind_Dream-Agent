export interface PolicyChunk {
  id: string;
  title: string;
  section: string;
  content: string;
  wordCount: number;
  keywords: string[];
}

export interface OrderRecord {
  orderId: string;
  customerName: string;
  email: string;
  items: string;
  totalPrice: number;
  purchaseDate: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Returned' | 'Cancelled';
  shippingAddress: string;
}

export interface RefundRecord {
  orderId: string;
  customerName: string;
  email: string;
  productType: string;
  purchaseDate: string;
  returnWindowDays: number;
  daysElapsed: number;
  isEligible: boolean;
  reason: string;
}

export interface BankDetailRecord {
  refundId: string;
  orderId: string;
  customerName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  amount: number;
  timestamp: string;
  status: 'Pending' | 'Verified' | 'Processed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: {
    type: 'rag' | 'sheet_orders' | 'sheet_refund' | 'sheet_bank';
    title: string;
    details: string;
  }[];
  toolAction?: string;
}

export interface SheetsSyncStatus {
  isConfigured: boolean;
  mode: 'live_google_sheets' | 'simulated';
  sheetId?: string;
  portions: {
    ordersCount: number;
    refundsCount: number;
    bankDetailsCount: number;
  };
}
