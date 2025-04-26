import React from 'react';
import { Box, Text } from 'ink';
import { DownloadItem as DownloadItemType } from '../../types/index.js';
import { DownloadItem } from './DownloadItem.js';

interface DownloadListProps {
	downloads: DownloadItemType[];
	selectedIndex: number;
	height: number;
	width: number;
}

export const DownloadList: React.FC<DownloadListProps> = ({ downloads, selectedIndex, height, width }) => {
	return (
		<Box borderStyle='round' borderColor='green' height={height} width={width}>
			{downloads.length === 0 ? (
				<Box justifyContent='center' alignItems='center'>
					<Text>No downloads. Press A to add a new download.</Text>
				</Box>
			) : (
				<Box flexDirection='column'>
					{downloads.map((item, index) => (
						<DownloadItem key={item.id} item={item} isSelected={selectedIndex === index} />
					))}
				</Box>
			)}
		</Box>
	);
};
