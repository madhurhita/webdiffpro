import React, { useState } from 'react';
import { Layout, Search, FileText, Github } from 'lucide-react';
import ComparisonDashboard from './components/ComparisonDashboard.tsx';
import ReportViewer from './components/ReportViewer.tsx';
import Navbar from './components/Navbar.tsx';
import { motion } from 'framer-motion';

export type ComparisonResult = {
  reportId: string;
  viewports: any[];
};

function App() {
  const [report, setReport] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComparisonComplete = (data: ComparisonResult) => {
    setReport(data);
    setLoading(false);
    setError(null);
  };

  const resetReport = () => {
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <Navbar onHome={resetReport} />
      
      <main className="w-full max-w-7xl px-4 py-12 flex flex-col items-center">
        {!report ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                WebDiff Pro
              </h1>
              <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                Compare and analyze web pages visually and structurally with high precision.
              </p>
            </div>

            <ComparisonDashboard 
              onStart={() => { setLoading(true); setError(null); }}
              onComplete={handleComparisonComplete}
              onError={setError}
              loading={loading}
            />

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-500 text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
              <FeatureCard 
                icon={<Search className="w-6 h-6 text-blue-400" />}
                title="Pixel Perfect"
                description="Our engine analyzes every pixel to find even the smallest visual regressions."
              />
              <FeatureCard 
                icon={<Layout className="w-6 h-6 text-indigo-400" />}
                title="DOM Analysis"
                description="Deep structural comparison of HTML tags, classes, and computed styles."
              />
              <FeatureCard 
                icon={<FileText className="w-6 h-6 text-emerald-400" />}
                title="Detailed Reports"
                description="Downloadable and shareable HTML reports with waterfall performance data."
              />
            </div>
          </motion.div>
        ) : (
          <ReportViewer report={report} onBack={resetReport} />
        )}
      </main>

      <footer className="w-full border-t border-white/5 py-8 mt-auto flex justify-center">
        <div className="text-zinc-600 flex items-center gap-4 text-sm">
          <span>&copy; 2026 WebDiff Pro. Built with performance in mind.</span>
          <a href="#" className="hover:text-blue-400 transition-colors"><Github className="w-4 h-4" /></a>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-6 rounded-2xl space-y-3 hover:border-white/20 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-zinc-200">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default App;
