'use client';

import React from 'react';
import { Bot, Table, FileText, Settings, Sparkles, Database, CheckCircle2 } from 'lucide-react';
import { SheetsSyncStatus } from '@/lib/types';

interface HeaderProps {
  sheetsStatus: SheetsSyncStatus | null;
  onOpenSheetsModal: () => void;
  onOpenPolicyModal: () => void;
  onOpenSetupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sheetsStatus,
  onOpenSheetsModal,
  onOpenPolicyModal,
  onOpenSetupModal,
}) => {
  return (
    <header className="sticky top-0 z-30 glass-header w-full px-4 sm:px-6 py-3 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Mind_Dreams</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                AI Customer Agent
              </span>
            </div>
            <p className="text-xs text-slate-5-0 font-medium">
              RAG Policy Index &bull; Live Google Sheets Sync &bull; Gemini Powered
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          
          {/* RAG Status */}
          <button
            onClick={onOpenPolicyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium shadow-xs"
            title="Click to view RAG indexed chunks of policy.txt"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>RAG Policy: <strong className="font-semibold">Indexed</strong></span>
          </button>

          {/* Google Sheets Sync Status */}
          <button
            onClick={onOpenSheetsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors font-medium shadow-xs"
            title="Click to view Google Sheets live 3 portions data"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Sheets: {' '}
              <strong className="font-semibold">
                {sheetsStatus?.mode === 'live_google_sheets' ? 'Live Connected' : 'Simulated Sandbox'}
              </strong>
            </span>
          </button>

          {/* Buttons */}
          <button
            onClick={onOpenSheetsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium shadow-xs transition-colors"
          >
            <Table className="w-3.5 h-3.5 text-slate-500" />
            <span>Inspect 3 Sheets</span>
          </button>

          <button
            onClick={onOpenSetupModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Deploy & Setup</span>
          </button>
        </div>

      </div>
    </header>
  );
};
