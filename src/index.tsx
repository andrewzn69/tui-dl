import React from 'react';
import { render } from 'ink';
import { App } from './components/App.js';

const [, , url] = process.argv;

render(<App initialUrl={url} />, {
	patchConsole: false,
	debug: false,
});
