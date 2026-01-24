import { spawn } from 'child_process';
const p = spawn('npx', ['electron-forge', 'package'], { stdio: 'inherit' });
p.on('close', () => {
  const { readdirSync, statSync } = await import('fs');
  const { join } = await import('path');
  function walk(dir, prefix = '') {
    for (const f of readdirSync(dir)) {
      const full = join(dir, f);
      const path = prefix + f;
      if (statSync(full).isDirectory() && !f.includes('node_modules')) {
        console.log(path + '/');
        walk(full, path + '/');
      } else if (!f.includes('node_modules')) {
        console.log(path);
      }
    }
  }
  console.log('\n.vite structure:');
  walk('.vite');
});
