#!/usr/bin/env python3
"""
enrich-skills.py
Fetches GitHub URLs from clawhub inspect metadata for skills in data/skills.json.
Run: python3 scripts/enrich-skills.py
"""
import subprocess
import json
import re
import time
import sys

CLAWHUB = '/home/sean/.nvm/versions/node/v22.22.1/bin/clawhub'

def fetch_github_url(slug):
    """Run clawhub inspect --file SKILL.md and extract repository/homepage from metadata."""
    try:
        result = subprocess.run(
            [CLAWHUB, 'inspect', slug, '--file', 'SKILL.md'],
            capture_output=True,
            text=True,
            timeout=20
        )
        output = result.stdout + result.stderr

        # Output structure: --- [metadata] --- [SKILL.md content]
        # Split by --- separator; metadata is in parts[1]
        parts = output.split('---')
        if len(parts) < 2:
            return None

        metadata = parts[1]  # Metadata section is after first ---

        # Look for repository or homepage fields
        repo_match = re.search(r'repository:\s*(https?://github\.com/[^\s]+)', metadata, re.IGNORECASE)
        if repo_match:
            url = repo_match.group(1).rstrip('/')
            if url.endswith('.git'):
                url = url[:-4]
            return url

        home_match = re.search(r'homepage:\s*(https?://github\.com/[^\s]+)', metadata, re.IGNORECASE)
        if home_match:
            url = home_match.group(1).rstrip('/')
            if url.endswith('.git'):
                url = url[:-4]
            return url

        return None
    except Exception:
        return None

def main():
    with open('data/skills.json', 'r') as f:
        skills = json.load(f)

    print('Loaded {} skills'.format(len(skills)))

    # Skills that need GitHub URL
    need_gh = [s for s in skills if not s.get('githubUrl')]
    print('Skills needing GitHub URL: {}'.format(len(need_gh)))

    updated = 0
    errors = 0

    for i, skill in enumerate(need_gh):
        slug = skill['slug']

        # Check for "Skill not found" to skip removed skills
        if (i + 1) % 10 == 0:
            # Batch delay every 10 skills
            time.sleep(1.5)

        url = fetch_github_url(slug)

        if url:
            skill['githubUrl'] = url
            updated += 1
            print('[{}] {} => {}'.format(i+1, slug, url))
        else:
            # Check if skill was not found
            try:
                result = subprocess.run(
                    [CLAWHUB, 'inspect', slug],
                    capture_output=True, text=True, timeout=10
                )
                out = result.stdout + result.stderr
                if 'not found' in out.lower() or 'error' in out.lower():
                    print('[{}] {} => NOT FOUND (skipping)'.format(i+1, slug))
                else:
                    print('[{}] {} => (no GH repo)'.format(i+1, slug))
            except Exception:
                print('[{}] {} => ERROR'.format(i+1, slug))
                errors += 1

    print('\nUpdated {} GitHub URLs'.format(updated))
    if errors:
        print('Errors: {}'.format(errors))

    # Re-sort by score
    skills.sort(key=lambda s: s['score'], reverse=True)
    for i, s in enumerate(skills):
        s['rank'] = i + 1

    with open('data/skills.json', 'w') as f:
        json.dump(skills, f, indent=2, ensure_ascii=False)

    print('Saved data/skills.json ({} skills)'.format(len(skills)))

if __name__ == '__main__':
    main()
