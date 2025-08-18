<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  
  const messages = writable<string[]>([]);
  let ws: WebSocket | null = null;
  
  onMount(() => {
    ws = new WebSocket('wss://api.zeropoint-protocol.ai/agentic');
    
    ws.onmessage = (event) => {
      messages.update(msgs => [...msgs, event.data]);
    };
    
    ws.onerror = () => console.error('WebSocket error');
    
    return () => ws?.close();
  });
  
  let input = '';
  
  function sendMessage() {
    if (ws && input.trim()) {
      ws.send(input);
      messages.update(msgs => [...msgs, `User: ${input}`]);
      input = '';
    }
  }
</script>

<div class="chat-container p-4 max-w-2xl mx-auto">
  <div class="messages bg-gray-100 p-4 rounded h-96 overflow-y-auto">
    {#each $messages as message}
      <p class="mb-2">{message}</p>
    {/each}
  </div>
  
  <div class="input-area mt-4 flex gap-2">
    <input
      type="text"
      bind:value={input}
      on:keydown={(e) => e.key === 'Enter' && sendMessage()}
      class="flex-1 p-2 border rounded"
      placeholder="Type message to AI agent..."
    />
    <button
      on:click={sendMessage}
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Send
    </button>
  </div>
</div>

<style>
  .chat-container { 
    font-family: Arial, sans-serif; 
  }
  .messages { 
    border: 1px solid #ccc; 
  }
</style>
