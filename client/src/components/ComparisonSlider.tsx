import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ComparisonSliderProps {
  imgA: string;
  imgB: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ imgA, imgB }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativeX = ((x - left) / width) * 100;
    setSliderPosition(Math.min(Math.max(relativeX, 0), 100));
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsResizing(true);
    handleMouseMove(e);
  };

  const handleMouseUp = () => setIsResizing(false);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove as any);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div 
      className="relative w-full h-[600px] select-none overflow-hidden cursor-ew-resize rounded-xl border border-white/5 shadow-2xl bg-black"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Image B (Bottom) */}
      <img
        src={imgB}
        alt="Comparison B"
        className="absolute inset-0 w-full h-full object-cover rounded-xl"
        draggable={false}
      />
      
      {/* Image A (Top, Clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={imgA}
          alt="Original A"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-zinc-900">
           <div className="flex gap-1">
             <div className="w-1 h-3 bg-zinc-400 rounded-full" />
             <div className="w-1 h-3 bg-zinc-400 rounded-full" />
           </div>
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-4 left-4 z-30 px-3 py-1 bg-blue-600/80 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-blue-500/20">
        Page A
      </div>
      <div className="absolute top-4 right-4 z-30 px-3 py-1 bg-zinc-800/80 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider text-white border border-white/10 shadow-xl">
        Page B
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-[10px] text-zinc-300 font-medium uppercase tracking-[0.2em] border border-white/5 pointer-events-none">
        Drag slider to compare
      </div>
    </div>
  );
};

export default ComparisonSlider;
