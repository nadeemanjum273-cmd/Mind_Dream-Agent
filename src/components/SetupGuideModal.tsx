'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Copy, ExternalLink, Key, Database, Globe, Layers } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const envSample = `GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project_id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...PrivateKeyHere...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id_here`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vercel & Google Sheets Setup Guide</h2>
              <p className="text-xs text-slate-500">
                Step-by-step instructions for live deployment on Vercel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          
          {/* Step 1: Gemini API */}
          <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40">
            <h3 className="font-bold text-sky-900 text-sm flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-sky-600" />
              Step 1: Get Google Gemini API Key
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
              <li>Visit <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-sky-600 underline font-semibold">Google AI Studio</a>.</li>
              <li>Click <strong>Create API Key</strong> and copy the generated key.</li>
              <li>Set <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-800 font-mono">GEMINI_API_KEY</code> in your environment variables.</li>
            </ol>
          </div>

          {/* Step 2: Google Sheets Setup */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40">
            <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-600" />
              Step 2: Setup Google Sheets Service Account (3 Portions)
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
              <li>Create a Google Sheet and name 3 sub-sheets (tabs): <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800 font-mono">Orders</code>, <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800 font-mono">Refund Eligibility</code>, and <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800 font-mono">Bank Details</code>.</li>
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Google Cloud Console</a>, enable <strong>Google Sheets API</strong>, and create a <strong>Service Account</strong>.</li>
              <li>Download the JSON credentials key for the Service Account.</li>
              <li>Share your Google Sheet with the Service Account email (give <strong>Editor</strong> permissions).</li>
              <li>Extract the <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-blue-800">GOOGLE_SHEET_ID</code> from your spreadsheet URL: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">https://docs.google.com/spreadsheets/d/<strong>YOUR_SHEET_ID</strong>/edit</code>.</li>
              <li>In this app, click <strong>"Inspect 3 Sheets" &rarr; "Seed Google Sheet Headers"</strong> to auto-populate column headers!</li>
            </ol>
          </div>

          {/* Step 3: Env variables sample */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900">Environment Variables Configuration (.env.local / Vercel)</h4>
              <button
                onClick={copyEnv}
                className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Template'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
              {envSample}
            </pre>
          </div>

          {/* Step 4: Deployment to Vercel */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
            <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Step 4: Push to GitHub & Deploy Live to Vercel
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
              <li>Initialize git and push code to your GitHub repository:
                <pre className="bg-slate-800 text-slate-200 p-2 rounded mt-1 font-mono text-[10px]">
git init && git add . && git commit -m "Initial commit" && git push
                </pre>
              </li>
              <li>Import repository into <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">Vercel</a>.</li>
              <li>Add the 4 Environment Variables in Vercel Project Settings.</li>
              <li>Click <strong>Deploy</strong> — Mind_Dreams Chatbot is ready for 24/7 production!</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors text-xs"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
};
