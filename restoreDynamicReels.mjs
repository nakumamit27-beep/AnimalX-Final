import fs from 'fs';
import path from 'path';

function findAndRestoreFullDynamic(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      findAndRestoreFullDynamic(full);
    } else if (item === 'Reels.jsx' || item === 'Reels.tsx') {
      const dynamicReelsCode = `import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Plus, Film, X } from 'lucide-react';
import UploadReel from '../components/UploadReel';

export default function Reels() {
  const [activeTab, setActiveTab] = useState('All');
  const [isMuted, setIsMuted] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMap, setLikedMap] = useState({});
  const [savedMap, setSavedMap] = useState({});

  const categories = ['All', 'Mammals', 'Birds', 'Aquatic', 'Reptiles', 'Small Creatures'];

  const PROJECT_ID = "happy-fd1bc";
  const FIREBASE_API_KEY = "AIzaSyB3RzIrVl0xGtmin3RMDxKhyA6eMtgWN4";

  // Fetch real dynamic Reels from Firestore
  useEffect(() => {
    async function fetchReels() {
      try {
        const url = \`https://firestore.googleapis.com/v1/projects/\${PROJECT_ID}/databases/(default)/documents/reels?key=\${FIREBASE_API_KEY}\`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.documents) {
          const parsed = data.documents.map(doc => {
            const fields = doc.fields || {};
            return {
              id: doc.name.split('/').pop(),
              title: fields.caption?.stringValue || fields.title?.stringValue || 'Wildlife Reel',
              videoUrl: fields.videoUrl?.stringValue || fields.url?.stringValue || 'https://assets.mixkit.co/videos/preview/mixkit-lion-walking-in-a-field-42540-large.mp4',
              author: fields.author?.stringValue || fields.username?.stringValue || 'WildLingo',
              followers: fields.followers?.stringValue || '120 followers',
              likes: parseInt(fields.likes?.integerValue || fields.likes?.stringValue || '42'),
              comments: parseInt(fields.comments?.integerValue || fields.comments?.stringValue || '8'),
              category: fields.category?.stringValue || 'Mammals'
            };
          });
          setReels(parsed);
        } else {
          // Fallback initial reel if firestore collection is empty
          setReels([{
            id: 'default-1',
            title: 'Majestic Wild Lion in Safari',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-lion-walking-in-a-field-42540-large.mp4',
            author: 'WildLingo',
            followers: '120 followers',
            likes: 124,
            comments: 18,
            category: 'Mammals'
          }]);
        }
      } catch (err) {
        console.error("Error fetching reels:", err);
      }
    }
    fetchReels();
  }, []);

  const filteredReels = activeTab === 'All' 
    ? reels 
    : reels.filter(r => r.category.toLowerCase() === activeTab.toLowerCase());

  const currentReel = filteredReels[currentIndex] || reels[0];

  const toggleLike = (id) => {
    setLikedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id) => {
    setSavedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-black text-white relative overflow-hidden select-none">
      {/* Top Controls Header */}
      <div className="w-full flex flex-col bg-gradient-to-b from-black/90 via-black/50 to-transparent z-30 shrink-0">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-emerald-400" />
            <h1 className="text-base font-bold tracking-wide">Wildlife Reels</h1>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg transition"
          >
            <Plus size={14} /> Upload
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-2.5 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveTab(cat); setCurrentIndex(0); }}
              className={\`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition \${
                activeTab === cat 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Full-Screen Reel Player */}
      {currentReel ? (
        <div className="flex-1 relative w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
          <video
            src={currentReel.videoUrl}
            className="w-full h-full object-cover"
            loop
            playsInline
            autoPlay
            muted={isMuted}
            onClick={() => setIsMuted(!isMuted)}
          />

          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white z-20 hover:bg-black/80 transition"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Bottom Caption & User Details */}
          <div className="absolute bottom-6 left-4 right-16 z-20 text-white drop-shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-400">
                WL
              </div>
              <div>
                <p className="font-bold text-sm flex items-center gap-1">
                  @{currentReel.author}
                  <span className="text-emerald-400 text-xs">✓</span>
                </p>
                <p className="text-[11px] text-zinc-300 font-medium">{currentReel.followers}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-100 font-normal leading-relaxed">{currentReel.title}</p>
          </div>

          {/* Right Action Icons Stack */}
          <div className="absolute bottom-6 right-3 z-20 flex flex-col items-center gap-4">
            <button onClick={() => toggleLike(currentReel.id)} className="flex flex-col items-center gap-1">
              <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm active:scale-90 transition">
                <Heart className={\`w-6 h-6 \${likedMap[currentReel.id] ? 'fill-red-500 text-red-500' : 'text-white'}\`} />
              </div>
              <span className="text-[11px] font-semibold">{likedMap[currentReel.id] ? currentReel.likes + 1 : currentReel.likes}</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm active:scale-90 transition">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-semibold">{currentReel.comments}</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm active:scale-90 transition">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </button>

            <button onClick={() => toggleSave(currentReel.id)} className="flex flex-col items-center gap-1">
              <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm active:scale-90 transition">
                <Bookmark className={\`w-6 h-6 \${savedMap[currentReel.id] ? 'fill-emerald-400 text-emerald-400' : 'text-white'}\`} />
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-2">
          <Film className="w-10 h-10 stroke-1" />
          <p className="text-sm">No reels found in this category</p>
        </div>
      )}

      {/* Upload Modal Drawer */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-full z-10"
            >
              <X size={20} />
            </button>
            <div className="p-4">
              {UploadReel ? (
                <UploadReel onClose={() => setShowUploadModal(false)} />
              ) : (
                <div className="text-center py-6">
                  <p className="text-white text-sm font-semibold mb-2">Upload Wildlife Reel</p>
                  <input type="file" accept="video/*" className="text-xs text-zinc-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;
      fs.writeFileSync(full, dynamicReelsCode, 'utf8');
      console.log(`✅ Fully restored dynamic backend-connected Reels component at: ${full}`);
    }
  }
}

findAndRestoreFullDynamic('.');
