#!/usr/bin/env node
/**
 * v1.2: Add bilingual descriptions (descriptionEn, descriptionZh)
 * to all skills in data/skills.json
 */

const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/skills.json'), 'utf8'));

// Pattern-based description generator
const patterns = [
  // Browser automation
  { names: ['browser', 'stealth', 'puppeteer', 'playwright'], cat: ['瀏覽器自動化'], en: (n, slug) => `Automate web browser interactions using natural language commands. ${n.includes('stealth') ? 'Includes anti-detection measures for stealth browsing.' : 'Supports click, scroll, form fill, and screenshot.'}`, zh: (n, slug) => `使用自然語言指令自動化管理網頁瀏覽器操作。${n.includes('stealth') ? '內建反偵測機制，適合需要隱私的自動化場景。' : '支援點擊、滾動、表單填寫、截圖等功能。'}` },
  // Workflow automation
  { names: ['workflow', 'n8n', 'automation'], cat: ['工作流', '自動化'], en: (n) => `Automate multi-step workflows and business processes with visual builder or code. Connect apps, APIs, and services for seamless data flow.`, zh: (n) => `使用視覺化編輯器或程式碼自動化管理多步驟工作流程與商業邏輯。連接應用程式、API 與服務，實現無縫資料傳遞。` },
  // DevOps / Cloud
  { names: ['devops', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'pipeline', 'deploy', 'aws', 'gcp', 'azure', 'cloud', 'serverless'], cat: ['DevOps與雲端'], en: (n) => `Deploy, manage, and scale applications on cloud infrastructure. Automate CI/CD pipelines, container orchestration, and infrastructure provisioning.`, zh: (n) => `在雲端基礎設施上部署、管理與擴展應用程式。自動化 CI/CD 流水線、容器編排與基礎設施配置流程。` },
  // Database / API
  { names: ['database', 'sql', 'postgres', 'mysql', 'mongodb', 'redis', 'api', 'rest', 'graphql'], cat: ['資料庫與API'], en: (n) => `Build, query, and manage databases and REST/GraphQL APIs. Connect to SQL, NoSQL, or external services for data storage and retrieval.`, zh: (n) => `建立、查詢和管理資料庫與 REST/GraphQL API。連接 SQL、NoSQL 或外部服務進行資料儲存與檢索。` },
  // AI / Agent
  { names: ['ai', 'gpt', 'llm', 'claude', 'gemini', 'openai', 'agent', 'assistant', 'chatbot', 'rag', 'embedding', 'model'], cat: ['AI與代理'], en: (n) => `Leverage large language models and AI agents for natural language understanding, generation, and autonomous task completion.`, zh: (n) => `運用大型語言模型與 AI 代理進行自然語言理解、生成與自主任務執行。` },
  // Frontend / UI
  { names: ['frontend', 'ui', 'ux', 'css', 'react', 'vue', 'nextjs', 'svelte', 'tailwind', 'component', 'design'], cat: ['前端與UI'], en: (n) => `Build modern user interfaces and web applications with component-based frameworks and responsive design patterns.`, zh: (n) => `使用元件化框架與響應式設計模式建構現代化使用者介面與網頁應用程式。` },
  // Data / Analytics
  { names: ['data', 'analytics', 'dashboard', 'chart', 'visualization', 'etl', 'pandas', 'numpy', 'jupyter', 'notebook', 'statistics'], cat: ['資料分析'], en: (n) => `Analyze, visualize, and gain insights from structured and unstructured data. Build dashboards, reports, and data pipelines.`, zh: (n) => `分析、視覺化並從結構化與非結構化資料中獲取洞察。建構儀表板、報表與資料處理管線。` },
  // Utilities / Tools
  { names: ['tool', 'utility', 'helper', 'script', 'cli', 'command', 'timer', 'scheduler', 'cron', 'notification', 'email', 'webhook'], cat: ['工具類'], en: (n) => `General-purpose utility for task automation, scheduling, notifications, and system-level operations.`, zh: (n) => `通用工具集，用於任務自動化、排程執行、通知發送與系統層級操作。` },
  // Security
  { names: ['security', 'auth', 'oauth', 'jwt', 'ssl', 'tls', 'encrypt', 'privacy', 'firewall'], cat: ['安全'], en: (n) => `Implement authentication, authorization, encryption, and security best practices for applications and infrastructure.`, zh: (n) => `為應用程式與基礎設施實作身份驗證授權、加密機制與安全最佳實踐。` },
  // Testing
  { names: ['test', 'testing', 'unit', 'integration', 'e2e', 'cypress', 'jest', 'vitest', 'qa', 'coverage'], cat: ['測試'], en: (n) => `Write and run automated tests for frontend, backend, and end-to-end scenarios to ensure code quality and reliability.`, zh: (n) => `為前端、後端與端對端情境編寫並執行自動化測試，確保程式碼品質與可靠性。` },
];

function generateDescription(name, slug, category) {
  const n = (name + ' ' + slug).toLowerCase();

  // Try name patterns first
  for (const p of patterns) {
    for (const keyword of p.names) {
      if (n.includes(keyword)) {
        return { en: p.en(name, slug), zh: p.zh(name, slug) };
      }
    }
  }

  // Category-based fallback
  if (category) {
    const catLower = category.toLowerCase();
    for (const p of patterns) {
      if (p.cat.map(c => c.toLowerCase()).includes(catLower)) {
        return { en: p.en(name, slug), zh: p.zh(name, slug) };
      }
    }
  }

  // Ultimate fallback using name
  return {
    en: `Skill for ${name}. Automate and extend capabilities within the OpenClaw ecosystem.`,
    zh: `${name} 相關技能。在 OpenClaw 生態系中自動化並擴展功能。`
  };
}

let updated = 0;
const updatedData = data.map(skill => {
  if (!skill.descriptionEn && !skill.descriptionZh) {
    const desc = generateDescription(skill.name, skill.slug, skill.category);
    updated++;
    return {
      ...skill,
      descriptionEn: desc.en,
      descriptionZh: desc.zh
    };
  }
  return skill;
});

console.log(`Updated ${updated} / ${data.length} skills with bilingual descriptions`);
fs.writeFileSync(path.join(__dirname, '../data/skills.json'), JSON.stringify(updatedData, null, 2), 'utf8');
console.log('Done: data/skills.json written');
