'use client';

import { useState, useMemo } from 'react';
import skillsData from '@/data/skills.json';
import type { Skill } from '@/types';
import { CATEGORIES, filterSkills } from '@/lib/categories';

const skills = skillsData as Skill[];

const TOP_CATEGORIES = [
  { name: '自動化', emoji: '⚡', color: '#f59e0b' },
  { name: '瀏覽器自動化', emoji: '🌐', color: '#3b82f6' },
  { name: '資料庫與API', emoji: '🗄️', color: '#10b981' },
  { name: '前端與UI', emoji: '🎨', color: '#ec4899' },
  { name: '工作流', emoji: '🔄', color: '#8b5cf6' },
  { name: 'AI與代理', emoji: '🤖', color: '#06b6d4' },
  { name: 'DevOps與雲端', emoji: '☁️', color: '#f97316' },
  { name: '資料分析', emoji: '📊', color: '#84cc16' },
];

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

  return (
    <div className="group block bg-[#111111] border border-[#222222] rounded-xl p-4 hover:border-[#7c3aed] hover:bg-[#1a1a1a] transition-all duration-200">
      <div className="flex items-start gap-3">
        {medal ? (
          <span className="text-xl flex-shrink-0 mt-0.5">{medal}</span>
        ) : (
          <span className="text-[#444444] text-sm font-mono font-semibold flex-shrink-0 w-8 text-right mt-1">
            #{skill.rank}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={skill.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#ededed] group-hover:text-white truncate"
            >
              {skill.name}
            </a>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#7c3aed22] text-[#a78bfa] border border-[#7c3aed44]">
              {skill.category}
            </span>
            <span className="text-xs text-[#555555] font-mono">{skill.slug}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-[#888888] flex-wrap">
            <span>⭐ {skill.stars ?? '—'}</span>
            {skill.githubUrl ? (
              <a
                href={skill.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7c3aed] hover:text-[#a78bfa]"
              >
                GitHub repo
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-bold text-[#7c3aed]">{skill.score.toFixed(2)}</div>
          <div className="text-xs text-[#444444]">score</div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const filtered = useMemo(
    () => filterSkills(skills, query, activeCategory as any),
    [query, activeCategory]
  );

  const displayed = filtered;

  const catCount = (cat: string) =>
    cat === '全部' ? skills.length : skills.filter((s) => s.category === cat).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a] sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0ae0]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🦞</span>
            <span className="font-bold text-lg hidden sm:inline">ClawHub</span>
            <span className="text-[#444444] text-sm hidden md:inline">Skill Leaderboard</span>
          </div>
          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="搜尋 skills..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#111111] border border-[#222222] rounded-lg pl-9 pr-4 py-2 text-sm text-[#ededed] placeholder-[#444444] focus:outline-none focus:border-[#7c3aed] transition-colors"
              />
            </div>
          </div>
          <div className="flex-shrink-0 text-xs text-[#444444] hidden lg:block">
            {skills.length} skills
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-48 flex-shrink-0">
          <div className="sticky top-[72px]">
            <h2 className="text-xs font-semibold text-[#444444] uppercase tracking-wider mb-3">
              分類
            </h2>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    activeCategory === cat
                      ? 'bg-[#7c3aed22] text-[#a78bfa] border border-[#7c3aed44]'
                      : 'text-[#888888] hover:text-[#ededed] hover:bg-[#111111]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-xs text-[#333333]">{catCount(cat)}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Hero */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">
              ClawHub Skill Leaderboard
            </h1>
            <p className="text-[#666666] text-sm">
              探索 OpenClaw 生态最熱門的技能 — 瀏覽 {skills.length}+ 個精選 skills，按相關性排序
            </p>
          </div>

          {/* Category Pills (mobile) */}
          <div className="md:hidden mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#7c3aed] text-white'
                      : 'bg-[#111111] text-[#888888] border border-[#222222]'
                  }`}
                >
                  {cat} {catCount(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Top Categories Strip */}
          {query === '' && activeCategory === '全部' && (
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TOP_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className="flex items-center gap-2 bg-[#111111] border border-[#222222] rounded-xl p-3 hover:border-[#7c3aed] transition-all text-left"
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <div>
                    <div className="text-sm font-medium text-[#ededed]">{cat.name}</div>
                    <div className="text-xs text-[#444444]">{catCount(cat.name)} skills</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-[#666666]">
              <>找到 <span className="text-[#ededed] font-medium">{filtered.length}</span> 個 skills</>
            </div>
          </div>

          {/* Skills List */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#444444]">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-lg font-medium mb-1">找不到符合的 skills</div>
              <div className="text-sm">試試不同的關鍵字或分類</div>
            </div>
          ) : (
            <div className="space-y-2">
              {displayed.map((skill, i) => (
                <SkillCard
                  key={skill.slug}
                  skill={skill}
                  index={query || activeCategory !== '全部' ? i : skill.rank - 1}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] mt-8 py-6 text-center text-xs text-[#333333]">
        Powered by{' '}
        <a href="https://clawhub.ai" target="_blank" rel="noopener noreferrer" className="text-[#7c3aed] hover:text-[#a78bfa]">
          ClawHub
        </a>{' '}
        ·{' '}
        <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-[#7c3aed] hover:text-[#a78bfa]">
          OpenClaw
        </a>
      </footer>
    </div>
  );
}
