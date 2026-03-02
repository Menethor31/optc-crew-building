import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-optc-bg-light border-t border-optc-border mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-optc-text-secondary text-sm text-center sm:text-left">
            <p>
              <span className="font-semibold text-optc-text">OPTC Crew Building</span>
              {' '}&mdash; Community tool for One Piece Treasure Cruise
            </p>
            <p className="mt-1">
              Character data from{' '}
              <a
                href="https://2shankz.github.io/optc-db.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-optc-accent hover:text-optc-accent-hover transition-colors"
              >
                OPTC DB
              </a>
              {' '}&bull; Not affiliated with Bandai Namco
            </p>
            <p className="mt-1 text-xs text-optc-text-secondary/70">
              This site does not own any of the images. All images are owned by Eiichiro Oda/Shueisha, Toei Animation, and Bandai Namco.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-optc-text-secondary">
            <Link
              href="/about"
              className="hover:text-optc-text transition-colors"
            >
              About
            </Link>
            <a
              href="https://ko-fi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-optc-text transition-colors"
            >
              Support Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
