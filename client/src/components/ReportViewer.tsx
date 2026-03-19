import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronDown, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ArrowLeft, 
  Download, 
  Share2, 
  Clock, 
  FileBox, 
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import ComparisonSlider from './ComparisonSlider.tsx';
import DOMTree from './DOMTree.tsx';

interface ReportViewerProps {
  report: any;
  onBack: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ report, onBack }) => {
  const [expandedViewport, setExpandedViewport] = useState<string | null>('desktop');

  const overallMatch = (report.viewports.reduce((acc: number, v: any) => acc + v.matchPercentage, 0) / report.viewports.length).toFixed(2);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-white">Visual Analysis Report</h2>
          <p className="text-zinc-500 text-sm">Report ID: {report.reportId}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard 
          label="Overall Match" 
          value={`${overallMatch}%`} 
          icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
          subValue="Across all viewports"
        />
        <SummaryCard 
          label="Total Pixels Diff" 
          value={report.viewports.reduce((acc: number, v: any) => acc + v.pixelsDifferent, 0).toLocaleString()} 
          icon={<Activity className="w-5 h-5 text-blue-400" />}
          subValue="Impactful visual changes"
        />
        <SummaryCard 
          label="Avg Load Time" 
          value={`${(report.viewports.reduce((acc: number, v: any) => acc + v.performanceA.loadTime, 0) / report.viewports.length / 1000).toFixed(2)}s`} 
          icon={<Clock className="w-5 h-5 text-orange-400" />}
          subValue="Page A average"
        />
        <SummaryCard 
          label="Total Assets" 
          value={report.viewports[0].performanceA.resources.length} 
          icon={<FileBox className="w-5 h-5 text-purple-400" />}
          subValue="Network requests"
        />
      </div>

      {/* Viewports Section */}
      <div className="space-y-4">
        {report.viewports.map((viewport: any) => (
          <ViewportAccordion 
            key={viewport.name}
            viewport={viewport}
            reportId={report.reportId}
            isExpanded={expandedViewport === viewport.name}
            onToggle={() => setExpandedViewport(expandedViewport === viewport.name ? null : viewport.name)}
          />
        ))}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon, subValue }: any) => (
  <div className="glass p-6 rounded-2xl relative overflow-hidden group">
    <div className="flex items-center justify-between mb-4">
      <div className="text-zinc-500 text-sm font-medium uppercase tracking-wider">{label}</div>
      <div className="p-2 rounded-lg bg-white/5 transition-transform group-hover:scale-110">
        {icon}
      </div>
    </div>
    <div className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
      {value}
    </div>
    <div className="text-xs text-zinc-600 mt-1">{subValue}</div>
  </div>
);

const ViewportAccordion = ({ viewport, reportId, isExpanded, onToggle }: any) => {
  const [activeTab, setActiveTab] = useState('split');
  const baseUrl = `http://localhost:4000/reports/${reportId}/`;

  const tabs = [
    { id: 'split', label: 'Split View' },
    { id: 'diff', label: 'Pixel Diff' },
    { id: 'overlay', label: 'Slider' },
    { id: 'dom', label: 'DOM Struture' },
    { id: 'sourceA', label: 'Page A' },
    { id: 'sourceB', label: 'Page B' },
  ];

  const getIcon = (name: string) => {
    if (name === 'desktop') return <Monitor className="w-5 h-5" />;
    if (name === 'tablet') return <Tablet className="w-5 h-5" />;
    return <Smartphone className="w-5 h-5" />;
  };

  const status = viewport.matchPercentage >= 95 ? 'Match' : 'Major';

  return (
    <div className="glass rounded-2xl overflow-hidden border-white/5">
      {/* Accordion Header */}
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${status === 'Match' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
            {getIcon(viewport.name)}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg capitalize">{viewport.name}</h3>
            <p className="text-zinc-500 text-xs font-mono">{viewport.resolution}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
             <div className="text-sm font-semibold">{viewport.matchPercentage}% match</div>
             <div className="text-[10px] text-zinc-600 uppercase tracking-tighter">({viewport.pixelsDifferent.toLocaleString()} px diff)</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
            status === 'Match' ? 'bg-green-500 text-black shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'
          }`}>
            {status}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          </motion.div>
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="border-t border-white/5 p-6 space-y-6">
              {/* Internal Tabs */}
              <div className="flex bg-white/5 p-1 rounded-xl w-fit">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                      activeTab === tab.id ? 'bg-zinc-800 text-blue-400 shadow-md ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Output */}
              <div className="rounded-xl overflow-hidden bg-black/40 border border-white/5 min-h-[500px] flex items-center justify-center relative">
                {activeTab === 'split' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full h-full p-2">
                    <ScreenshotCard label="Original (A)" src={baseUrl + viewport.screenshotA} />
                    <ScreenshotCard label="Comparison (B)" src={baseUrl + viewport.screenshotB} />
                  </div>
                )}

                {activeTab === 'diff' && (
                  <div className="p-2 w-full flex flex-col items-center gap-4">
                     <p className="text-[10px] text-zinc-600 bg-white/5 px-2 py-1 rounded uppercase tracking-widest">Pixel-by-pixel changes highlighted in bright red</p>
                     <img src={baseUrl + viewport.screenshotDiff} className="rounded border border-white/10 shadow-2xl max-w-full" alt="Diff" />
                  </div>
                )}

                {activeTab === 'overlay' && (
                  <div className="w-full relative min-h-[500px]">
                    <ComparisonSlider 
                      imgA={baseUrl + viewport.screenshotA} 
                      imgB={baseUrl + viewport.screenshotB} 
                    />
                  </div>
                )}

                {activeTab === 'dom' && (
                  <div className="w-full h-full p-6 overflow-auto style-scrollbar">
                     <DOMTree dataA={viewport.domDiff.domA} dataB={viewport.domDiff.domB} />
                  </div>
                )}

                {activeTab === 'sourceA' && (
                  <img src={baseUrl + viewport.screenshotA} className="w-full" alt="Source A" />
                )}

                {activeTab === 'sourceB' && (
                  <img src={baseUrl + viewport.screenshotB} className="w-full" alt="Source B" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ScreenshotCard = ({ label, src }: any) => (
  <div className="space-y-2">
    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">{label}</div>
    <div className="rounded-lg overflow-hidden border border-white/10 group">
       <img src={src} className="w-full hover:scale-105 transition-transform duration-700" alt={label} />
    </div>
  </div>
);

export default ReportViewer;
