import { useState, useMemo, useCallback } from 'react';
import Hero from './Hero';
import Chat from './Chat';
import ProjectGrid from './ProjectGrid';
import type { ProjectData } from '../types/project';

interface Props {
	projects: ProjectData[];
}

export default function LandingExperience({ projects }: Props) {
	const [currentSources, setCurrentSources] = useState<string[]>([]);
	const [hasUserAsked, setHasUserAsked] = useState(false);
	const [chatKey, setChatKey] = useState(0);

	const projectsBySlug = useMemo(() => {
		const map = new Map<string, ProjectData>();
		for (const p of projects) map.set(p.slug, p);
		return map;
	}, [projects]);

	const matched = useMemo(() => {
		return currentSources
			.map((slug) => projectsBySlug.get(slug))
			.filter((p): p is ProjectData => Boolean(p));
	}, [currentSources, projectsBySlug]);

	const handleSources = useCallback((documents: string[]) => {
		setCurrentSources(documents);
	}, []);

	const handleUserMessage = useCallback(() => {
		setHasUserAsked(true);
	}, []);

	const resetEverything = useCallback(() => {
		setCurrentSources([]);
		setHasUserAsked(false);
		setChatKey((k) => k + 1);
	}, []);

	const showBottomGrid = !hasUserAsked || matched.length === 0;

	return (
		<>
			<Hero matched={matched} onAllProjects={resetEverything} />

			<section className="border-b border-neutral-900">
				<div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
					<div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5">
						<div>
							<p className="font-mono text-xs uppercase tracking-wider text-accent">
								Chat with Rony
							</p>
							<h2 className="mt-1 text-xl font-semibold text-text-primary sm:text-2xl">
								Ask anything about Victor's work.
							</h2>
						</div>
						{hasUserAsked && (
							<button
								type="button"
								onClick={resetEverything}
								className="font-mono text-xs text-text-secondary transition hover:text-accent sm:text-sm"
							>
								Reset chat
							</button>
						)}
					</div>
					<Chat
						key={chatKey}
						collapsed={!hasUserAsked}
						onSources={handleSources}
						onUserMessage={handleUserMessage}
					/>
				</div>
			</section>

			{showBottomGrid && (
				<ProjectGrid
					title="All projects"
					projects={projects}
					highlightAccent={hasUserAsked}
				/>
			)}
		</>
	);
}
