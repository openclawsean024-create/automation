const { execSync } = require('child_process');
const path = require('path');

// Use full path to clawhub binary (avoid template literals for exec tool compatibility)
const CLAWHUB = '/home/sean/.nvm/versions/node/v22.22.1/bin/clawhub';

const queries = [
  { q: 'agent automation', cat: '自動化' },
  { q: 'browser automation', cat: '瀏覽器自動化' },
  { q: 'database api', cat: '資料庫與API' },
  { q: 'frontend ui design', cat: '前端與UI' },
  { q: 'automation workflow', cat: '工作流' },
  { q: 'ai agent coding', cat: 'AI與代理' },
  { q: 'devops cloud deployment', cat: 'DevOps與雲端' },
  { q: 'productivity tools', cat: '生產力工具' },
  { q: 'security authentication', cat: '安全與認證' },
  { q: 'data analysis ml', cat: '資料分析' },
  // Additional queries to cover more skill space
  { q: 'openclaw skill', cat: '自動化' },
  { q: 'claude agent tool', cat: 'AI與代理' },
  { q: 'web scraping data extraction', cat: '資料庫與API' },
  { q: 'twitter social media', cat: '自動化' },
  { q: 'notion workspace', cat: '自動化' },
];

const seen = new Set();
const skills = [];

for (const { q, cat } of queries) {
  try {
    // Use --limit 200 (max) to get more results per query
    const cmd = CLAWHUB + ' search "' + q + '" --limit 200 2>&1';
    const out = execSync(cmd, { encoding: 'utf8' });
    const lines = out.split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*(\S+)\s+(.+?)\s+\((\d+\.\d+)\)/);
      if (m && !seen.has(m[1])) {
        seen.add(m[1]);
        skills.push({
          slug: m[1],
          name: m[2],
          score: parseFloat(m[3]),
          category: cat,
          url: 'https://clawhub.ai/skills/' + m[1],
        });
      }
    }
  } catch (e) {
    // skip query errors
  }
}

skills.sort((a, b) => b.score - a.score);
skills.forEach((s, i) => s.rank = i + 1);

require('fs').writeFileSync('data/skills.json', JSON.stringify(skills, null, 2));
console.log('Collected ' + skills.length + ' skills');
