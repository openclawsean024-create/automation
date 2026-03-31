import type { Skill } from '@/types';

export const CATEGORIES = [
  '全部',
  '自動化',
  '瀏覽器自動化',
  '資料庫與API',
  '前端與UI',
  '工作流',
  'AI與代理',
  'DevOps與雲端',
  '生產力工具',
  '安全與認證',
  '資料分析',
] as const;

export type Category = typeof CATEGORIES[number];

export function filterSkills(skills: Skill[], query: string, category: Category): Skill[] {
  return skills.filter((s) => {
    const matchCat = category === '全部' || s.category === category;
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
}
