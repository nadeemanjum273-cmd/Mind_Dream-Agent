'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ShoppingCart, ShieldCheck, CreditCard, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { OrderRecord, RefundRecord, BankDetailRecord, SheetsSyncStatus } from '@/lib/types';

interface SheetsViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SheetsViewerModal: React.FC<SheetsViewerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'portion1' | 'portion2' | 'portion3'>('portion1');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetailRecord[]>([]);
  const [config, setConfig] = useState<SheetsSyncStatus | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sheets');
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setOrders(data.portions.portion1_orders || []);
        setRefunds(data.portions.portion2_refundEligibility || []);
        setBankDetails(data.portions.portion3_bankDetails || []);
      }
    } catch (err) {
      console.error('Error fetching sheets data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSheet = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      setSeedResult(data.message);
      fetchData();
    } catch (err: any) {
      setSeedResult('Failed to seed sheet headers.');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Google Sheets Live Inspector</h2>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                config?.mode === 'live_google_sheets'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {config?.mode === 'live_google_sheets' ? '● Live API Mode' : '⚡ Sandbox Memory Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Inspecting 3 Portions dynamically updated by Mind_Dreams Chatbot
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Portions Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('portion1')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'portion1'
                ? 'bg-white text-sky-600 border-slate-200 border-b-transparent shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-sky-500" />
            <span>Portion 1: Orders / Products</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600 font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('portion2')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'portion2'
                ? 'bg-white text-indigo-600 border-slate-200 border-b-transparent shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Portion 2: Refund Eligibility</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600 font-bold">
              {refunds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('portion3')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'portion3'
                ? 'bg-white text-emerald-600 border-slate-200 border-b-transparent shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>Portion 3: Bank_details</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600 font-bold">
              {bankDetails.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">

          {/* Portion 1: Orders Table */}
          {activeTab === 'portion1' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Portion 1 — Products & Customer Orders
                </h3>
                <span className="text-xs text-slate-500">
                  Updated in real-time upon order placement and product lookups
                </span>
              </div>
              
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Item(s)</th>
                      <th className="p-3">Total Price</th>
                      <th className="p-3">Purchase Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-sky-700">{ord.orderId}</td>
                        <td className="p-3 font-medium text-slate-900">{ord.customerName}</td>
                        <td className="p-3 text-slate-500">{ord.email}</td>
                        <td className="p-3 text-slate-700 font-medium">{ord.items}</td>
                        <td className="p-3 font-semibold text-slate-900">${ord.totalPrice.toFixed(2)}</td>
                        <td className="p-3 text-slate-500">{ord.purchaseDate}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                            ord.status === 'Return Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            ord.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            ord.status === 'Returned' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Portion 2: Refund Eligibility */}
          {activeTab === 'portion2' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Portion 2 — Refund Eligibility & Status Validation
                </h3>
                <span className="text-xs text-slate-500">
                  Return Window: Electronics (15 days) &bull; Standard items (30 days)
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Product Category</th>
                      <th className="p-3">Purchase Date</th>
                      <th className="p-3">Allowed Window</th>
                      <th className="p-3">Days Elapsed</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Details / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {refunds.map((ref, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-700">{ref.orderId}</td>
                        <td className="p-3 font-medium text-slate-900">{ref.customerName}</td>
                        <td className="p-3 text-slate-600">{ref.productType}</td>
                        <td className="p-3 text-slate-500">{ref.purchaseDate}</td>
                        <td className="p-3 text-slate-700 font-medium">{ref.returnWindowDays} Days</td>
                        <td className="p-3 font-semibold text-slate-800">{ref.daysElapsed} d</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                            ref.status === 'Return Approved' || ref.isEligible
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {ref.status || (ref.isEligible ? 'Return Approved' : 'Rejected')}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{ref.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Portion 3: Bank Details */}
          {activeTab === 'portion3' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Portion 3 — Bank_details Sheet Tab (Refund Payout Queue)
                </h3>
                <span className="text-xs text-slate-500">
                  Auto-populated with Bank & Mobile details when refund is Return Approved
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Refund ID</th>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Mobile Number</th>
                      <th className="p-3">Bank Name</th>
                      <th className="p-3">Account Number</th>
                      <th className="p-3">Routing / IFSC</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bankDetails.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-700">{b.refundId}</td>
                        <td className="p-3 font-mono text-slate-700">{b.orderId}</td>
                        <td className="p-3 font-medium text-slate-900">{b.customerName}</td>
                        <td className="p-3 font-mono text-slate-600">{b.mobile || '+1-555-019-2834'}</td>
                        <td className="p-3 text-slate-700 font-medium">{b.bankName}</td>
                        <td className="p-3 font-mono text-slate-600">{b.accountNumber}</td>
                        <td className="p-3 font-mono text-slate-500">{b.routingNumber}</td>
                        <td className="p-3 font-bold text-emerald-600">${b.amount.toFixed(2)}</td>
                        <td className="p-3 text-slate-400">{b.timestamp}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {b.status || 'Return Approved'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {config?.mode === 'live_google_sheets' && (
              <button
                onClick={handleSeedSheet}
                disabled={seeding}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium"
              >
                {seeding ? 'Initializing Headers...' : 'Seed Google Sheet Headers'}
              </button>
            )}
            {seedResult && <span className="text-slate-600 font-medium">{seedResult}</span>}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
