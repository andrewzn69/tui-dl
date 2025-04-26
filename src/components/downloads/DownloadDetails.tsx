import React from 'react';
import { Box, Text } from 'ink';

interface DownloadDetailsProps {
	height: number;
	width: number;
}

export const DownloadDetails: React.FC<DownloadDetailsProps> = ({ height, width }) => {
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
