export async function fetchSkillStats(slug: string) {
  try {
    const res = await fetch(`https://clawhub.ai/api/v1/skills/${slug}`, {
      headers: { 'User-Agent': 'clawhub-client/1.0' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      stars: data?.skill?.stats?.stars ?? null,
    };
  } catch {
    return null;
  }
}
