import ProjectCard from './ProjectCard';
import type { ProjectData } from '../types/project';

interface Props {
	title: string;
	projects: ProjectData[];
	highlightAccent?: boolean;
}

export default function ProjectGrid({ title, projects, highlightAccent = false }: Props) {
	if (projects.length === 0) return null;

	return (
		<section className="border-t border-neutral-900">
			<div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
				<header className="mb-6 flex items-baseline justify-between gap-4 sm:mb-8">
					<h2
						className={
							highlightAccent
								? 'font-mono text-xs uppercase tracking-wider text-accent'
								: 'text-xl font-semibold text-text-primary sm:text-2xl'
						}
					>
						{title}
					</h2>
					{highlightAccent && (
						<a
							href="/proyectos"
							className="font-mono text-xs text-text-secondary hover:text-accent"
						>
							All projects →
						</a>
					)}
				</header>
				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{projects.map((project) => (
						<li key={project.slug}>
							<ProjectCard project={project} variant="compact" />
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
