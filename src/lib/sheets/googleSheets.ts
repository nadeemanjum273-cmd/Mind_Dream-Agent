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
  {
    orderId: 'ORD-6520',
    customerName: 'Nadeem Anjum',
    email: 'nadeem@example.com',
    items: 'Dell XPS 15 OLED Touch Laptop',
    totalPrice: 1499.99,
    purchaseDate: '2026-09-25',
    status: 'Delivered',
    shippingAddress: '124 Tech Park, Austin, TX',
  }
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
    status: 'Pending',
    reason: 'Within 15-day electronics return window. Eligible for return.',
  },
  {
    orderId: 'ORD-6520',
    customerName: 'Nadeem Anjum',
    email: 'nadeem@example.com',
    productType: 'Electronics (Dell Laptop)',
    purchaseDate: '2026-09-25',
    returnWindowDays: 15,
    daysElapsed: 6,
    isEligible: true,
    status: 'Pending',
    reason: 'Purchased 6 days ago. Well within 15-day electronics window.',
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
    status: 'Pending',
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
    status: 'Rejected',
    reason: 'Exceeded 30-day return window (47 days elapsed).',
  },
];

let localBankDetails: BankDetailRecord[] = [
  {
    refundId: 'REF-1001',
    orderId: 'ORD-9021',
    customerName: 'Alex Johnson',
    mobile: '+1-555-234-8890',
    bankName: 'Chase Bank',
    accountNumber: '****5829',
    routingNumber: '122000031',
    accountHolderName: 'Alex Johnson',
    amount: 1299.99,
    timestamp: '2026-09-25 14:30:00',
    status: 'Return Approved',
  },
];

// Rich Product Catalog with popular brands (Dell, Apple, HP, Samsung, Mind_Dreams)
export const CATALOG_PRODUCTS = [
  {
    id: 'PROD-DELL-1',
    name: 'Dell XPS 15 OLED Touch Laptop (Core i9, 32GB RAM, 1TB SSD)',
    brand: 'Dell',
    category: 'Electronics',
    price: 1499.99,
    stock: 12,
    description: 'Ultra-thin Dell premium laptop with 3.5K OLED touchscreen display, 1-year warranty',
  },
  {
    id: 'PROD-DELL-2',
    name: 'Dell Inspiron 16 FHD+ Laptop (Intel Core 7, 16GB RAM, 512GB SSD)',
    brand: 'Dell',
    category: 'Electronics',
    price: 899.99,
    stock: 20,
    description: 'Everyday high-performance Dell laptop with anti-glare screen and fast charging',
  },
  {
    id: 'PROD-101',
    name: 'DreamPad Pro Laptop 16-inch (M3 Max Equivalent, 32GB RAM)',
    brand: 'Mind_Dreams',
    category: 'Electronics',
    price: 1299.99,
    stock: 15,
    description: 'Flagship Mind_Dreams performance creator laptop with 1-year manufacturer warranty',
  },
  {
    id: 'PROD-MAC-1',
    name: 'Apple MacBook Air 15-inch M3 (16GB Unified Memory, 512GB SSD)',
    brand: 'Apple',
    category: 'Electronics',
    price: 1299.00,
    stock: 18,
    description: 'Slim Apple laptop with Liquid Retina display and 18-hour battery life',
  },
  {
    id: 'PROD-HP-1',
    name: 'HP Spectre x360 2-in-1 Convertible Laptop 14-inch',
    brand: 'HP',
    category: 'Electronics',
    price: 1199.99,
    stock: 9,
    description: 'Premium convertible HP laptop with 2.8K OLED touch and stylus support',
  },
  {
    id: 'PROD-SAM-1',
    name: 'Samsung Galaxy S25 Ultra 5G (512GB Titanium AI Edition)',
    brand: 'Samsung',
    category: 'Electronics',
    price: 1199.99,
    stock: 25,
    description: 'Flagship Samsung smartphone with built-in Galaxy S-Pen and 200MP Quad Camera',
  },
  {
    id: 'PROD-102',
    name: 'Mind_Dreams Smart Phone Ultra (256GB Crystal Display)',
    brand: 'Mind_Dreams',
    category: 'Electronics',
    price: 899.00,
    stock: 24,
    description: 'High-end smartphone with curved 120Hz OLED display & wireless fast charging',
  },
  {
    id: 'PROD-103',
    name: 'Mind_Dreams Wireless Noise-Canceling Earbuds Pro',
    brand: 'Mind_Dreams',
    category: 'Electronics',
    price: 149.99,
    stock: 50,
    description: 'Active noise cancelling wireless earbuds with spatial audio & 36h battery life',
  },
  {
    id: 'PROD-104',
    name: 'DreamStation Ergonomic Chair (Lumbar Mesh Support)',
    brand: 'Mind_Dreams',
    category: 'Furniture',
    price: 349.50,
    stock: 8,
    description: 'Ergonomic breathable mesh chair with 3D armrests and multi-tilt lock',
  },
  {
    id: 'PROD-105',
    name: 'DreamSleep Smart Cooling Gel Memory Foam Pillow',
    brand: 'Mind_Dreams',
    category: 'Bedding',
    price: 79.99,
    stock: 40,
    description: 'Orthopedic contour cooling gel pillow for cervical spine support',
  },
];

export function searchProductsInCatalog(query: string) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return CATALOG_PRODUCTS;

  const words = q.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 1);

  const matched = CATALOG_PRODUCTS.filter(product => {
    const pName = product.name.toLowerCase();
    const pBrand = product.brand.toLowerCase();
    const pCat = product.category.toLowerCase();
    const pDesc = product.description.toLowerCase();

    if (pName.includes(q) || pBrand.includes(q) || pCat.includes(q)) return true;

    // Check individual word matches (e.g. 'laptop' and 'dell')
    return words.some(w => pName.includes(w) || pBrand.includes(w) || pDesc.includes(w));
  });

  return matched.length > 0 ? matched : CATALOG_PRODUCTS;
}

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
 * Helper to resolve dynamic sheet titles across Google Sheet tabs
 */
export async function getSheetTabNames(client: any, sheetId: string): Promise<{ ordersTab: string; refundTab: string; bankTab: string }> {
  try {
    const meta = await client.spreadsheets.get({ spreadsheetId: sheetId });
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
      status: (r[6] as any) || 'Delivered',
      shippingAddress: r[7] || '',
    }));

    localOrders = fetched;
    return fetched;
  } catch (err) {
    console.error('Error fetching Orders from Google Sheets, using local store:', err);
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

  const isElectronics = newOrder.items.toLowerCase().includes('laptop') || 
                        newOrder.items.toLowerCase().includes('dell') || 
                        newOrder.items.toLowerCase().includes('phone') || 
                        newOrder.items.toLowerCase().includes('samsung') ||
                        newOrder.items.toLowerCase().includes('apple') ||
                        newOrder.items.toLowerCase().includes('earbuds');
  
  const refundEntry: RefundRecord = {
    orderId: newOrder.orderId,
    customerName: newOrder.customerName,
    email: newOrder.email,
    productType: isElectronics ? 'Electronics' : 'Standard Product',
    purchaseDate: newOrder.purchaseDate,
    returnWindowDays: isElectronics ? 15 : 30,
    daysElapsed: 0,
    isEligible: true,
    status: 'Pending',
    reason: `Newly placed order. Eligible for return within ${isElectronics ? 15 : 30} days.`,
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
        range: `'${tabs.refundTab}'!A:J`,
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
              refundEntry.status,
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
 * Portion 2: "Refund Eligibility / Refund" — Search & Update Status to 'Return Approved'
 */
export async function checkRefundEligibilityFromSheet(
  orderIdOrQuery?: string,
  userEmail?: string,
  customerNameQuery?: string
): Promise<{ order?: OrderRecord; record?: RefundRecord; isEligible: boolean; reason: string; requiresOrderIdSelection?: boolean; candidateOrders?: OrderRecord[] }> {
  const orders = await getOrdersFromSheet();

  let matchedOrder: OrderRecord | undefined;

  if (orderIdOrQuery && orderIdOrQuery.startsWith('ORD-')) {
    matchedOrder = orders.find(o => o.orderId.toLowerCase() === orderIdOrQuery.toLowerCase());
  } else if (orderIdOrQuery) {
    const q = orderIdOrQuery.toLowerCase().trim();
    const candidateList = orders.filter(
      o => o.orderId.toLowerCase().includes(q) ||
           o.customerName.toLowerCase().includes(q) ||
           o.email.toLowerCase().includes(q) ||
           o.items.toLowerCase().includes(q)
    );

    if (candidateList.length === 1) {
      matchedOrder = candidateList[0];
    } else if (candidateList.length > 1) {
      return {
        isEligible: false,
        requiresOrderIdSelection: true,
        candidateOrders: candidateList,
        reason: `Found multiple matching orders. Please confirm your specific Order ID from: ${candidateList.map(c => `${c.orderId} (${c.items})`).join(', ')}.`,
      };
    }
  }

  if (!matchedOrder && userEmail) {
    matchedOrder = orders.find(o => o.email.toLowerCase() === userEmail.toLowerCase());
  }

  if (!matchedOrder && customerNameQuery) {
    matchedOrder = orders.find(o => o.customerName.toLowerCase().includes(customerNameQuery.toLowerCase()));
  }

  // If no order identified, return candidate list so user can pick
  if (!matchedOrder) {
    return {
      isEligible: false,
      requiresOrderIdSelection: true,
      candidateOrders: orders.slice(0, 4),
      reason: `Please provide your Order ID (e.g. ${orders[0]?.orderId || 'ORD-9021'}) or email address so I can look up your exact order details.`,
    };
  }

  // Calculate days elapsed from purchase date
  const purchase = new Date(matchedOrder.purchaseDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - purchase.getTime());
  const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isElectronics = matchedOrder.items.toLowerCase().includes('laptop') ||
                        matchedOrder.items.toLowerCase().includes('dell') ||
                        matchedOrder.items.toLowerCase().includes('phone') ||
                        matchedOrder.items.toLowerCase().includes('samsung') ||
                        matchedOrder.items.toLowerCase().includes('apple') ||
                        matchedOrder.items.toLowerCase().includes('earbuds');

  // Return window: 15 days for electronics, 30 days for general items (or eligibility < 50 days)
  const maxWindow = isElectronics ? 15 : 30;
  const isEligible = daysElapsed <= maxWindow && matchedOrder.status !== 'Returned' && matchedOrder.status !== 'Cancelled';

  let reason = '';
  if (matchedOrder.status === 'Returned') {
    reason = `Order ${matchedOrder.orderId} has already been returned and refunded.`;
  } else if (!isEligible) {
    reason = `Order ${matchedOrder.orderId} was purchased ${daysElapsed} days ago. Policy allows up to ${maxWindow} days for ${isElectronics ? 'electronics' : 'standard products'}.`;
  } else {
    reason = `Order ${matchedOrder.orderId} is verified and ELIGIBLE for return (${daysElapsed} days elapsed out of ${maxWindow} days window).`;
    
    // Update status to 'Return Approved' in real-time
    matchedOrder.status = 'Return Approved';
  }

  const record: RefundRecord = {
    orderId: matchedOrder.orderId,
    customerName: matchedOrder.customerName,
    email: matchedOrder.email,
    productType: isElectronics ? 'Electronics' : 'Standard Item',
    purchaseDate: matchedOrder.purchaseDate,
    returnWindowDays: maxWindow,
    daysElapsed,
    isEligible,
    status: isEligible ? 'Return Approved' : 'Rejected',
    reason,
  };

  // Update in local memory
  const idx = localRefundEligibility.findIndex(r => r.orderId === matchedOrder!.orderId);
  if (idx >= 0) {
    localRefundEligibility[idx] = record;
  } else {
    localRefundEligibility.unshift(record);
  }

  const ordIdx = localOrders.findIndex(o => o.orderId === matchedOrder!.orderId);
  if (ordIdx >= 0) {
    localOrders[ordIdx].status = isEligible ? 'Return Approved' : localOrders[ordIdx].status;
  }

  // Update in Google Sheets if live API is connected
  const client = getGoogleSheetsClient();
  if (client && isEligible) {
    try {
      const tabs = await getSheetTabNames(client.sheets, client.sheetId);
      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: `'${tabs.refundTab}'!A:J`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              record.orderId,
              record.customerName,
              record.email,
              record.productType,
              record.purchaseDate,
              record.returnWindowDays,
              record.daysElapsed,
              'YES',
              'Return Approved',
              record.reason,
            ],
          ],
        },
      });
    } catch (err) {
      console.error('Error updating refund status in Google Sheets:', err);
    }
  }

  return { order: matchedOrder, record, isEligible, reason };
}

export async function getRefundEligibilityList(): Promise<RefundRecord[]> {
  const client = getGoogleSheetsClient();
  if (!client) return localRefundEligibility;

  try {
    const tabs = await getSheetTabNames(client.sheets, client.sheetId);
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: `'${tabs.refundTab}'!A2:J100`,
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
      status: (r[8] as any) || 'Return Approved',
      reason: r[9] || '',
    }));
  } catch (err) {
    console.error('Error fetching Refund Eligibility from Google Sheets:', err);
    return localRefundEligibility;
  }
}

/**
 * Portion 3: "Bank Details" — Populate Bank & Mobile Details for Return Approved Orders
 */
export async function addBankDetailsToSheet(details: {
  orderId: string;
  customerName?: string;
  mobile?: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  amount?: number;
}): Promise<BankDetailRecord> {
  const orders = await getOrdersFromSheet();
  const targetOrder = orders.find(o => o.orderId.toLowerCase() === details.orderId.toLowerCase()) || orders[0];
  
  const customerName = details.customerName || (targetOrder ? targetOrder.customerName : 'Customer');
  const refundAmount = details.amount || (targetOrder ? targetOrder.totalPrice : 1499.99);
  const mobile = details.mobile || '+1-555-019-2834';

  const record: BankDetailRecord = {
    refundId: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    orderId: targetOrder ? targetOrder.orderId : details.orderId,
    customerName,
    mobile,
    bankName: details.bankName,
    accountNumber: details.accountNumber.length > 4 ? `****${details.accountNumber.slice(-4)}` : details.accountNumber,
    routingNumber: details.routingNumber,
    accountHolderName: details.accountHolderName,
    amount: refundAmount,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: 'Return Approved',
  };

  localBankDetails.unshift(record);

  if (targetOrder) {
    targetOrder.status = 'Return Approved';
  }

  const client = getGoogleSheetsClient();
  if (client) {
    try {
      const tabs = await getSheetTabNames(client.sheets, client.sheetId);
      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: `'${tabs.bankTab}'!A:K`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              record.refundId,
              record.orderId,
              record.customerName,
              record.mobile,
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
      range: `'${tabs.bankTab}'!A2:K100`,
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) return localBankDetails;

    return rows.map((r: string[]) => ({
      refundId: r[0] || '',
      orderId: r[1] || '',
      customerName: r[2] || '',
      mobile: r[3] || '',
      bankName: r[4] || '',
      accountNumber: r[5] || '',
      routingNumber: r[6] || '',
      accountHolderName: r[7] || '',
      amount: parseFloat(r[8] || '0'),
      timestamp: r[9] || '',
      status: (r[10] as any) || 'Return Approved',
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
    return { success: false, message: 'Google Sheets credentials not configured.' };
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
      range: `'${tabs.refundTab}'!A1:J1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Order ID', 'Customer Name', 'Email', 'Product Type', 'Purchase Date', 'Return Window (Days)', 'Days Elapsed', 'Eligible?', 'Status', 'Reason / Details']],
      },
    });

    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.sheetId,
      range: `'${tabs.bankTab}'!A1:K1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Refund ID', 'Order ID', 'Customer Name', 'Mobile Number', 'Bank Name', 'Account Number', 'Routing Number', 'Account Holder', 'Amount ($)', 'Timestamp', 'Status']],
      },
    });

    return { success: true, message: 'Successfully initialized all 3 portions in Google Sheet!' };
  } catch (err: any) {
    return { success: false, message: `Failed to seed Google Sheet: ${err.message}` };
  }
}
