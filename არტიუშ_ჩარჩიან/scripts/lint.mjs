import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const scan = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? scan(join(directory, entry.name)) : [join(directory, entry.name)]);
const files = scan('src');
const violations = files.filter(file => /\.(?:ts|tsx|mts|cts)$/.test(file)).map(file => `${file}: TypeScript source remains`);
for (const file of files.filter(file => /\.(?:js|mjs|cjs)$/.test(file))) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}
if (existsSync('src/main.tsx')) violations.push('src/main.tsx: legacy entrypoint must be removed');
if (!existsSync('src/app.jsx')) violations.push('src/app.jsx: application entrypoint is missing');
if (!readFileSync('index.html', 'utf8').includes('/src/app.jsx')) violations.push('index.html: application entrypoint reference is missing');
if (violations.length) { console.error(violations.join('\n')); process.exit(1); }
console.log(`JavaScript checks passed for ${files.length} source files.`);
