import Link from 'next/link';
import { site } from '@/lib/site';

const FEATURES = [
  {
    title: 'Every project in one place',
    body: 'Create projects, keep descriptions current, and archive finished work without losing it. Search finds anything in a keystroke.',
  },
  {
    title: 'Organizations for every team',
    body: 'Run separate workspaces for each company, client or department, and switch between them from the sidebar.',
  },
  {
    title: 'Roles that match how you work',
    body: 'Owners, admins and members each get the access they need. Only the right people can delete work or manage the team.',
  },
  {
    title: 'Isolated by design',
    body: 'Every record is scoped to its organization at the database layer, so one workspace can never read another’s data.',
  },
];

const STEPS = [
  { title: 'Create your account', body: 'Sign up and name your first organization. It takes under a minute.' },
  { title: 'Add your team', body: 'Bring teammates in by email and give each of them a role.' },
  { title: 'Start shipping', body: 'Create projects, track what is active, and archive what is done.' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: site.name,
  url: site.url,
  description: site.description,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-gradient-to-b from-indigo-50 to-white" />
        <div className="mx-auto max-w-4xl px-4 pt-20 pb-24 text-center sm:px-6 sm:pt-28">
          <p className="mx-auto w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Projects · Teams · Roles
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-6xl">
            Projects and teams in one shared workspace
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-slate-600">{site.description}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="rounded-md px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 ring-inset hover:bg-slate-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 id="features" className="text-center text-3xl font-semibold tracking-tight text-slate-900">
          Everything your team needs to stay in sync
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="rounded-xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <h3 className="font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="how" className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="how" className="text-center text-3xl font-semibold tracking-tight text-white">
            Up and running in three steps
          </h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="flex size-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Bring your team together today</h2>
        <p className="mt-4 text-slate-600">Create a workspace in under a minute.</p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Create your workspace
        </Link>
      </section>
    </>
  );
}
