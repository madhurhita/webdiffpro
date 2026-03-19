import React, { useState } from 'react';
import { Tag, FileCode, Check, X, Edit, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DOMNode {
  tagName: string;
  id: string;
  classList: string[];
  styles: Record<string, string>;
  rect: any;
  children: DOMNode[];
}

interface DOMTreeProps {
  dataA: DOMNode;
  dataB: DOMNode;
}

const DOMTree: React.FC<DOMTreeProps> = ({ dataA, dataB }) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const renderNode = (nodeA: DOMNode | null, nodeB: DOMNode | null, level = 0): React.ReactNode => {
    // Basic diffing: If tag name or ID is different, mark as change
    // For simplicity, we assume child indices match for now.
    // Real-world DOM diffing is harder, but this shows the idea.
    
    const isAdded = !nodeA && nodeB;
    const isRemoved = nodeA && !nodeB;
    const node = nodeB || nodeA;

    if (!node) return null;

    const hasStyleChange = nodeA && nodeB && JSON.stringify(nodeA.styles) !== JSON.stringify(nodeB.styles);
    const hasClassChange = nodeA && nodeB && JSON.stringify(nodeA.classList) !== JSON.stringify(nodeB.classList);
    const hasChange = isAdded || isRemoved || hasStyleChange || hasClassChange;

    const labelColor = isAdded ? 'text-green-400' : isRemoved ? 'text-red-400' : hasChange ? 'text-orange-400' : 'text-blue-400';
    const bgColor = isAdded ? 'bg-green-500/5 border-green-500/20' : isRemoved ? 'bg-red-500/5 border-red-500/20' : hasChange ? 'bg-orange-500/5 border-orange-500/20' : 'bg-white/5 border-white/5';

    return (
      <div key={`${level}-${node.tagName}-${node.id}`} className="space-y-1">
        <div 
          onClick={() => setSelectedNode({ nodeA, nodeB })}
          className={`flex items-center gap-3 p-3 rounded-xl border group transition-all cursor-pointer ${bgColor} hover:border-white/20`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {isAdded ? <Check className="w-3 h-3 text-green-400" /> : isRemoved ? <X className="w-3 h-3 text-red-400" /> : <Tag className={`w-3 h-3 ${labelColor}`} />}
          <span className={`text-xs font-mono font-bold ${labelColor}`}>{node.tagName}</span>
          {node.id && <span className="text-[10px] text-zinc-500 font-mono">#{node.id}</span>}
          {node.classList.length > 0 && <span className="text-[10px] text-zinc-600 font-mono hidden md:inline">.{node.classList.join('.')}</span>}
          
          <div className="flex-1" />
          {hasStyleChange && <div title="Style changes detected"><Edit className="w-3 h-3 text-orange-400 opacity-50" /></div>}
          <Info className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
        </div>

        {node.children.map((_, idx) => (
          renderNode(nodeA?.children[idx] || null, nodeB?.children[idx] || null, level + 1)
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
      <div className="lg:col-span-8 space-y-2 max-h-[700px] overflow-y-auto style-scrollbar pr-2">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-background/80 backdrop-blur-sm p-3 border-b border-white/5 z-10">
          <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Structural Comparison</h4>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tighter">
            <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Added</span>
            <span className="text-red-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Removed</span>
            <span className="text-orange-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> Changed</span>
          </div>
        </div>
        {renderNode(dataA, dataB)}
      </div>

      <div className="lg:col-span-4 border-l border-white/5 pl-6 flex flex-col">
        {selectedNode ? (
          <NodeDetails data={selectedNode} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-4 text-center p-8 border-2 border-dashed border-white/5 rounded-2xl">
            <FileCode className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">Select an element to view detailed style and structure differences</p>
          </div>
        )}
      </div>
    </div>
  );
};

const NodeDetails = ({ data }: { data: any }) => {
  const { nodeA, nodeB } = data;
  const node = nodeB || nodeA;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 animate-in slide-in-from-right-4 duration-300"
    >
      <div className="space-y-1">
        <h4 className="text-lg font-bold flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-400" />
          {node.tagName}
        </h4>
        <p className="text-xs text-zinc-500 font-mono">Selector Detail View</p>
      </div>

      {nodeA && nodeB && (
        <div className="space-y-4">
           <h5 className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest">Computed Style Diff (Page A vs B)</h5>
           <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
             <div className="grid grid-cols-3 p-3 text-[10px] font-bold text-zinc-500 bg-white/5 uppercase border-b border-white/5">
                <div>Property</div>
                <div>Page A</div>
                <div>Page B</div>
             </div>
             <div className="max-h-[300px] overflow-y-auto">
                {Object.keys(node.styles).map(prop => {
                   const valA = nodeA.styles[prop];
                   const valB = nodeB.styles[prop];
                   const isDiff = valA !== valB;
                   return (
                     <div key={prop} className={`grid grid-cols-3 p-3 text-xs font-mono border-b border-white/5 last:border-0 ${isDiff ? 'bg-orange-500/10' : ''}`}>
                        <div className="text-zinc-400">{prop}</div>
                        <div className={isDiff ? 'text-red-400' : 'text-zinc-200'}>{valA}</div>
                        <div className={isDiff ? 'text-green-400' : 'text-zinc-200'}>{valB}</div>
                     </div>
                   );
                })}
             </div>
           </div>
        </div>
      )}

      {(!nodeA || !nodeB) && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${!nodeA ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
           {!nodeA ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
           <span className="text-sm font-bold uppercase tracking-wide">{!nodeA ? 'Added in Page B' : 'Removed in Page B'}</span>
        </div>
      )}
    </motion.div>
  );
};

export default DOMTree;
