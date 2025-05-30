import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput, useStdin } from 'ink';
import { Footer } from './ui/Footer.js';
import { useDownloadManager } from '../hooks/useDownloadManager.js';
import { SpeedGraph } from './SpeedGraph.js';
import { DownloadRow } from './downloads/DownloadRow.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';

// minimum height and width for the app
const MIN_WIDTH = 80;
const MIN_HEIGHT = 24;

interface AppProps {
	initialUrl?: string;
}

export const App: React.FC<AppProps> = ({ initialUrl }) => {
	const { exit } = useApp();
	const { isRawModeSupported } = useStdin();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [inputUrl, setInputUrl] = useState('');
	const [isAddingUrl, setIsAddingUrl] = useState(false);
	const [showWarning, setShowWarning] = useState(false);

	const { downloads, handleAddDownload, handlePause, handleResume } = useDownloadManager(initialUrl);

	const { width, height } = useTerminalSize();

	useEffect(() => {
		process.stdout.write('\x1Bc');

		if (width < MIN_WIDTH || height < MIN_HEIGHT) {
			setShowWarning(true);
		} else {
			setShowWarning(false);
		}
	}, [width, height]);

	const footerHeight = 3; // footer has 3 height
	const availableHeight = height - footerHeight; // available height for the graph and downloads list

	const graphHeight = Math.floor(availableHeight * 0.25); // 25% for graph
	const downloadsHeight = availableHeight - graphHeight; // remaining 75% for downloads row

	// keyboard input
	useInput((input, key) => {
		if (isAddingUrl) {
			if (key.return) {
				if (inputUrl.trim()) {
					handleAddDownload(inputUrl.trim());
					setInputUrl('');
				}
				setIsAddingUrl(false);
			} else if (key.escape) {
				setIsAddingUrl(false);
				setInputUrl('');
			} else if (key.backspace || key.delete) {
				setInputUrl((prev) => prev.slice(0, -1));
			} else if (input && !key.ctrl && !key.meta) {
				setInputUrl((prev) => prev + input);
			}
		} else if (key.upArrow) {
			setSelectedIndex((prev) => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setSelectedIndex((prev) => Math.min(downloads.length - 1, prev + 1));
		} else if (input === 'p') {
			const item = downloads[selectedIndex];
			if (item && item.status === 'downloading') {
				handlePause(item);
			}
		} else if (input === 'r') {
			const item = downloads[selectedIndex];
			if (item && item.status === 'paused') {
				handleResume(item);
			}
		} else if (input === 'a') {
			setIsAddingUrl(true);
		} else if (input === 'q' || (key.ctrl && input === 'c')) {
			exit();
		}
	});

	if (!isRawModeSupported) {
		return <Text>Terminal does not support raw mode</Text>;
	}

	if (showWarning) {
		const warningHeight = 5;
		const topPadding = Math.max(0, Math.floor((height - warningHeight) / 2));

		return (
			<Box flexDirection='column' alignItems='center' width={width} height={height}>
				{/* empty box for top padding to have vertical centering */}
				<Box height={topPadding} />

				{/* warning box */}
				<Box flexDirection='column' alignItems='center'>
					<Text bold={true} color='whiteBright'>
						Terminal size too small:
					</Text>
					<Box marginBottom={1}>
						<Text bold={true} color='whiteBright'>
							Width ={' '}
						</Text>
						<Text bold={true} color={width < MIN_WIDTH ? 'red' : 'green'}>
							{width}
						</Text>
						<Text bold={true} color='whiteBright'>
							{' '}
							Height ={' '}
						</Text>
						<Text bold={true} color={width < MIN_HEIGHT ? 'red' : 'green'}>
							{height}
						</Text>
					</Box>
					<Text bold={true} color='whiteBright'>
						Needed:
					</Text>
					<Text
						bold={true}
						color='whiteBright'
					>{`Width >=${MIN_WIDTH} Height >=${MIN_HEIGHT}`}</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection='column'>
			<SpeedGraph height={graphHeight} />

			{/* url input (when active) */}
			{/*
			{isAddingUrl && (
				<AddDownloadForm
					inputUrl={inputUrl}
					onCancel={() => {
						setIsAddingUrl(false);
						setInputUrl('');
					}}
				/>
			)}
			*/}

			{/* downloads list */}
			<DownloadRow
				height={downloadsHeight}
				width={width}
				downloads={downloads}
				selectedIndex={selectedIndex}
			/>

			{/* footer */}
			<Footer />
		</Box>
	);
};
