import { google } from 'googleapis';
import { OrderRecord, RefundRecord, BankDetailRecord, SheetsSyncStatus } from '../types';

// In-Memory store as reactive cache / fallback when Google Sheets API credentials are not set or during local sandbox testing
let localOrders: OrderRecord[] = [
  {
    orderId: 'ORD-9021',
    customerName: 'Alex Johnson',
    email: 'alex@example.com',
    items: 'DreamPad Pro Laptop 16-inch',
    totalPrice: 1299.99,
    purchaseDate: '2026-09-20',
    status: 'Delivered',
    shippingAddress: '742 Evergreen Terrace, Springfield, OR',
  },
  {
    orderId: 'ORD-8842',
    customerName: 'Sophia Martinez',
    email: 'sophia@example.com',
    items: 'Mind_Dreams Wireless Noise-Canceling Earbuds',
    totalPrice: 149.99,
    purchaseDate: '2026-09-02',
    status: 'Delivered',
    shippingAddress: '100 Main St, Austin, TX',
  },
  {
    orderId: 'ORD-7719',
    customerName: 'Marcus Vance',
    email: 'marcus@example.com',
    items: 'DreamStation Ergonomic Chair',
    totalPrice: 349.50,
    purchaseDate: '2026-08-15',
    status: 'Delivered',
    shippingAddress: '55 Ocean Ave, Miami, FL',
  },
];

let localRefundEligibility: RefundRecord[] = [
  {
    orderId: 'ORD-9021',
    customerName: 'Alex Johnson',
    email: 'alex@example.com',
    productType: 'Electronics (Laptop)',
    purchaseDate: '2026-09-20',
    returnWindowDays: 15,
    daysElapsed: 11,
    isEligible: true,
    reason: 'Within 15-day electronics window. Unopened packaging.',
  },
  {
    orderId: 'ORD-8842',
    customerName: 'Sophia Martinez',
    email: 'sophia@example.com',
    productType: 'Standard Item (Earbuds)',
    purchaseDate: '2026-09-02',
    returnWindowDays: 30,
    daysElapsed: 29,
    isEligible: true,
    reason: 'Within 30-day standard item return window.',
  },
  {
    orderId: 'ORD-7719',
    customerName: 'Marcus Vance',
    email: 'marcus@example.com',
    productType: 'Furniture (Ergonomic Chair)',
    purchaseDate: '2026-08-15',
    returnWindowDays: 30,
    daysElapsed: 47,
    isEligible: false,
    reason: 'Exceeded 30-day return window (47 days elapsed).',
  },
];

let localBankDetails: BankDetailRecord[] = [
  {
    refundId: 'REF-1001',
    orderId: 'ORD-9021',
    customerName: 'Alex Johnson',
    bankName: 'Chase Bank',
    accountNumber: '****5829',
    routingNumber: '122000031',
    accountHolderName: 'Alex Johnson',
    amount: 1299.99,
    timestamp: '2026-09-25 14:30:00',
    status: 'Verified',
  },
];

// Available catalog products for checking pricing and placing new orders
export const CATALOG_PRODUCTS = [
  { id: 'PROD-101', name: 'DreamPad Pro Laptop 16-inch', category: 'Electronics', price: 1299.99, stock: 15, description: 'High-performance laptop with 1-year warranty' },
  { id: 'PROD-102', name: 'Mind_Dreams Smart Phone Ultra / Samsung S25', category: 'Electronics', price: 899.00, stock: 24, description: 'Flagship smartphone with OLED display' },
  { id: 'PROD-103', name: 'Mind_Dreams Wireless Noise-Canceling Earbuds', category: 'Electronics', price: 149.99, stock: 50, description: 'Active noise cancelling wireless earbuds' },
  { id: 'PROD-104', name: 'DreamStation Ergonomic Chair', category: 'Furniture', price: 349.50, stock: 8, description: 'Mesh lumbar support office chair' },
  { id: 'PROD-105', name: 'DreamSleep Smart Pillow', category: 'Bedding', price: 79.99, stock: 40, description: 'Memory foam pillow with cooling gel' },
];

export function getGoogleSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    return null;
  }

  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return { sheets: google.sheets({ version: 'v4', auth }), sheetId };
}

export function checkSheetsConfig(): SheetsSyncStatus {
  const client = getGoogleSheetsClient();
  return {
    isConfigured: !!client,
    mode: client ? 'live_google_sheets' : 'simulated',
    sheetId: process.env.GOOGLE_SHEET_ID || undefined,
    portions: {
      ordersCount: localOrders.length,
      refundsCount: localRefundEligibility.length,
      bankDetailsCount: localBankDetails.length,
    },
  };
}

/**
 * Helper to resolve dynamic sheet titles (e.g. "Orders" vs "Product", "Refund Eligibility" vs "Refund", "Bank Details" vs "Bank details")
 */
async function getSheetTabNames(client: any, sheetId: string): Promise<{ ordersTab: string; refundTab: string; bankTab: string }> {
  try {
    const meta = await client.sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const titles: string[] = (meta.data.sheets || []).map((s: any) => s.properties?.title || '');
    
    const ordersTab = titles.find(t => t.toLowerCase().includes('product') || t.toLowerCase().includes('order')) || 'Orders';
    const refundTab = titles.find(t => t.toLowerCase().includes('refund')) || 'Refund Eligibility';
    const bankTab = titles.find(t => t.toLowerCase().includes('bank')) || 'Bank Details';

    return { ordersTab, refundTab, bankTab };
  } catch (err) {
    return { ordersTab: 'Orders', refundTab: 'Refund Eligibility', bankTab: 'Bank Details' };
  }
}

/**
 * Portion 1: "Orders / Products" — Read & Write
 */
export async function getOrdersFromSheet(): Promise<OrderRecord[]> {
  const client = getGoogleSheetsClient();
  if (!client) return localOrders;

  try {
    const tabs = await getSheetTabNames(client.sheets, client.sheetId);
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: `'${tabs.ordersTab}'!A2:H100`,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return localOrders;

    const fetched = rows.map((r: string[]) => ({
      orderId: r[0] || '',
      customerName: r[1] || '',
      email: r[2] || '',
      items: r[3] || '',
      totalPrice: parseFloat(r[4] || '0'),
      purchaseDate: r[5] || '',
      status: (r[6] as any) || 'Processing',
      shippingAddress: r[7] || '',
    }));

    localOrders = fetched;
    return fetched;
  } catch (err) {
    console.error('Error fetching Orders from Google Sheets, using reactive store:', err);
    return localOrders;
  }
}

export async function addOrderToSheet(order: Omit<OrderRecord, 'orderId' | 'purchaseDate' | 'status'>): Promise<OrderRecord> {
  const newOrder: OrderRecord = {
    orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: order.customerName,
    email: order.email,
    items: order.items,
    totalPrice: order.totalPrice,
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'Processing',
    shippingAddress: order.shippingAddress,
  };

  localOrders.unshift(newOrder);

  // Auto add to Refund Eligibility as well
  const isElectronics = newOrder.items.toLowerCase().includes('laptop') || 
                        newOrder.items.toLowerCase().includes('phone') || 
                        newOrder.items.toLowerCase().includes('tablet') || 
                        newOrder.items.toLowerCase().includes('earbuds') ||
                        newOrder.items.toLowerCase().includes('samsung');
  
  const refundEntry: RefundRecord = {
    orderId: newOrder.orderId,
    customerName: newOrder.customerName,
    email: newOrder.email,
    productType: isElectronics ? 'Electronics' : 'Standard Product',
    purchaseDate: newOrder.purchaseDate,
    returnWindowDays: isElectronics ? 15 : 30,
    daysElapsed: 0,
    isEligible: true,
    reason: `Newly placed order. Eligible within ${isElectronics ? 15 : 30} days.`,
  };
  localRefundEligibility.unshift(refundEntry);

  const client = getGoogleSheetsClient();
  if (client) {
    try {
      const tabs = await getSheetTabNames(client.sheets, client.sheetId);
      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: `'${tabs.ordersTab}'!A:H`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              newOrder.orderId,
              newOrder.customerName,
              newOrder.email,
              newOrder.items,
              newOrder.totalPrice,
              newOrder.purchaseDate,
              newOrder.status,
              newOrder.shippingAddress,
            ],
          ],
        },
      });

      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: `'${tabs.refundTab}'!A:I`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              refundEntry.orderId,
              refundEntry.customerName,
              refundEntry.email,
              refundEntry.productType,
              refundEntry.purchaseDate,
              refundEntry.returnWindowDays,
              refundEntry.daysElapsed,
              refundEntry.isEligible ? 'YES' : 'NO',
              refundEntry.reason,
            ],
          ],
        },
      });
    } catch (err) {
      console.error('Error writing order to Google Sheets:', err);
    }
  }

  return newOrder;
}

/**
 * Portion 2: "Refund Eligibility / Refund" — Read & Check
 */
export async function checkRefundEligibilityFromSheet(
  orderId: string,
  userEmail?: string
): Promise<{ record?: RefundRecord; isEligible: boolean; reason: string }> {
  const orders = await getOrdersFromSheet();
  const targetOrder = orders.find(
    o => o.orderId.toLowerCase() === orderId.toLowerCase() || (userEmail && o.email.toLowerCase() === userEmail.toLowerCase())
  );

  if (!targetOrder) {
    return {
      isEligible: false,
      reason: `Order ${orderId} was not found in our system. Please check your order ID.`,
    };
  }

  const purchase = new Date(targetOrder.purchaseDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - purchase.getTime());
  const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isElectronics = targetOrder.items.toLowerCase().includes('laptop') ||
                        targetOrder.items.toLowerCase().includes('phone') ||
                        targetOrder.items.toLowerCase().includes('tablet') ||
                        targetOrder.items.toLowerCase().includes('earbuds') ||
                        targetOrder.items.toLowerCase().includes('samsung');

  const maxWindow = isElectronics ? 15 : 30;
  const isEligible = daysElapsed <= maxWindow && targetOrder.status !== 'Returned' && targetOrder.status !== 'Cancelled';

  let reason = '';
  if (targetOrder.status === 'Returned') {
    reason = `Order ${targetOrder.orderId} has already been returned and refunded.`;
  } else if (daysElapsed > maxWindow) {
    reason = `Order ${targetOrder.orderId} was purchased ${daysElapsed} days ago. Policy allows max ${maxWindow} days for ${isElectronics ? 'electronics' : 'standard items'}.`;
  } else {
    reason = `Order ${targetOrder.orderId} is eligible for return/refund (${daysElapsed} days elapsed out of ${maxWindow} days allowed).`;
  }

  const record: RefundRecord = {
    orderId: targetOrder.orderId,
    customerName: targetOrder.customerName,
    email: targetOrder.email,
    productType: isElectronics ? 'Electronics' : 'Standard Item',
    purchaseDate: targetOrder.purchaseDate,
    returnWindowDays: maxWindow,
    daysElapsed,
    isEligible,
    reason,
  };

  const idx = localRefundEligibility.findIndex(r => r.orderId === targetOrder.orderId);
  if (idx >= 0) {
    localRefundEligibility[idx] = record;
  } else {
    localRefundEligibility.unshift(record);
  }

  return { record, isEligible, reason };
}

export async function getRefundEligibilityList(): Promise<RefundRecord[]> {
  const client = getGoogleSheetsClient();
  if (!client) return localRefundEligibility;

  try {
    const tabs = await getSheetTabNames(client.sheets, client.sheetId);
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: `'${tabs.refundTab}'!A2:I100`,
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) return localRefundEligibility;

    return rows.map((r: string[]) => ({
      orderId: r[0] || '',
      customerName: r[1] || '',
      email: r[2] || '',
      productType: r[3] || '',
      purchaseDate: r[4] || '',
      returnWindowDays: parseInt(r[5] || '30'),
      daysElapsed: parseInt(r[6] || '0'),
      isEligible: r[7] === 'YES' || r[7] === 'true',
      reason: r[8] || '',
    }));
  } catch (err) {
    console.error('Error fetching Refund Eligibility from Google Sheets:', err);
    return localRefundEligibility;
  }
}

/**
 * Portion 3: "Bank Details" — Read & Write
 */
export async function addBankDetailsToSheet(details: {
  orderId: string;
  customerName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  amount?: number;
}): Promise<BankDetailRecord> {
  const orders = await getOrdersFromSheet();
  const targetOrder = orders.find(o => o.orderId.toLowerCase() === details.orderId.toLowerCase());
  const refundAmount = details.amount || (targetOrder ? targetOrder.totalPrice : 1299.99);

  const record: BankDetailRecord = {
    refundId: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    orderId: details.orderId,
    customerName: details.customerName,
    bankName: details.bankName,
    accountNumber: details.accountNumber.length > 4 ? `****${details.accountNumber.slice(-4)}` : details.accountNumber,
    routingNumber: details.routingNumber,
    accountHolderName: details.accountHolderName,
    amount: refundAmount,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: 'Verified',
  };

  localBankDetails.unshift(record);

  if (targetOrder) {
    targetOrder.status = 'Returned';
  }

  const client = getGoogleSheetsClient();
  if (client) {
    try {
      const tabs = await getSheetTabNames(client.sheets, client.sheetId);
      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: `'${tabs.bankTab}'!A:J`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              record.refundId,
              record.orderId,
              record.customerName,
              record.bankName,
              record.accountNumber,
              record.routingNumber,
              record.accountHolderName,
              record.amount,
              record.timestamp,
              record.status,
            ],
          ],
        },
      });
    } catch (err) {
      console.error('Error appending Bank Details to Google Sheet:', err);
    }
  }

  return record;
}

export async function getBankDetailsFromSheet(): Promise<BankDetailRecord[]> {
  const client = getGoogleSheetsClient();
  if (!client) return localBankDetails;

  try {
    const tabs = await getSheetTabNames(client.sheets, client.sheetId);
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: `'${tabs.bankTab}'!A2:J100`,
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) return localBankDetails;

    return rows.map((r: string[]) => ({
      refundId: r[0] || '',
      orderId: r[1] || '',
      customerName: r[2] || '',
      bankName: r[3] || '',
      accountNumber: r[4] || '',
      routingNumber: r[5] || '',
      accountHolderName: r[6] || '',
      amount: parseFloat(r[7] || '0'),
      timestamp: r[8] || '',
      status: (r[9] as any) || 'Verified',
    }));
  } catch (err) {
    console.error('Error fetching Bank Details from Google Sheets:', err);
    return localBankDetails;
  }
}

/**
 * Automatic Sheet Seeder Helper
 */
export async function seedGoogleSheetHeaders(): Promise<{ success: boolean; message: string }> {
  const client = getGoogleSheetsClient();
  if (!client) {
    return { success: false, message: 'Google Sheets credentials not set.' };
  }

  try {
    const tabs = await getSheetTabNames(client.sheets, client.sheetId);

    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.sheetId,
      range: `'${tabs.ordersTab}'!A1:H1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Order ID', 'Customer Name', 'Email', 'Items', 'Total Price ($)', 'Purchase Date', 'Status', 'Shipping Address']],
      },
    });

    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.sheetId,
      range: `'${tabs.refundTab}'!A1:I1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Order ID', 'Customer Name', 'Email', 'Product Type', 'Purchase Date', 'Return Window (Days)', 'Days Elapsed', 'Eligible?', 'Reason / Details']],
      },
    });

    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.sheetId,
      range: `'${tabs.bankTab}'!A1:J1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Refund ID', 'Order ID', 'Customer Name', 'Bank Name', 'Account Number', 'Routing Number', 'Account Holder', 'Amount ($)', 'Timestamp', 'Status']],
      },
    });

    return { success: true, message: 'Successfully seeded Google Sheet headers!' };
  } catch (err: any) {
    return { success: false, message: `Failed to seed Google Sheet: ${err.message}` };
  }
}
