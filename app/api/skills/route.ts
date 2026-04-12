import { NextRequest, NextResponse } from 'next/server';
import skillsData from '@/data/skills.json';
import type { Skill } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q')?.toLowerCase();

  let skills = skillsData as Skill[];

  if (category && category !== '全部') {
    skills = skills.filter((s) => s.category === category);
  }

  if (q) {
    skills = skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.descriptionEn?.toLowerCase().includes(q) ?? false) ||
        (s.descriptionZh?.toLowerCase().includes(q) ?? false)
    );
  }

  return NextResponse.json({ skills, total: skills.length });
}
