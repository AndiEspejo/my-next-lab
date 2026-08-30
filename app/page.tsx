const VERSION = "v1";

// Vercel injects these at build time on every deploy.
// Read on the server so no NEXT_PUBLIC_ prefix is required.
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
const commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE ?? "desarrollo local";
const region = process.env.VERCEL_REGION ?? "—";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-20 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          UdeA · Cloud Computing 2026 · Laboratorio 1
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Hola desde Next.js 🚀
        </h1>

        <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Aplicación Next.js desplegada en Vercel desde un repositorio de
          GitHub. Cada push a la rama <code className="font-mono">main</code>{" "}
          dispara un build y un despliegue automático.
        </p>

        <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
          <Metric label="Versión" value={VERSION} />
          <Metric label="Commit" value={commitSha} />
          <Metric label="Región" value={region} />
        </dl>

        <p className="mt-4 font-mono text-xs text-zinc-500 dark:text-zinc-500">
          {commitMessage}
        </p>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-4 dark:bg-zinc-900">
      <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-base text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}
