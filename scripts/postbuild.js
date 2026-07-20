const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "client", "dist");
const dest = path.join(__dirname, "..", "dist");

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(src)) {
  // Clean target directory if it exists
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  copyDir(src, dest);
  console.log(`[postbuild] Copied build output from ${src} to ${dest}`);
} else {
  console.error(`[postbuild] Source directory ${src} not found!`);
  process.exit(1);
}
