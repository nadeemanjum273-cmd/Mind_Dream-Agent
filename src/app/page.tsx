'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ChatInterface } from '@/components/ChatInterface';
import { SheetsViewerModal } from '@/components/SheetsViewerModal';
import { PolicyViewerModal } from '@/components/PolicyViewerModal';
import { SetupGuideModal } from '@/components/SetupGuideModal';
import { SheetsSyncStatus } from '@/lib/types';

export default function Home() {
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const [sheetsStatus, setSheetsStatus] = useState<SheetsSyncStatus | null>(null);

  useEffect(() => {
    fetch('/api/sheets?portion=status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSheetsStatus(data.config);
        }
      })
      .catch(err => console.error('Failed to fetch sheets status:', err));
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/80">
      
      {/* Header Bar */}
      <Header
        sheetsStatus={sheetsStatus}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
      />

      {/* Main Chat App Area */}
      <div className="flex-1 px-4 sm:px-6 py-2">
        <ChatInterface />
      </div>

      {/* Interactive Inspector Modals */}
      <SheetsViewerModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
      />

      <PolicyViewerModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
      />

      <SetupGuideModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />

    </main>
  );
}
