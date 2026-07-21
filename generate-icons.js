const fs = require("fs");
const path = require("path");

// Read the logo from App.jsx
const appContent = fs.readFileSync("src/App.jsx", "utf8");
const logoMatch = appContent.match(/const LOGO="data:image\/png;base64,([^"]+)"/);
if (!logoMatch) { console.log("Logo not found"); process.exit(1); }

const base64Data = logoMatch[1];
const buffer = Buffer.from(base64Data, "base64");

// Write the icon files (use same image for both sizes)
fs.writeFileSync(path.join("public", "icon-192.png"), buffer);
fs.writeFileSync(path.join("public", "icon-512.png"), buffer);

console.log("Icons generated: icon-192.png, icon-512.png");
console.log("Size:", buffer.length, "bytes");
