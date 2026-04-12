export interface Skill {
  slug: string;
  name: string;
  score: number;
  category: string;
  url: string;
  rank: number;
  stars?: number;
  githubUrl?: string;
  descriptionEn?: string; // v1.2
  descriptionZh?: string; // v1.2
}
