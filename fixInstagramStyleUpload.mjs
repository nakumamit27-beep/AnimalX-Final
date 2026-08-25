import fs from 'fs';
import path from 'path';

// Search and fix UploadReel & Reels pages in artifact directory
const artifactDir = './artifacts/animal-x/src';

// 1. Update UploadReel.jsx
const uploadPath = path.join(artifactDir, 'components/UploadReel.jsx');
if (fs.existsSync(uploadPath)) {
  let content = fs.readFileSync(uploadPath, 'utf8');

  // Ensure file input is primary and handles base64 / blob object storage URL properly
  content = content.replace(/accept="[^"]*"/g, 'accept="video/mp4,video/webm,video/quicktime,video/*"');
  
  fs.writeFileSync(uploadPath, content, 'utf8');
  console.log("✅ Updated UploadReel.jsx for direct video file picking!");
}

// 2. Update Reels.jsx UI to match Instagram Reels (Full screen, Object-cover, Touch control)
const reelsPath = path.join(artifactDir, 'pages/Reels.jsx');
if (fs.existsSync(reelsPath)) {
  let content = fs.readFileSync(reelsPath, 'utf8');

  // Fix video element styling to be full Instagram style
  content = content.replace(
    /<video[\s\S]*?>/g,
    `<video
      src={reel.videoUrl || reel.url || reel.video}
      className="w-full h-full object-cover rounded-none"
      loop
      playsInline
      autoPlay
      muted
      onClick={(e) => {
        if (e.target.paused) e.target.play();
        else e.target.pause();
      }}`
  );

  fs.writeFileSync(reelsPath, content, 'utf8');
  console.log("✅ Updated Reels.jsx to Instagram full-screen video player!");
}

