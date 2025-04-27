import React from 'react';
import { Box } from 'ink';
import { DownloadList } from './DownloadList.js';
import { DownloadItem } from '../../types/index.js';
import { DownloadDetails } from './DownloadDetails.js';

interface DownloadRowProps {
	downloads: DownloadItem[];
	selectedIndex: number;
	height: number;
	width: number;
}

export const DownloadRow: React.FC<DownloadRowProps> = ({ height, width, downloads, selectedIndex }) => {
	const listWidth = Math.floor(width * 0.75);
	const sidebarWidth = width - listWidth;

	return (
		<Box flexDirection='row' height={height}>
			<Box width={listWidth} marginRight={1}>
				<DownloadList
					downloads={downloads}
					selectedIndex={selectedIndex}
					height={height}
					width={listWidth}
				/>
			</Box>

			<Box flexGrow={sidebarWidth}>
				<DownloadDetails height={height} width={sidebarWidth} />
			</Box>
		</Box>
	);
};
