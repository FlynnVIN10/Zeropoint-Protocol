#!/usr/bin/env node
import { execSync } from 'node:child_process';

function getRepoSlug() {
  try {
    const url = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    // Supports https and ssh URL formats
    if (url.startsWith('git@')) {
      const m = url.match(/:(.+)\.git$/);
      return m ? m[1] : '';
    }
    const u = new URL(url);
    const parts = u.pathname.replace(/^\//, '').replace(/\.git$/, '');
    return parts;
  } catch {
    return process.env.GITHUB_REPOSITORY || '';
  }
}

async function fetchJson(url, token) {
  const res = await fetch(url, {
    headers: {
      'authorization': token ? `Bearer ${token}` : '',
      'accept': 'application/vnd.github+json'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  const repo = getRepoSlug();
  if (!repo) {
    console.error('❌ Cannot determine repository slug (owner/repo)');
    process.exit(2);
  }
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
  const branch = process.env.WORKFLOW_SENTINEL_BRANCH || 'main';

  // Get workflow runs on default branch
  const runs = await fetchJson(`https://api.github.com/repos/${repo}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=100`, token);
  const byWorkflow = new Map();
  for (const r of runs.workflow_runs || []) {
    const id = r.workflow_id;
    const cur = byWorkflow.get(id);
    if (!cur || new Date(r.created_at) > new Date(cur.created_at)) {
      byWorkflow.set(id, r);
    }
  }

  const latest = Array.from(byWorkflow.values());
  const failing = latest.filter(r => r.status === 'completed' && r.conclusion !== 'success');

  if (failing.length === 0) {
    console.log('✅ All latest workflows on branch are successful');
    console.log(latest.map(r => `- ${r.name}: ${r.conclusion}`).join('\n'));
    process.exit(0);
  }

  console.error('❌ Detected failed workflows (latest per workflow):');
  for (const r of failing) {
    console.error(`- ${r.name} (#${r.run_number}) → ${r.conclusion} | ${r.html_url}`);
  }
  process.exit(1);
}

main().catch(err => { console.error('💥 Sentinel error:', err.message); process.exit(2); });


