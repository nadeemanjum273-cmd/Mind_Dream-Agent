import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mind_Dreams — AI Customer Support Chatbot & RAG Engine',
  description:
    'Full-stack Next.js production web application for Mind_Dreams AI customer support chatbot featuring LangChain policy RAG indexing and real-time Google Sheets 3 portions sync.',
  keywords: ['Mind_Dreams', 'AI Chatbot', 'RAG', 'LangChain', 'Next.js', 'Google Sheets', 'Gemini API'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-sky-100 selection:text-sky-900">
        {children}
      </body>
    </html>
  );
}
