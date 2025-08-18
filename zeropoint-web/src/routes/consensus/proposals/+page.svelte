<script lang="ts">
  import { onMount } from 'svelte';
  import ConsensusReview from '$lib/components/ConsensusReview.svelte';
  
  let proposals: any[] = [];
  let loading = true;
  let error: string | null = null;
  let stats: any = null;
  
  onMount(async () => {
    try {
      // Fetch proposals from API
      const res = await fetch('/api/proposals');
      if (res.ok) {
        proposals = await res.json();
      } else {
        error = `Failed to fetch proposals: ${res.status}`;
      }
      
      // Fetch queue statistics
      const statsRes = await fetch('/api/proposals/stats');
      if (statsRes.ok) {
        stats = await statsRes.json();
      }
    } catch (err) {
      error = `Error loading proposals: ${err}`;
    } finally {
      loading = false;
    }
  });
  
  // Zeroth Principle: Helper functions for transparent display
  function getStatusColor(status: string): string {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getConsensusStatus(consensus: any): string {
    if (consensus.ai === 'pass' && consensus.human === 'pass') {
      return 'Dual Consensus Achieved';
    } else if (consensus.ai === 'fail' || consensus.human === 'fail') {
      return 'Consensus Failed';
    } else if (consensus.ai === 'pending' && consensus.human === 'pending') {
      return 'Awaiting Consensus';
    } else {
      return 'Partial Consensus';
    }
  }
</script>

<svelte:head>
  <title>Consensus Proposals - Zeropoint Protocol</title>
  <meta name="description" content="Review and manage Synthiant proposals requiring dual consensus (AI + Human)" />
</svelte:head>

<div class="p-4 max-w-6xl mx-auto">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Consensus Proposals</h1>
    <p class="text-gray-600">Review and manage Synthiant proposals requiring dual consensus (AI + Human)</p>
    
    <!-- Queue Statistics -->
    {#if stats}
      <div class="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div class="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div class="text-sm text-gray-600">Total</div>
        </div>
        <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div class="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div class="text-sm text-gray-600">Pending</div>
        </div>
        <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div class="text-2xl font-bold text-blue-600">{stats.underReview}</div>
          <div class="text-sm text-gray-600">Under Review</div>
        </div>
        <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div class="text-2xl font-bold text-green-600">{stats.accepted}</div>
          <div class="text-sm text-gray-600">Accepted</div>
        </div>
        <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div class="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div class="text-sm text-gray-600">Rejected</div>
        </div>
      </div>
    {/if}
  </header>

  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <span class="ml-3 text-gray-600">Loading proposals...</span>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error Loading Proposals</h3>
          <p class="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    </div>
  {:else if proposals.length === 0}
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No proposals</h3>
      <p class="mt-1 text-sm text-gray-500">No Synthiant proposals are currently pending consensus review.</p>
    </div>
  {:else}
    <div class="space-y-6">
      {#each proposals as proposal (proposal.proposalId)}
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div class="p-6">
            <!-- Proposal Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h2 class="text-xl font-semibold text-gray-900 mb-1">
                  {proposal.proposalId}: {proposal.changeType.replace('_', ' ')}
                </h2>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Synthiant: {proposal.synthiantId}</span>
                  <span>Submitted: {new Date(proposal.timestamp).toLocaleDateString()}</span>
                  <span class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(proposal.status)}">
                    {proposal.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <!-- Consensus Status -->
              <div class="text-right">
                <div class="text-sm text-gray-500 mb-1">Consensus Status</div>
                <div class="text-lg font-semibold text-blue-600">
                  {getConsensusStatus(proposal.consensus)}
                </div>
              </div>
            </div>
            
            <!-- Proposal Summary -->
            <div class="mb-4">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Summary</h3>
              <p class="text-gray-900">{proposal.summary}</p>
            </div>
            
            <!-- Proposal Details -->
            {#if proposal.details}
              <div class="mb-4">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Details</h3>
                <p class="text-gray-900">{proposal.details}</p>
              </div>
            {/if}
            
            <!-- Training Data -->
            {#if proposal.trainingData}
              <div class="mb-4">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Training Data</h3>
                <div class="bg-gray-50 rounded p-3 text-sm">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#if proposal.trainingData.modelId}
                      <div><span class="font-medium">Model:</span> {proposal.trainingData.modelId}</div>
                    {/if}
                    {#if proposal.trainingData.steps}
                      <div><span class="font-medium">Steps:</span> {proposal.trainingData.steps}</div>
                    {/if}
                    {#if proposal.trainingData.prompt}
                      <div><span class="font-medium">Prompt:</span> {proposal.trainingData.prompt}</div>
                    {/if}
                    {#if proposal.trainingData.dataset}
                      <div><span class="font-medium">Dataset:</span> {proposal.trainingData.dataset}</div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- Metrics -->
            {#if proposal.metrics}
              <div class="mb-4">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Metrics</h3>
                <div class="bg-gray-50 rounded p-3 text-sm">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#if proposal.metrics.trainingSteps}
                      <div><span class="font-medium">Training Steps:</span> {proposal.metrics.trainingSteps}</div>
                    {/if}
                    {#if proposal.metrics.modelUsed}
                      <div><span class="font-medium">Model Used:</span> {proposal.metrics.modelUsed}</div>
                    {/if}
                    {#if proposal.metrics.safetyValidated !== undefined}
                      <div><span class="font-medium">Safety Validated:</span> 
                        <span class="{proposal.metrics.safetyValidated ? 'text-green-600' : 'text-red-600'}">
                          {proposal.metrics.safetyValidated ? 'Yes' : 'No'}
                        </span>
                      </div>
                    {/if}
                    {#if proposal.metrics.performanceGain}
                      <div><span class="font-medium">Performance Gain:</span> {proposal.metrics.performanceGain}%</div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- Ethics Review -->
            {#if proposal.ethicsReview}
              <div class="mb-4">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Ethics Review</h3>
                <div class="bg-blue-50 rounded p-3 text-sm">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span class="font-medium">Compliance Score:</span> {proposal.ethicsReview.complianceScore}%</div>
                    <div><span class="font-medium">Bias Assessment:</span> {proposal.ethicsReview.biasAssessment}</div>
                    {#if proposal.ethicsReview.safetyChecks}
                      <div class="md:col-span-2">
                        <span class="font-medium">Safety Checks:</span>
                        <ul class="list-disc list-inside mt-1">
                          {#each proposal.ethicsReview.safetyChecks as check}
                            <li>{check}</li>
                          {/each}
                        </ul>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- Consensus Review Component -->
            <ConsensusReview {proposal} />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Zeroth Principle: Clean, accessible design with no dark patterns */
  :global(body) {
    background-color: #f9fafb;
  }
  
  /* Ensure good contrast for accessibility */
  .text-gray-900 {
    color: #111827;
  }
  
  .text-gray-700 {
    color: #374151;
  }
  
  .text-gray-600 {
    color: #4b5563;
  }
  
  .text-gray-500 {
    color: #6b7280;
  }
</style>
