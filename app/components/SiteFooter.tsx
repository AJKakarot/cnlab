export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto flex max-w-4xl min-w-0 flex-col items-center justify-center gap-2 px-4 py-5 text-center sm:px-6 md:px-8 md:py-6">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Computer Networks Lab — syllabus experiments and docs
        </p>
        <p className="max-w-md text-sm leading-snug text-neutral-600 dark:text-neutral-400">
          Made by{" "}
          <a
            href="https://ajeetgupta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-900 underline decoration-neutral-400 underline-offset-2 transition hover:decoration-neutral-600 dark:text-white dark:decoration-neutral-500 dark:hover:text-neutral-100"
          >
            Ajeet
          </a>
          <span className="text-neutral-400 dark:text-neutral-500"> · </span>
          <a
            href="https://ajeetgupta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-800 transition hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
          >
            ajeetgupta.com
          </a>
        </p>
      </div>
    </footer>
  );
}
