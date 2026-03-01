import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'OPTC Crew Building - Team Sharing for One Piece Treasure Cruise',
  description:
    'Find and share teams for One Piece Treasure Cruise. Browse strategies for Raids, Coliseum, Treasure Map, Kizuna Clash, and more.',
  keywords: 'OPTC, One Piece Treasure Cruise, teams, guides, crew building, Nakama',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
