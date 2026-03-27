export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex min-h-14 max-w-4xl items-center justify-center px-4 py-3.5 md:px-8">
        <p className="text-sm leading-snug text-neutral-500 dark:text-neutral-400">
          Made by{" "}
          <a
            href="https://ajeetgupta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-600 hover:decoration-neutral-400 dark:text-neutral-200 dark:decoration-neutral-500 dark:hover:text-neutral-100"
          >
            Ajeet
          </a>
          <span className="text-neutral-400 dark:text-neutral-500"> · </span>
          <a
            href="https://ajeetgupta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          >
            ajeetgupta.com
          </a>
        </p>
      </div>
    </footer>
  );
}
