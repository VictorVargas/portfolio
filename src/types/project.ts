export interface ProjectData {
	slug: string;
	title: string;
	summary: string;
	status: 'live' | 'archived' | 'wip';
	stack: string[];
	demoUrl?: string;
	repoUrl?: string;
	date: string;
	image?: string;
}
