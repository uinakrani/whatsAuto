// Script to generate PWA icons
// Run with: node scripts/generate-icons.js
// Requires: canvas package (npm install canvas)

const fs = require('fs');
const path = require('path');

// Simple SVG to create icons
const createIconSVG = (size) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0ea5e9" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">WA</text>
</svg>`;
};

// Create public directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG icons (these will be converted to PNG by the build process or manually)
const icon192 = createIconSVG(192);
const icon512 = createIconSVG(512);

fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), icon512);

console.log('Icon SVGs created!');
console.log('Note: Convert these to PNG format for production use.');
console.log('You can use an online converter or ImageMagick:');
console.log('  convert icon-192x192.svg icon-192x192.png');
console.log('  convert icon-512x512.svg icon-512x512.png');

