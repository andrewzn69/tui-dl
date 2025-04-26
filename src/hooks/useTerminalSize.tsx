import { useState, useEffect } from 'react';

/**
 * Custom hook to track terminal dimensions and listen for resize events
 * @returns {Object} width and height of the terminal
 */

export function useTerminalSize() {
	// set init size
	const [size, setSize] = useState({
		width: process.stdout.columns || 80,
		height: process.stdout.rows || 24,
	});

	useEffect(() => {
		const handleResize = () => {
			setSize({
				width: process.stdout.columns || 80,
				height: process.stdout.rows || 24,
			});
		};

		process.stdout.on('resize', handleResize);

		handleResize();

		return () => {
			process.stdout.removeListener('resize', handleResize);
		};
	}, []);

	return size;
}
