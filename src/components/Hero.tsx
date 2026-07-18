import ProjectCard from './ProjectCard';
import type { ProjectData } from '../types/project';

interface Props {
	matched: ProjectData[];
	onAllProjects?: () => void;
}

function PlaceholderAvatar({ large }: { large?: boolean }) {
	return (
		<div
			aria-hidden
			className={
				large
					? 'flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-accent/40 via-accent/10 to-bg-tertiary ring-1 ring-accent/30 sm:h-56 sm:w-56'
					: 'flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent/40 via-accent/10 to-bg-tertiary ring-1 ring-accent/30 sm:h-32 sm:w-32'
			}
		>
			<span
				className={
					large
						? 'font-mono text-6xl font-bold text-accent/80 sm:text-7xl'
						: 'font-mono text-4xl font-bold text-accent/80 sm:text-5xl'
				}
			>
				V
			</span>
		</div>
	);
}

function PersonalLayer({ hidden }: { hidden: boolean }) {
	return (
		<div
			aria-hidden={hidden}
			className={
				'transition-opacity duration-700 ease-out ' +
				(hidden
					? 'pointer-events-none absolute inset-x-0 top-12 opacity-0 sm:top-16'
					: 'opacity-100 delay-200')
			}
		>
			<div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
				<div>
					<p className="font-mono text-sm text-accent sm:text-base">Hi, my name is</p>
					<h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
						Victor Hugo Vargas.
					</h1>
					<h2 className="mt-4 text-2xl font-bold text-text-secondary sm:text-3xl">
						I build web products and developer tools.
					</h2>
					<p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg">
						Software engineer focused on pragmatic systems — backends, real-time
						UIs, and the glue in between.
					</p>

					<div className="mt-8 flex flex-wrap gap-3">
						<a
							href="/proyectos"
							className="rounded border border-accent px-5 py-2.5 font-mono text-sm text-accent transition hover:bg-accent/10 sm:text-base"
						>
							View projects →
						</a>
						<a
							href="mailto:hello@example.com"
							className="rounded px-5 py-2.5 font-mono text-sm text-text-secondary transition hover:text-accent sm:text-base"
						>
							Get in touch
						</a>
					</div>
				</div>

				<div className="flex justify-center lg:justify-end">
					<PlaceholderAvatar large />
				</div>
			</div>
		</div>
	);
}

function MatchedLayer({
	matched,
	hidden,
	onAllProjects,
}: {
	matched: ProjectData[];
	hidden: boolean;
	onAllProjects?: () => void;
}) {
	return (
		<div
			aria-hidden={hidden}
			className={
				'transition-opacity duration-700 ease-out ' +
				(hidden
					? 'pointer-events-none absolute inset-x-0 top-10 opacity-0 sm:top-12'
					: 'opacity-100 delay-200')
			}
		>
			<header className="mb-4 flex items-baseline justify-between gap-4">
				<p className="font-mono text-xs uppercase tracking-wider text-accent">
					{matched.length === 1
						? 'Project in focus'
						: `Matched projects (${matched.length})`}
				</p>
				{onAllProjects && (
					<button
						type="button"
						onClick={onAllProjects}
						className="font-mono text-xs text-text-secondary transition hover:text-accent"
					>
						All projects →
					</button>
				)}
			</header>

			{matched.length === 1 ? (
				<div className="rounded-lg border border-accent/40 bg-bg-secondary p-4 sm:p-5">
					<ProjectCard project={matched[0]} variant="compact" />
				</div>
			) : (
				<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{matched.slice(0, 3).map((p) => (
						<li key={p.slug}>
							<ProjectCard project={p} variant="compact" />
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default function Hero({ matched, onAllProjects }: Props) {
	const isPersonal = matched.length === 0;

	return (
		<section className="border-b border-neutral-900">
			<div className="relative mx-auto max-w-6xl px-6 py-8 sm:min-h-[400px] sm:py-12">
				<PersonalLayer hidden={!isPersonal} />
				<MatchedLayer matched={matched} hidden={isPersonal} onAllProjects={onAllProjects} />
			</div>
		</section>
	);
}
