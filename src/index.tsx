import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

// Download item interface
interface DownloadItem {
	id: number;
	url: string;
	filename: string;
	status: 'queued' | 'downloading' | 'paused' | 'completed' | 'error';
	progress: number; // 0 to 100
	speed: number; // bytes per second
	error?: string;
}

// Download manager class
class DownloadManager {
	private downloads: DownloadItem[] = [];
	private activeDownload: DownloadItem | null = null;
	private cancelToken: AbortController | null = null;

	addDownload(url: string, outputDir: string): DownloadItem {
		const filename = path.basename(new URL(url).pathname) || `download-${Date.now()}`;
		const id = this.downloads.length + 1;
		const item: DownloadItem = {
			id,
			url,
			filename: path.join(outputDir, filename),
			status: 'queued',
			progress: 0,
			speed: 0,
		};
		this.downloads.push(item);
		return item;
	}

	async startDownload(item: DownloadItem, onUpdate: (item: DownloadItem) => void) {
		if (this.activeDownload) {
			return;
		}
		this.activeDownload = item;
		item.status = 'downloading';
		this.cancelToken = new AbortController();

		try {
			const response: AxiosResponse = await axios({
				method: 'get',
				url: item.url,
				responseType: 'stream',
				signal: this.cancelToken.signal,
			});

			const totalLength = parseInt(response.headers['content-length'] || '0', 10);
			let downloadedLength = 0;
			const startTime = Date.now();

			const outputDir = path.dirname(item.filename);
			if (!(await exists(outputDir))) {
				await mkdir(outputDir, { recursive: true });
			}

			const writer = fs.createWriteStream(item.filename);

			response.data.on('data', (chunk: Buffer) => {
				downloadedLength += chunk.length;
				const progress = totalLength ? (downloadedLength / totalLength) * 100 : 0;
				const elapsed = (Date.now() - startTime) / 1000; // seconds
				const speed = downloadedLength / elapsed; // bytes per second

				item.progress = Math.min(progress, 100);
				item.speed = speed;
				item.status = 'downloading';
				onUpdate(item);
			});

			await new Promise<void>((resolve, reject) => {
				response.data.pipe(writer);
				writer.on('finish', () => {
					item.status = 'completed';
					item.progress = 100;
					onUpdate(item);
					resolve();
				});
				writer.on('error', (err) => {
					item.status = 'error';
					item.error = err.message;
					onUpdate(item);
					reject(err);
				});
			});
		} catch (err: any) {
			if (err.name === 'AbortError') {
				item.status = 'paused';
			} else {
				item.status = 'error';
				item.error = err.message;
			}
			onUpdate(item);
		} finally {
			this.activeDownload = null;
			this.cancelToken = null;
		}
	}

	pauseDownload(item: DownloadItem) {
		if (item === this.activeDownload && this.cancelToken) {
			this.cancelToken.abort();
		}
	}

	resumeDownload(item: DownloadItem, onUpdate: (item: DownloadItem) => void) {
		if (item.status === 'paused') {
			this.startDownload(item, onUpdate);
		}
	}

	getDownloads(): DownloadItem[] {
		return this.downloads;
	}
}

// Progress bar component
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
	const width = 20;
	const filled = Math.round((progress / 100) * width);
	const bar = '█'.repeat(filled) + '-'.repeat(width - filled);
	return (
		<Text>
			{bar} {progress.toFixed(1)}%
		</Text>
	);
};

// Main app component
const App: React.FC<{ initialUrl?: string }> = ({ initialUrl }) => {
	const { exit } = useApp();
	const [downloads, setDownloads] = useState<DownloadItem[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [inputUrl, setInputUrl] = useState<string>('');
	const [isAddingUrl, setIsAddingUrl] = useState(false);
	const manager = new DownloadManager();

	useEffect(() => {
		if (initialUrl) {
			const item = manager.addDownload(initialUrl, './downloads');
			setDownloads(manager.getDownloads());
			manager.startDownload(item, () => {
				setDownloads([...manager.getDownloads()]);
			});
		}
	}, [initialUrl]);

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
		}
	});

	const handleAddDownload = (url: string) => {
		const item = manager.addDownload(url, './downloads');
		setDownloads([...manager.getDownloads()]);
		manager.startDownload(item, () => {
			setDownloads([...manager.getDownloads()]);
		});
	};

	const handlePause = (item: DownloadItem) => {
		manager.pauseDownload(item);
		setDownloads([...manager.getDownloads()]);
	};

	const handleResume = (item: DownloadItem) => {
		manager.resumeDownload(item, () => {
			setDownloads([...manager.getDownloads()]);
		});
	};

	return (
		<Box flexDirection='column' padding={1}>
			<Text bold={true}>TUI Download Manager</Text>
			<Text dimColor={true}>Press Ctrl+C to exit, or add URLs via command line</Text>
			<Text dimColor={true}>Use Up/Down to select, P to pause, R to resume</Text>
			<Box marginTop={1} flexDirection='column'>
				{downloads.length === 0 ? (
					<Text>No downloads. Run `tui-dl [url]` to start.</Text>
				) : (
					downloads.map((item, index) => (
						<Box key={item.id} flexDirection='column' marginBottom={1}>
							<Text>
								{selectedIndex === index ? (
									<Text color='cyan'>▶</Text>
								) : (
									<Text color='gray'>◼</Text>
								)}
								{item.filename} ({item.status})
							</Text>
							<ProgressBar progress={item.progress} />
							<Text>Speed: {(item.speed / 1024).toFixed(2)} KB/s</Text>
							{item.status === 'error' && <Text color='red'>Error: {item.error}</Text>}
							{item.status === 'downloading' && <Text color='yellow'>[P]ause</Text>}
							{item.status === 'paused' && <Text color='green'>[R]esume</Text>}
						</Box>
					))
				)}
			</Box>
		</Box>
	);
};

// parse command line args
const [, , url] = process.argv;

render(<App initialUrl={url} />);
