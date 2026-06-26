import React from 'react';

export default function Reels() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0b141a] text-white p-6 text-center">
      <div className="backdrop-blur-md bg-[#1f2c34]/80 p-10 rounded-3xl border border-emerald-500/20 shadow-2xl max-w-sm m-auto transition-all duration-500 transform hover:scale-105">
        
        {/* Animated Icon */}
        <div className="text-6xl mb-4 animate-bounce duration-1000">🎬</div>
        
        <h2 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent tracking-wide">
          Wildlife Reels
        </h2>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Our standard high-quality short video feed is under routine tuning. 
        </p>
        
        {/* Sleek Pulse Badge */}
        <div className="relative inline-flex">
          <div className="absolute -inset-px bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-sm opacity-70 animate-pulse"></div>
          <button className="relative px-6 py-2.5 bg-emerald-500 text-[#0b141a] font-bold text-xs uppercase tracking-widest rounded-full shadow-lg">
            Coming Soon
          </button>
        </div>

      </div>
    </div>
  );
}
