import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - OPTC Crew Building',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-optc-text mb-8">About OPTC Crew Building</h1>

      <div className="space-y-6 text-optc-text-secondary leading-relaxed">
        <p>
          <strong className="text-optc-text">OPTC Crew Building</strong> is a community tool
          for players of One Piece Treasure Cruise (OPTC), the hit mobile RPG by Bandai Namco.
        </p>

        <p>
          Inspired by the legendary Nakama Network, this platform aims to provide a modern,
          fast, and feature-rich experience for finding and sharing team strategies.
        </p>

        <h2 className="text-xl font-bold text-optc-text pt-4">Features</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-optc-accent mt-1">●</span>
            <span>Browse stages by type (Raids, Coliseum, Treasure Map, Kizuna Clash, Arena, and more)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-optc-accent mt-1">●</span>
            <span>Search and filter to quickly find the content you need</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-optc-text-secondary mt-1">○</span>
            <span>Share teams with step-by-step guides (coming soon)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-optc-text-secondary mt-1">○</span>
            <span>Manage your box and find teams you can build (coming soon)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-optc-text-secondary mt-1">○</span>
            <span>AI-powered team suggestions and boss counter-matching (coming soon)</span>
          </li>
        </ul>

        <h2 className="text-xl font-bold text-optc-text pt-4">Credits</h2>
        <p>
          Character data is provided by the amazing{' '}
          <a
            href="https://2shankz.github.io/optc-db.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-optc-accent hover:text-optc-accent-hover transition-colors"
          >
            OPTC Database
          </a>{' '}
          community project. Thank you to all the contributors who maintain it.
        </p>

        <p>
          This project is not affiliated with Bandai Namco Entertainment.
          One Piece is a trademark of Eiichiro Oda / Shueisha / Toei Animation / Bandai Namco.
        </p>
      </div>
    </div>
  );
}
