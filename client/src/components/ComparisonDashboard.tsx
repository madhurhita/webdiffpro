import React, { useState } from 'react';
import axios from 'axios';
import { Search, FileUp, Shield, HelpCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComparisonDashboardProps {
  onStart: () => void;
  onComplete: (data: any) => void;
  onError: (error: string) => void;
  loading: boolean;
}

const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ onStart, onComplete, onError, loading }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'file'>('url');
  const [urlA, setUrlA] = useState('https://www.google.com');
  const [urlB, setUrlB] = useState('https://www.bing.com');
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [authA, setAuthA] = useState('');
  const [authB, setAuthB] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onStart();

    const formData = new FormData();
    if (activeTab === 'url') {
      formData.append('urlA', urlA);
      formData.append('urlB', urlB);
    } else {
      if (fileA) formData.append('fileA', fileA);
      if (fileB) formData.append('fileB', fileB);
    }

    if (authA) formData.append('authHeadersA', authA);
    if (authB) formData.append('authHeadersB', authB);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await axios.post(`${apiUrl}/api/compare`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000 // 5-minute timeout for Render cold starts
      });
      
      if (!response.data || !response.data.result) {
        throw new Error('Analysis completed but returned an empty response. Please try again.');
      }
      
      onComplete(response.data.result);
    } catch (err: any) {
      console.error(err);
      const msg = err.code === 'ECONNABORTED' 
        ? 'The request timed out. Render server might be taking too long to wake up. Please wait 1 minute and try again!'
        : (err.response?.data?.error || err.message || 'Failed to connect to the analysis engine.');
      onError(msg);
    }
  };

  return (
    <div className="glass p-8 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl w-fit mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'url' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className="w-4 h-4" />
            URLs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'file' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileUp className="w-4 h-4" />
            HTML Upload
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTab === 'url' ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Page A (Original)</label>
                <input
                  type="url"
                  placeholder="https://example-a.com"
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                  value={urlA}
                  onChange={(e) => setUrlA(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Page B (Comparison)</label>
                <input
                  type="url"
                  placeholder="https://example-b.com"
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                  value={urlB}
                  onChange={(e) => setUrlB(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">HTML File A</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".html,.htm"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => setFileA(e.target.files?.[0] || null)}
                  />
                  <div className={`w-full bg-white/5 border-2 border-dashed border-white/10 p-6 rounded-xl text-center group-hover:border-blue-500/50 transition-all ${fileA ? 'border-green-500/50' : ''}`}>
                    <FileUp className={`w-8 h-8 mx-auto mb-2 ${fileA ? 'text-green-400' : 'text-zinc-500'}`} />
                    <p className="text-sm text-zinc-400 truncate">{fileA ? fileA.name : 'Click or Drag File A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">HTML File B</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".html,.htm"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => setFileB(e.target.files?.[0] || null)}
                  />
                  <div className={`w-full bg-white/5 border-2 border-dashed border-white/10 p-6 rounded-xl text-center group-hover:border-blue-500/50 transition-all ${fileB ? 'border-green-500/50' : ''}`}>
                    <FileUp className={`w-8 h-8 mx-auto mb-2 ${fileB ? 'text-green-400' : 'text-zinc-500'}`} />
                    <p className="text-sm text-zinc-400 truncate">{fileB ? fileB.name : 'Click or Drag File B'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Advanced Headers */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Advanced: Authentication Headers {showAdvanced ? '(-)' : '(+)'}
            <span title="JSON format for extra headers">
              <HelpCircle className="w-3 h-3 opacity-50" />
            </span>
          </button>
          
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <textarea
                placeholder='{"Authorization": "Bearer tokenA"}'
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-xs h-24"
                value={authA}
                onChange={(e) => setAuthA(e.target.value)}
              />
              <textarea
                placeholder='{"Authorization": "Bearer tokenB"}'
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-xs h-24"
                value={authB}
                onChange={(e) => setAuthB(e.target.value)}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
        >
          {loading ? (
             <div className="flex items-center justify-center gap-3">
               <Loader2 className="w-5 h-5 animate-spin" />
               Analyzing and Rendering...
             </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              Run Comparison
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Search className="w-5 h-5" />
              </motion.div>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default ComparisonDashboard;
