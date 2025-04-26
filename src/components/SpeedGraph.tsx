import React from 'react';
import { Box, Text } from 'ink';
import { useTerminalSize } from '../hooks/useTerminalSize.js';

interface SpeedGraphProps {
	height: number;
}

export const SpeedGraph: React.FC<SpeedGraphProps> = ({ height = 10 }) => {
	const { width, height: terminalHeight } = useTerminalSize();

	return (
		<Box borderStyle='round' borderColor='blue' height={height} flexDirection='column' padding={1}>
			<Text>Width: {width}</Text>
			<Text>Height: {terminalHeight}</Text>
		</Box>
	);
};
