'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, FileText, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { PolicyChunk } from '@/lib/types';

interface PolicyViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyViewerModal: React.FC<PolicyViewerModalProps> = ({ isOpen, onClose }) => {
  const [chunks, setChunks] = useState<PolicyChunk[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chunks' | 'raw' | 'search'>('chunks');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/rag')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setChunks(data.chunks || []);
            setRawText(data.rawPolicyText || '');
          }
        })
        .catch(err => console.error('Error fetching RAG chunks:', err));
    }
  }, [isOpen]);

  const handleTestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    fetch(`/api/rag?q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSearchResults(data.results || []);
          setActiveTab('search');
        }
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">LangChain Policy RAG Indexer</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                policy.txt ({chunks.length} Chunks)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Chunked & Indexed RAG pipeline used by Mind_Dreams Chatbot
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleTestSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Test RAG Search query (e.g., '15 day electronics return', 'warranty info')..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-xl transition-colors shadow-xs"
            >
              Test RAG Retrieval
            </button>
          </form>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-6 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('chunks')}
            className={`flex items-center gap-1.5 px-4 py-2 font-semibold rounded-t-xl transition-colors ${
              activeTab === 'chunks' ? 'bg-white text-sky-600 border-t border-x border-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Indexed Chunks ({chunks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 px-4 py-2 font-semibold rounded-t-xl transition-colors ${
              activeTab === 'search' ? 'bg-white text-sky-600 border-t border-x border-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Results ({searchResults.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-1.5 px-4 py-2 font-semibold rounded-t-xl transition-colors ${
              activeTab === 'raw' ? 'bg-white text-sky-600 border-t border-x border-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Raw policy.txt Document</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {activeTab === 'chunks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chunks.map(chunk => (
                <div key={chunk.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-sky-300 transition-all shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      {chunk.title}
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-200 text-slate-700 font-mono">
                      {chunk.wordCount} words
                    </span>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap font-sans bg-white p-3 rounded-lg border border-slate-100">
                    {chunk.content}
                  </pre>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {chunk.keywords.slice(0, 5).map((kw, i) => (
                      <span key={i} className="px-1.5 py-0.5 text-[9px] rounded bg-slate-200/80 text-slate-600 font-mono">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-4">
              {searchResults.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No RAG search executed yet. Enter a query in the test bar above!</p>
              ) : (
                searchResults.map((res, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900 text-xs text-emerald-800">
                        Top {idx + 1} Match: {res.chunk.title}
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                        Score: {res.score.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{res.chunk.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
              <pre>{rawText}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Close RAG Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
