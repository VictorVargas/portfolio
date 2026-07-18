import type { ProjectData } from '../types/project';

const statusLabel: Record<ProjectData['status'], string> = {
	live: 'Live',
	archived: 'Archived',
	wip: 'In progress',
};

const statusTone: Record<ProjectData['status'], string> = {
	live: 'bg-success/20 text-success',
	archived: 'bg-bg-tertiary text-text-secondary',
	wip: 'bg-accent/15 text-accent',
};

interface Props {
	project: ProjectData;
	variant?: 'compact' | 'hero';
}

function ProjectThumbnail({ project, size }: { project: ProjectData; size: 'sm' | 'lg' }) {
	const initial = project.title.charAt(0).toUpperCase();
	const sizeClasses =
		size === 'lg'
			? 'h-40 w-full sm:h-52'
			: 'h-20 w-20 shrink-0 sm:h-24 sm:w-24';

	if (project.image) {
		return (
			<img
				src={project.image}
				alt={project.title}
				className={
					size === 'lg'
						? 'h-40 w-full rounded-md object-cover sm:h-52'
						: 'h-20 w-20 shrink-0 rounded-md object-cover sm:h-24 sm:w-24'
				}
				loading="lazy"
			/>
		);
	}

	return (
		<div
			aria-hidden
			className={`flex ${sizeClasses} items-center justify-center rounded-md bg-gradient-to-br from-accent/30 via-accent/10 to-bg-tertiary ring-1 ring-accent/20`}
		>
			<span className="font-mono text-2xl font-bold text-accent/80 sm:text-3xl">
				{initial}
			</span>
		</div>
	);
}

export default function ProjectCard({ project, variant = 'compact' }: Props) {
	const isHero = variant === 'hero';

	if (isHero) {
		return (
			<article className="rounded-lg border border-accent/30 bg-bg-secondary p-6 transition sm:p-8">
				<ProjectThumbnail project={project} size="lg" />

				<header className="mt-6 flex flex-wrap items-center gap-3">
					<span
						className={`rounded-full px-2.5 py-0.5 font-mono text-xs ${statusTone[project.status]}`}
					>
						{statusLabel[project.status]}
					</span>
					<time className="font-mono text-xs text-text-secondary" dateTime={project.date}>
						{new Date(project.date).toLocaleDateString('en', {
							year: 'numeric',
							month: 'short',
						})}
					</time>
				</header>

				<h3 className="mt-4 text-3xl font-bold text-text-primary">
					<a href={`/proyectos/${project.slug}`} className="transition hover:text-accent">
						{project.title}
					</a>
				</h3>

				{project.summary && (
					<p className="mt-3 text-base text-text-secondary sm:text-lg">{project.summary}</p>
				)}

				{project.stack.length > 0 && (
					<ul className="mt-5 flex flex-wrap gap-2">
						{project.stack.map((tech) => (
							<li
								key={tech}
								className="rounded bg-bg-tertiary px-2 py-0.5 font-mono text-xs text-text-secondary"
							>
								{tech}
							</li>
						))}
					</ul>
				)}

				<div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
					{project.demoUrl && (
						<a
							href={project.demoUrl}
							className="text-accent hover:underline"
							rel="noopener noreferrer"
							target="_blank"
						>
							Live demo ↗
						</a>
					)}
					{project.repoUrl && (
						<a
							href={project.repoUrl}
							className="text-accent hover:underline"
							rel="noopener noreferrer"
							target="_blank"
						>
							Source ↗
						</a>
					)}
					<a
						href={`/proyectos/${project.slug}`}
						className="text-text-secondary hover:text-accent"
					>
						Details →
					</a>
				</div>
			</article>
		);
	}

	return (
		<article className="flex h-full gap-4 rounded-lg border border-neutral-800 bg-bg-secondary p-4 transition hover:border-accent/50">
			<ProjectThumbnail project={project} size="sm" />
			<div className="flex min-w-0 flex-1 flex-col">
				<header className="mb-2 flex flex-wrap items-center gap-2">
					<span
						className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${statusTone[project.status]}`}
					>
						{statusLabel[project.status]}
					</span>
					<time
						className="font-mono text-[10px] text-text-secondary"
						dateTime={project.date}
					>
						{new Date(project.date).toLocaleDateString('en', {
							year: 'numeric',
							month: 'short',
						})}
					</time>
				</header>

				<h3 className="text-base font-semibold text-text-primary">
					<a href={`/proyectos/${project.slug}`} className="transition hover:text-accent">
						{project.title}
					</a>
				</h3>

				{project.summary && (
					<p className="mt-1 line-clamp-3 text-xs text-text-secondary sm:text-sm">
						{project.summary}
					</p>
				)}

				{project.stack.length > 0 && (
					<ul className="mt-3 flex flex-wrap gap-1.5">
						{project.stack.slice(0, 4).map((tech) => (
							<li
								key={tech}
								className="rounded bg-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary"
							>
								{tech}
							</li>
						))}
					</ul>
				)}

				<div className="mt-auto flex flex-wrap gap-3 pt-3 font-mono text-[11px]">
					{project.demoUrl && (
						<a
							href={project.demoUrl}
							className="text-accent hover:underline"
							rel="noopener noreferrer"
							target="_blank"
						>
							Demo ↗
						</a>
					)}
					{project.repoUrl && (
						<a
							href={project.repoUrl}
							className="text-accent hover:underline"
							rel="noopener noreferrer"
							target="_blank"
						>
							Repo ↗
						</a>
					)}
					<a
						href={`/proyectos/${project.slug}`}
						className="text-text-secondary hover:text-accent"
					>
						Details →
					</a>
				</div>
			</div>
		</article>
	);
}
