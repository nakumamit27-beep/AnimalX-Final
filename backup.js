const fs = require('fs');
const path = require('path');
const https = require('https');

// Replit bucket ka web API endpoint ya folder access karne ka tareeka
const mediaDir = path.join(__dirname, 'media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir);
}

// Since dashboard se direct files list karne ke liye hum fetch API use kar sakte hain agar URL ho,
// Lekin sabse aasan aur final rasta yeh hai ki hum Replit storage client ko bypass karke 
// direct fetch karein agar port available ho. 
// Par agar aapko saari files turant chahiye, toh aap Replit ke App Storage tab se 
// manually bhi zip download kar sakte hain ya ek-ek karke select kar sakte hain.
console.log("Aap Replit ke App Storage panel se direct 'Download folder' ya files select karke bhi kar sakte hain.");
