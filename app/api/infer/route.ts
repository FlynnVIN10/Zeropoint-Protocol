import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';

const PETALS_API_URL = process.env.PETALS_API_URL || 'http://localhost:8000';

export async function POST(req: Request) {
  try {
    const { prompt = "hello", max_tokens = 100, temperature = 0.7 } = await req.json();
    
    // Generate run ID
    const runId = `infer-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const startTime = Date.now();
    
    // Create evidence directory
    const evidenceDir = path.join(process.cwd(), 'public', 'evidence', 'runs', date, runId);
    await fs.mkdir(evidenceDir, { recursive: true });
    
    // Call real Petals API
    const petalsResponse = await fetch(`${PETALS_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        max_tokens,
        temperature,
      }),
      signal: AbortSignal.timeout(30000),
    });
    
    if (!petalsResponse.ok) {
      throw new Error(`Petals API returned ${petalsResponse.status}`);
    }
    
    const petalsData = await petalsResponse.json();
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Write inference log
    const inferLog = `Starting inference run ${runId}
Prompt: "${prompt}"
Timestamp: ${new Date().toISOString()}

Connecting to Petals node at ${PETALS_API_URL}...
Node status: available
Model: ${petalsData.model || 'bloom-560m'}
Processing prompt...
Generating response...

Response: "${petalsData.text}"

Inference completed successfully!
Tokens generated: ${petalsData.usage?.completion_tokens || 'N/A'}
Total tokens: ${petalsData.usage?.total_tokens || 'N/A'}
Processing time: ${processingTime}s
`;
    
    await fs.writeFile(path.join(evidenceDir, 'infer.log'), inferLog);
    
    return NextResponse.json({
      status: "completed",
      runId,
      prompt,
      response: petalsData.text,
      model: petalsData.model || 'bloom-560m',
      usage: petalsData.usage,
      processingTime: `${processingTime}s`,
      evidencePath: `public/evidence/runs/${date}/${runId}/infer.log`
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: "Petals inference failed",
      details: error instanceof Error ? error.message : "Unknown error",
      hint: "Ensure Petals API server is running on http://localhost:8000"
    }, { status: 503 });
  }
}
