import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClawHub Skill Leaderboard — 自動化工具集',
  description: 'Browse and search the most popular ClawHub skills for OpenClaw agents. Automation, browser, database, frontend, AI agents, DevOps and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
