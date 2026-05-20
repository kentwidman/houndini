const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src', 'manifest.json'), 'utf8'));
const version = manifest.version;
const outFile = path.join(root, 'releases', `${version}_houndini.zip`);

if (fs.existsSync(outFile)) {
  fs.unlinkSync(outFile);
}

execSync(`zip -r "${outFile}" .`, { cwd: path.join(root, 'src'), stdio: 'inherit' });

console.log(`Built releases/${version}_houndini.zip`);
