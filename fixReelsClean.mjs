import fs from 'fs';
import path from 'path';

// Find Reels.jsx in the workspace
function findAndRestore(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      findAndRestore(full);
    } else if (item === 'Reels.jsx' || item === 'Reels.tsx') {
      const cleanReelsCode = `import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Plus } from 'lucide-react';

export default function Reels() {
  const [reels, setReels] = useState([
    {
      id: '1',
      title: 'Majestic Lion',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-lion-walking-in-a-field-42540-large.mp4',
      likes: 124,
      author: 'WildlifeLover'
    }
  ]);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full max-w-md mx-auto bg-black overflow-hidden rounded-lg shadow-xl">
      <div className="absolute top-4 left-4 z-10 flex items-center justify-between right-4">
        <h1 className="text-white text-lg font-bold">Wildlife Reels</h1>
      </div>

      <div className="h-full w-full relative">
        <video
          src={reels[0]?.videoUrl}
          className="w-full h-full object-cover"
          loop
          playsInline
          autoPlay
          muted={isMuted}
          onClick={() => setIsMuted(!isMuted)}
        />

        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full z-20"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="absolute bottom-6 left-4 right-16 z-10 text-white">
          <p className="font-semibold">@{reels[0]?.author}</p>
          <p className="text-sm text-gray-200 mt-1">{reels[0]?.title}</p>
        </div>

        <div className="absolute bottom-6 right-4 z-10 flex flex-col items-center gap-4 text-white">
          <button className="flex flex-col items-center gap-1">
            <Heart className="w-7 h-7 text-white hover:text-red-500" />
            <span className="text-xs">{reels[0]?.likes}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <MessageCircle className="w-7 h-7 text-white" />
          </button>
          <button className="flex flex-col items-center gap-1">
            <Share2 className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
`;
      fs.writeFileSync(full, cleanReelsCode, 'utf8');
      console.log(`✅ Successfully clean-restored: ${full}`);
    }
  }
}

findAndRestore('.');
