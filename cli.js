#!/usr/bin/env node

// clear screen
process.stdout.write('\x1b[2J\x1b[0f');

import('./dist/index.js').catch((err) => {
	console.error(err);
	process.exit(1);
});
