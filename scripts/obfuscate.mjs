import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const assetsDir = resolve('dist/assets');
if (!readdirSync(assetsDir, { withFileTypes: true }).length) process.exit(0);

for (const entry of readdirSync(assetsDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
  const file = resolve(assetsDir, entry.name);
  const source = readFileSync(file, 'utf8');
  const result = JavaScriptObfuscator.obfuscate(source, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    identifierNamesGenerator: 'hexadecimal',
    stringArray: true,
    stringArrayThreshold: 0.75,
    sourceMap: false
  });
  writeFileSync(file, result.getObfuscatedCode(), 'utf8');
  console.log(`Obfuscated ${entry.name}`);
}
