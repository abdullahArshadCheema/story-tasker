import { useEffect, useState } from 'react';
import Head from 'next/head';
import { generateTasksClient } from '../lib/generateClient';
import type { Task } from '../types/schema';

// Task type imported from shared schema

export default function Home() {
  const [story, setStory] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWebGPU, setHasWebGPU] = useState<boolean | null>(null);
  const [modelStatus, setModelStatus] = useState<string>('');
  const [modelProgress, setModelProgress] = useState<number>(0);

  useEffect(() => {
    try {
      const supported = typeof navigator !== 'undefined' && 'gpu' in (navigator as any);
      setHasWebGPU(supported);
    } catch {
      setHasWebGPU(false);
    }
  }, []);

  const onGenerate = async () => {
    setError(null);
    setLoading(true);
    setModelStatus('');
    try {
      const data = await generateTasksClient(story, (p) => {
        setModelStatus(p?.text ?? '');
        if (typeof p?.progress === 'number') setModelProgress(Math.max(0, Math.min(1, p.progress)));
      });
      setTasks(data);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Story Tasker</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">Story Tasker</h1>
            <span className="text-xs text-slate-500">Private · Offline · WebGPU</span>
          </header>

          {hasWebGPU === false && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700">
              WebGPU not detected. Use a recent Chrome/Edge/Safari on a supported device for best results.
            </div>
          )}

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="story" className="block text-sm font-medium text-slate-700">
                  Paste your story
                </label>
                <span className="text-[11px] text-slate-400">Try a user story or feature spec</span>
              </div>
              <textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={12}
                placeholder="e.g., As a user, I want to upload photos and organize them into albums so I can quickly find memories later. Add sharing and basic editing."
                className="min-h-[220px] w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={onGenerate}
                  disabled={loading || !story.trim()}
                  className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Generating…
                    </span>
                  ) : (
                    'Generate tasks'
                  )}
                </button>
                {modelStatus && <span className="text-xs text-slate-500">{modelStatus}</span>}
              </div>
              {modelStatus && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-900 transition-all"
                      style={{ width: `${Math.round(modelProgress * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right text-[10px] tabular-nums text-slate-500">
                    {Math.round(modelProgress * 100)}%
                  </div>
                </div>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Runs fully in your browser. First run may download a small model.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-medium">Suggested tasks</h2>
              {error && <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>}
              {tasks.length === 0 && !loading && (
                <p className="mt-3 text-sm text-slate-500">Your tasks will appear here once generated.</p>
              )}
              <ul className="mt-3 space-y-3">
                {tasks.map((t) => (
                  <li key={t.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{t.done ? '✅' : '⬜️'}</span>
                          <h3 className="text-sm font-semibold">{t.title}</h3>
                        </div>
                        {/* description not in current Task schema; omit for now */}
                      </div>
                      {t.priority && (
                        <span className="whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          {t.priority}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
