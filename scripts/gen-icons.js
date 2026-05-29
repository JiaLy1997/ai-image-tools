const sharp = require("sharp");
const path = require("path");

async function generateIcon(size, outputPath) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#007aff"/>
  <g transform="translate(${size * 0.5}, ${size * 0.5})">
    <!-- Image icon -->
    <rect x="${-size * 0.28}" y="${-size * 0.22}" width="${size * 0.56}" height="${size * 0.44}" rx="${size * 0.04}" fill="none" stroke="white" stroke-width="${size * 0.035}"/>
    <!-- Mountain -->
    <path d="M${-size * 0.18} ${size * 0.12} L${-size * 0.05} ${-size * 0.06} L${size * 0.08} ${size * 0.12}Z" fill="none" stroke="white" stroke-width="${size * 0.03}" stroke-linejoin="round"/>
    <!-- Sun -->
    <circle cx="${size * 0.14}" cy="${-size * 0.08}" r="${size * 0.04}" fill="none" stroke="white" stroke-width="${size * 0.03}"/>
    <!-- Compress arrows -->
    <path d="M${-size * 0.02} ${size * 0.22} L${size * 0.02} ${size * 0.17}" stroke="white" stroke-width="${size * 0.025}" stroke-linecap="round"/>
    <path d="M${size * 0.02} ${size * 0.22} L${-size * 0.02} ${size * 0.17}" stroke="white" stroke-width="${size * 0.025}" stroke-linecap="round"/>
  </g>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  const publicDir = path.join(__dirname, "..", "public");
  await generateIcon(192, path.join(publicDir, "icon-192.png"));
  await generateIcon(512, path.join(publicDir, "icon-512.png"));
  console.log("Done!");
}

main().catch(console.error);
