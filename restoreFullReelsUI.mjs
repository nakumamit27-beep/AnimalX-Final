import fs from 'fs';
import path from 'path';

function restoreOriginalReels(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      restoreOriginalReels(full);
    } else if (item === 'Reels.jsx' || item === 'Reels.tsx') {
      const originalReelsCode = `import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Plus, Film } from 'lucide-react';

export default function Reels() {
  const [activeTab, setActiveTab] = useState('All');
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const categories = ['All', 'Mammals', 'Birds', 'Aquatic', 'Reptiles', 'Small Creatures'];

  const reelsData = [
    {
      id: '1',
      title: 'Majestic Wild Lion',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-lion-walking-in-a-field-42540-large.mp4',
      author: 'WildLingo',
      followers: '100 followers',
      likes: 124,
      comments: 18,
      category: 'Mammals'
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-black text-white relative max-w-md mx-auto overflow-hidden">
      {/* Top Header & Upload Button */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-emerald-400" />
          <h1 className="text-lg font-bold">Wildlife Reels</h1>
        </div>
        <button className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition">
          <Plus size={14} /> Upload
        </button>
      </div>

      {/* Category Pills Header */}
      <div className="flex gap-2 overflow-x-auto px-4 pt-14 pb-2 z-20 scrollbar-none bg-gradient-to-b from-black/60 to-transparent">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={\`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition \${
              activeTab === cat ? 'bg-emerald-500 text-white' : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
            }\`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Content Container */}
      <div className="flex-1 relative w-full h-full bg-zinc-950 flex items-center justify-center">
        <video
          src={reelsData[0].videoUrl}
          className="w-full h-full object-cover"
          loop
          playsInline
          autoPlay
          muted={isMuted}
          onClick={() => setIsMuted(!isMuted)}
        />

        {/* Mute/Unmute Float Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-16 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white z-20"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Bottom Overlay User Info */}
        <div className="absolute bottom-4 left-4 right-16 z-20 text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
              WL
            </div>
            <div>
              <p className="font-bold text-sm flex items-center gap-1">
                @{reelsData[0].author}
                <span className="text-emerald-400 text-xs">✓</span>
              </p>
              <p className="text-[10px] text-zinc-400">{reelsData[0].followers}</p>
            </div>
          </div>
          <p className="text-xs font-medium">{reelsData[0].title}</p>
        </div>

        {/* Right Sidebar Action Icons */}
        <div className="absolute bottom-6 right-3 z-20 flex flex-col items-center gap-5">
          <button onClick={() => setLiked(!liked)} className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
              <Heart className={\`w-6 h-6 \${liked ? 'fill-red-500 text-red-500' : 'text-white'}\`} />
            </div>
            <span className="text-[11px] font-semibold">{liked ? reelsData[0].likes + 1 : reelsData[0].likes}</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-semibold">{reelsData[0].comments}</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
              <Share2 className="w-6 h-6 text-white" />
            </div>
          </button>

          <button onClick={() => setSaved(!saved)} className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
              <Bookmark className={\`w-6 h-6 \${saved ? 'fill-emerald-400 text-emerald-400' : 'text-white'}\`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
`;
      fs.writeFileSync(full, originalReelsCode, 'utf8');
      console.log(`✅ Fully restored complete structure: ${full}`);
    }
  }
}

restoreOriginalReels('.');
