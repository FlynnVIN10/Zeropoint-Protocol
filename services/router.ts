import * as providers from '../providers';

const PROVIDERS = [providers.gptProvider, providers.grok4Provider, providers.claudeProvider, providers.petalsProvider, providers.wondercraftProvider, providers.tinygradProvider];

export async function routePrompt(prompt) {
  // Select provider based on latency/SLA/quotas
  const selected = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)];
  return selected(prompt);
}
