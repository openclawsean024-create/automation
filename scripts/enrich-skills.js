/**
 * enrich-skills.js
 * Fetches stars and GitHub URL for each skill in data/skills.json
 * using concurrent API calls. Updates data/skills.json in place.
 *
 * GitHub URL is extracted from SKILL.md file content (clawhub inspect --file SKILL.md)
 * since the API metadata field does not contain repository info.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

const CLAWHUB = '/home/sean/.nvm/versions/node/v22.22.1/bin/clawhub';

const skills = JSON.parse(fs.readFileSync('data/skills.json', 'utf8'));
console.log(`Enriching ${skills.length} skills...`);

// Skills already enriched
const doneStars = skills.filter(s => s.stars !== undefined).length;
const doneGithub = skills.filter(s => s.githubUrl).length;
console.log(`Already have stars: ${doneStars}/${skills.length}`);
console.log(`Already have githubUrl: ${doneGithub}/${skills.length}`);

// Fetch stars via HTTPS API
function fetchSkillStats(slug) {
  return new Promise((resolve) => {
    const url = `https://clawhub.ai/api/v1/skills/${slug}`;
    https.get(url, { headers: { 'User-Agent': 'clawhub-client/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const stats = json?.skill?.stats;
          resolve({ slug, stars: stats?.stars ?? null });
        } catch {
          resolve({ slug, stars: null });
        }
      });
    }).on('error', () => resolve({ slug, stars: null }));
  });
}

// Extract GitHub URL from SKILL.md content using clawhub inspect
function fetchGithubUrl(slug) {
  return new Promise((resolve) => {
    try {
      // clawhub inspect --file SKILL.md outputs:
      // ---  (separator line)
      // [file content]
      // ---  (separator)
      // Skill metadata...
      const out = execSync(
        `${CLAWHUB} inspect ${slug} --file SKILL.md 2>&1`,
        { encoding: 'utf8', timeout: 15000 }
      );

      // Extract GitHub URL from SKILL.md content (between --- separators)
      const parts = out.split('---');
      let content = '';
      if (parts.length >= 2) {
        // Content is between first two --- markers
        content = parts.slice(1, -1).join('---').trim();
      } else {
        content = out;
      }

      // Look for GitHub repository URLs in the content
      const githubPatterns = [
        /(?:github|repository|source)\s*[:=]\s*(https?:\/\/github\.com\/[^\s)\]"'>]+)/gi,
        /(https?:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?)/gi,
        /git\s+(https?:\/\/github\.com\/[^\s]+)/gi,
      ];

      for (const pattern of githubPatterns) {
        pattern.lastIndex = 0;
        const match = pattern.exec(content);
        if (match) {
          let url = match[1] || match[0];
          // Remove trailing .git if present
          url = url.replace(/\.git$/, '');
          resolve({ slug, githubUrl: url });
          return;
        }
      }
      resolve({ slug, githubUrl: null });
    } catch (e) {
      resolve({ slug, githubUrl: null });
    }
  });
}

async function run() {
  // Step 1: Fetch stars for skills missing them (batch size 20, concurrent)
  const starsBatchSize = 20;
  let processed = 0;

  for (let i = 0; i < skills.length; i += starsBatchSize) {
    const batch = skills.slice(i, i + starsBatchSize);
    const needsFetch = batch.filter(s => s.stars === undefined);

    if (needsFetch.length > 0) {
      const results = await Promise.all(needsFetch.map(s => fetchSkillStats(s.slug)));
      const resultMap = new Map(results.map(r => [r.slug, r]));
      for (const skill of batch) {
        const result = resultMap.get(skill.slug);
        if (result && result.stars !== null) {
          skill.stars = result.stars;
        }
      }
    }

    processed += batch.length;
    process.stdout.write(`\rStars: ${processed}/${skills.length}     `);
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('\nStars enrichment complete.');

  // Step 2: Fetch GitHub URLs for skills missing them
  // Use clawhub inspect --file SKILL.md to extract repository URLs
  const needsGithub = skills.filter(s => !s.githubUrl);
  console.log(`Fetching GitHub URLs for ${needsGithub.length} skills...`);

  const ghBatchSize = 5; // Small batch to avoid rate limiting
  let ghProcessed = 0;

  for (let i = 0; i < needsGithub.length; i += ghBatchSize) {
    const batch = needsGithub.slice(i, i + ghBatchSize);
    const results = await Promise.all(batch.map(s => fetchGithubUrl(s.slug)));
    const resultMap = new Map(results.map(r => [r.slug, r]));

    for (const skill of skills) {
      const result = resultMap.get(skill.slug);
      if (result && result.githubUrl) {
        skill.githubUrl = result.githubUrl;
      }
    }

    ghProcessed += batch.length;
    process.stdout.write(`\rGitHub: ${ghProcessed}/${needsGithub.length}     `);

    // Delay between batches to avoid rate limiting
    if (i + ghBatchSize < needsGithub.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  console.log('\nGitHub URL enrichment complete.');

  // Sort by score and reassign ranks
  skills.sort((a, b) => b.score - a.score);
  skills.forEach((s, i) => s.rank = i + 1);

  fs.writeFileSync('data/skills.json', JSON.stringify(skills, null, 2));
  console.log('Updated data/skills.json');

  const finalGithub = skills.filter(s => s.githubUrl).length;
  console.log(`Final stats: ${skills.length} skills, ${finalGithub} with GitHub URLs`);
}

run().catch(console.error);
