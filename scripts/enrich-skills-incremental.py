#!/usr/bin/env python3
"""
enrich-skills-incremental.py
Fetches GitHub URLs incrementally, saving after each batch.
Run: python3 scripts/enrich-skills-incremental.py
"""
import subprocess
import json
import re
import time
import sys
import os

CLAWHUB = '/home/sean/.nvm/versions/node/v22.22.1/bin/clawhub'
DATA_FILE = 'data/skills.json'
BATCH_SIZE = 50  # Save after each batch

def fetch_github_url(slug):
    """Run clawhub inspect --file SKILL.md and extract repository/homepage."""
    try:
        r = subprocess.run(
            [CLAWHUB, 'inspect', slug, '--file', 'SKILL.md'],
            capture_output=True, text=True, timeout=20
        )
        out = r.stdout + r.stderr
        parts = out.split('---')
        if len(parts) < 2:
            return None
        metadata = parts[1]
        # Look for repository or homepage
        repo_match = re.search(
            r'repository:\s*(https?://github\.com/[^\s]+)',
            metadata, re.IGNORECASE
        )
        if repo_match:
            url = repo_match.group(1).rstrip('/').rstrip('.git')
            return url
        home_match = re.search(
            r'homepage:\s*(https?://github\.com/[^\s]+)',
            metadata, re.IGNORECASE
        )
        if home_match:
            url = home_match.group(1).rstrip('/').rstrip('.git')
            return url
        return None
    except Exception:
        return None

def save_skills(skills):
    """Save skills to JSON, re-sorting by score."""
    skills.sort(key=lambda s: s['score'], reverse=True)
    for i, s in enumerate(skills):
        s['rank'] = i + 1
    with open(DATA_FILE, 'w') as f:
        json.dump(skills, f, indent=2, ensure_ascii=False)
    gh_count = sum(1 for s in skills if s.get('githubUrl'))
    print('Saved {} skills ({} with GitHub URLs)'.format(len(skills), gh_count))

def main():
    # Get starting index from command line arg (if provided)
    start_idx = 0
    if len(sys.argv) > 1:
        start_idx = int(sys.argv[1])

    with open(DATA_FILE, 'r') as f:
        skills = json.load(f)

    print('Loaded {} skills (starting from index {})'.format(len(skills), start_idx))

    # Skills that need GitHub URL
    need = [s for s in skills if not s.get('githubUrl')]
    remaining = need[start_idx:]
    print('Remaining skills needing GitHub URL: {}'.format(len(remaining)))

    found = 0
    saved_any = False

    for i, skill in enumerate(remaining):
        idx = start_idx + i
        slug = skill['slug']

        # Rate limit: delay every 10 skills
        if i > 0 and i % 10 == 0:
            time.sleep(1.5)
            # Save checkpoint after each 10
            save_skills(skills)
            saved_any = True
            print('Checkpoint saved at index {}'.format(idx))

        url = fetch_github_url(slug)
        if url:
            skill['githubUrl'] = url
            found += 1
            print('[{}] {} => {}'.format(idx, slug, url))
        else:
            print('[{}] {} => (no GH repo)'.format(idx, slug))

        # Save after each BATCH_SIZE skills
        if (i + 1) % BATCH_SIZE == 0:
            save_skills(skills)
            saved_any = True
            print('Batch saved at index {}'.format(idx + 1))

    # Final save
    if not saved_any or True:
        save_skills(skills)

    total_gh = sum(1 for s in skills if s.get('githubUrl'))
    print('\nComplete! Found {} new GitHub URLs (total: {})'.format(found, total_gh))

if __name__ == '__main__':
    main()
