import { NextRequest, NextResponse } from 'next/server';
import {
  checkSheetsConfig,
  getOrdersFromSheet,
  addOrderToSheet,
  getRefundEligibilityList,
  checkRefundEligibilityFromSheet,
  getBankDetailsFromSheet,
  addBankDetailsToSheet,
  seedGoogleSheetHeaders,
  CATALOG_PRODUCTS,
} from '@/lib/sheets/googleSheets';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const portion = searchParams.get('portion') || 'all';

    const config = checkSheetsConfig();

    if (portion === 'status') {
      return NextResponse.json({ success: true, config });
    }

    if (portion === 'catalog') {
      return NextResponse.json({ success: true, catalog: CATALOG_PRODUCTS });
    }

    const [orders, refundEligibility, bankDetails] = await Promise.all([
      getOrdersFromSheet(),
      getRefundEligibilityList(),
      getBankDetailsFromSheet(),
    ]);

    return NextResponse.json({
      success: true,
      config,
      portions: {
        portion1_orders: orders,
        portion2_refundEligibility: refundEligibility,
        portion3_bankDetails: bankDetails,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'seed') {
      const res = await seedGoogleSheetHeaders();
      return NextResponse.json(res);
    }

    if (action === 'create_order') {
      const newOrder = await addOrderToSheet(payload);
      return NextResponse.json({ success: true, order: newOrder });
    }

    if (action === 'check_refund') {
      const result = await checkRefundEligibilityFromSheet(payload.orderId, payload.email);
      return NextResponse.json({ success: true, result });
    }

    if (action === 'add_bank_details') {
      const record = await addBankDetailsToSheet(payload);
      return NextResponse.json({ success: true, bankDetail: record });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
