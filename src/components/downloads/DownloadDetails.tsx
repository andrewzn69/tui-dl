import React from 'react';
import { Box, Text } from 'ink';

interface SidebarProps {
	height: number;
	width: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ height, width }) => {
	return (
		<Box
			borderStyle='round'
			borderColor='blue'
			height={height}
			width={width}
			flexDirection='column'
			padding={1}
		>
			<Text>sidebar content</Text>
		</Box>
	);
};
