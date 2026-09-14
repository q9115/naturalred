# THE LAST HAIR realtime server

Authoritative Cloudflare Durable Objects / WebSocket server for the existing game. worker.js is a readable esbuild bundle of the game repository cloudflare/worker.ts and its pure simulation dependencies; source module paths are retained as section comments. arena.test.js bundles 23 source regressions. This browser-upload package keeps files at repository root. Future changes should regenerate these bundles from the main game source, not apply conflicting independent edits.

Workers Builds settings: main, root /, npm run build, npm run deploy; previews off. Set REALTIME_SECRET as a Cloudflare runtime secret before connecting the existing Sites backend. Never commit credentials. Worker name: the-last-hair-realtime. The game frontend remains separately deployed. Check the exact Git commit in Workers Builds and live WebSocket gameplay before calling deployment complete.
