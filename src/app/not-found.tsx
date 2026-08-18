import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-center">
      <h1 className="text-4xl font-black mb-2">404</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        The requested page or resource could not be found.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xs shadow-md"
      >
        Return to EduWeave Dashboard
      </Link>
    </div>
  );
}
