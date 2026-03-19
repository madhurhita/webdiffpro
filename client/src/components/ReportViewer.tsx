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

const downloadHTMLReport = (report: any) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const overallMatch = (report.viewports.reduce((acc: number, v: any) => acc + v.matchPercentage, 0) / report.viewports.length).toFixed(2);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebDiff Pro Report - ${report.reportId}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #050505; color: #ededed; }
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .style-scrollbar::-webkit-scrollbar { width: 4px; }
        .style-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .style-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
    </style>
</head>
<body class="p-8">
    <div class="max-w-6xl mx-auto space-y-8">
        <header class="flex justify-between items-end border-b border-white/10 pb-6">
            <div>
                <h1 class="text-4xl font-extrabold tracking-tight">WebDiff <span class="text-blue-500">Pro</span></h1>
                <p class="text-zinc-500 mt-2 font-mono text-sm">REPORT_ID: ${report.reportId}</p>
            </div>
            <div class="text-right">
                <div class="text-3xl font-bold text-green-400">${overallMatch}% MATCH</div>
                <div class="text-xs text-zinc-600 uppercase tracking-widest mt-1">Overall Integrity Score</div>
            </div>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${report.viewports.map((v: any) => `
                <div class="glass p-6 rounded-2xl">
                    <div class="text-xs font-bold text-zinc-500 uppercase mb-2 tracking-widest">${v.name}</div>
                    <div class="text-2xl font-bold">${v.matchPercentage}%</div>
                    <div class="text-xs text-zinc-600 font-mono mt-1">${v.pixelsDifferent.toLocaleString()} px diff</div>
                </div>
            `).join('')}
        </section>

        <section class="space-y-16">
            ${report.viewports.map((v: any, idx: number) => `
                <div class="space-y-6">
                    <div class="flex items-center gap-4">
                        <div class="h-8 w-1 bg-blue-500 rounded-full"></div>
                        <h2 class="text-xl font-bold capitalize">${v.name} Viewport <span class="text-zinc-600 font-normal">(${v.resolution})</span></h2>
                    </div>

                    <!-- Interactive Tabs Container -->
                    <div class="glass rounded-3xl overflow-hidden">
                        <div class="bg-white/5 p-4 flex gap-2 border-b border-white/5 scroll-x overflow-auto">
                            <button onclick="switchTab(${idx}, 'split')" id="tab-${idx}-split" class="tab-btn active px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">Split View</button>
                            <button onclick="switchTab(${idx}, 'diff')" id="tab-${idx}-diff" class="tab-btn px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">Pixel Diff</button>
                            <button onclick="switchTab(${idx}, 'slider')" id="tab-${idx}-slider" class="tab-btn px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-blue-400">Slider View</button>
                            <button onclick="switchTab(${idx}, 'sourceA')" id="tab-${idx}-sourceA" class="tab-btn px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">Page A</button>
                            <button onclick="switchTab(${idx}, 'sourceB')" id="tab-${idx}-sourceB" class="tab-btn px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">Page B</button>
                        </div>

                        <div class="p-4 bg-black/40 min-h-[400px]">
                            <!-- Split View -->
                            <div id="content-${idx}-split" class="tab-content">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                        <div class="text-[10px] uppercase font-bold text-zinc-600 text-center tracking-widest">Original (A)</div>
                                        <div class="rounded-xl overflow-hidden border border-white/10 shadow-lg"><img src="${apiUrl}/reports/${report.reportId}/${v.screenshotA}" class="w-full"></div>
                                    </div>
                                    <div class="space-y-2">
                                        <div class="text-[10px] uppercase font-bold text-zinc-600 text-center tracking-widest">Comparison (B)</div>
                                        <div class="rounded-xl overflow-hidden border border-white/10 shadow-lg"><img src="${apiUrl}/reports/${report.reportId}/${v.screenshotB}" class="w-full"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Diff View -->
                            <div id="content-${idx}-diff" class="tab-content hidden">
                                <div class="space-y-4">
                                    <div class="text-[10px] uppercase font-bold text-zinc-500 text-center tracking-widest bg-red-500/10 py-1 rounded">Visual changes highlighted in bright red</div>
                                    <div class="rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl"><img src="${apiUrl}/reports/${report.reportId}/${v.screenshotDiff}" class="w-full max-w-4xl mx-auto py-8"></div>
                                </div>
                            </div>

                            <!-- Slider View -->
                            <div id="content-${idx}-slider" class="tab-content hidden h-[600px] flex items-center justify-center">
                                <div class="slider-container relative w-full h-full overflow-hidden rounded-xl border border-white/10 bg-black/50" id="slider-${idx}">
                                    <div class="absolute inset-0 bg-cover bg-left-top" style="background-image: url('${apiUrl}/reports/${report.reportId}/${v.screenshotB}')"></div>
                                    <div class="absolute inset-0 bg-cover bg-left-top slider-overlay" style="background-image: url('${apiUrl}/reports/${report.reportId}/${v.screenshotA}'); width: 50%;"></div>
                                    <div class="absolute inset-y-0 left-1/2 w-1 bg-blue-500 cursor-ew-resize slider-handle group" style="left: 50%;">
                                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-full border-4 border-black/80 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <div class="flex gap-1"><div class="w-1 h-3 bg-white/50 rounded-full"></div><div class="w-1 h-3 bg-white/50 rounded-full"></div></div>
                                        </div>
                                    </div>
                                    <input type="range" min="0" max="100" value="50" class="absolute inset-0 opacity-0 cursor-ew-resize w-full z-20" oninput="handleSlider(this, ${idx})">
                                </div>
                            </div>

                            <!-- Source A -->
                            <div id="content-${idx}-sourceA" class="tab-content hidden">
                                <div class="rounded-xl overflow-hidden border border-white/10"><img src="${apiUrl}/reports/${report.reportId}/${v.screenshotA}" class="w-full"></div>
                            </div>

                            <!-- Source B -->
                            <div id="content-${idx}-sourceB" class="tab-content hidden">
                                <div class="rounded-xl overflow-hidden border border-white/10"><img src="${apiUrl}/reports/${report.reportId}/${v.screenshotB}" class="w-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </section>

        <footer class="text-center pt-24 pb-12">
            <p class="text-[10px] text-zinc-700 uppercase tracking-[4px]">Powered by WebDiff Pro • ${new Date().toLocaleDateString()} • Generated Report</p>
        </footer>
    </div>

    <script>
        function switchTab(idx, tabId) {
            // Hide all contents for this viewport
            const section = document.querySelectorAll(\`[id^="content-\${idx}-"]\`);
            section.forEach(c => c.classList.add('hidden'));
            
            // Remove active style from all buttons for this viewport
            const buttons = document.querySelectorAll(\`[id^="tab-\${idx}-"]\`);
            buttons.forEach(b => b.classList.remove('bg-blue-600', 'text-white', 'shadow-lg'));
            buttons.forEach(b => b.classList.add('text-zinc-500'));

            // Show selected
            document.getElementById(\`content-\${idx}-\${tabId}\`).classList.remove('hidden');
            const activeBtn = document.getElementById(\`tab-\${idx}-\${tabId}\`);
            activeBtn.classList.remove('text-zinc-500');
            activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
        }

        function handleSlider(input, idx) {
            const container = document.getElementById(\`slider-\${idx}\`);
            const overlay = container.querySelector('.slider-overlay');
            const handle = container.querySelector('.slider-handle');
            const val = input.value + '%';
            
            overlay.style.width = val;
            handle.style.left = val;
        }

        // Initialize first tabs
        window.onload = () => {
            ${report.viewports.map((_: any, i: number) => `switchTab(${i}, 'split');`).join('\n')}
        };
    </script>
</body>
</html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `webdiff-report-${report.reportId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

interface ReportViewerProps {
  report: any;
  onBack: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ report, onBack }) => {
  const [expandedViewport, setExpandedViewport] = useState<string | null>('desktop');

  if (!report || report.status === 'failed' || !report.viewports || report.viewports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-500/10 border border-red-500/20 rounded-3xl space-y-6 max-w-2xl mx-auto w-full">
        <XCircle className="w-16 h-16 text-red-500" />
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Analysis Failed</h2>
            <p className="text-zinc-400 text-sm">{report?.message || 'The comparison process could not be completed. One of the pages might have timed out or blocked our access.'}</p>
        </div>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-all font-bold text-white"
        >
          Try Different URLs
        </button>
      </div>
    );
  }

  const overallMatch = (report.viewports.reduce((acc: number, v: any) => acc + (v.matchPercentage || 0), 0) / report.viewports.length).toFixed(2);

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
      <button 
        onClick={() => downloadHTMLReport(report)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
      >
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
          value={`${(report.viewports.reduce((acc: number, v: any) => acc + (v.performanceA?.loadTime || 0), 0) / report.viewports.length / 1000).toFixed(2)}s`} 
          icon={<Clock className="w-5 h-5 text-orange-400" />}
          subValue="Page A average"
        />
        <SummaryCard 
          label="Total Assets" 
          value={report.viewports[0]?.performanceA?.resources?.length || 0} 
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
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const baseUrl = `${apiUrl}/reports/${reportId}/`;

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
