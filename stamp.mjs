import { readFile, writeFile } from 'node:fs/promises';
const commit = process.env.WORKERS_CI_COMMIT_SHA ?? 'local';
if (commit !== 'local' && !/^[a-f0-9]{40}$/.test(commit)) throw new Error('Invalid build commit');
const path = new URL('./worker.js', import.meta.url);
const source = await readFile(path, 'utf8');
if (!/var BUILD_COMMIT = "[a-z0-9]+";/.test(source)) throw new Error('Build stamp missing');
await writeFile(path, source.replace(/var BUILD_COMMIT = "[a-z0-9]+";/, `var BUILD_COMMIT = "${commit}";`));
