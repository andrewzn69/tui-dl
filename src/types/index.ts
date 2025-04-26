export interface DownloadItem {
	id: number;
	url: string;
	filename: string;
	status: 'queued' | 'downloading' | 'paused' | 'completed' | 'error';
	progress: number;
	speed: number;
	error?: string;
}
