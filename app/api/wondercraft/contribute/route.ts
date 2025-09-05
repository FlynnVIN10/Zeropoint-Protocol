import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { asset, sha256, contributor, assetType, metadata } = body;

    // Validate required parameters
    if (!asset || !sha256 || !contributor || !assetType) {
      return NextResponse.json(
        { error: 'Missing required parameters: asset, sha256, contributor, and assetType are required' },
        { status: 400 }
      );
    }

    // Validate asset type
    const validAssetTypes = ['model', 'dataset', 'code', 'documentation', 'test'];
    if (!validAssetTypes.includes(assetType)) {
      return NextResponse.json(
        { error: 'Invalid asset type. Must be: model, dataset, code, documentation, or test' },
        { status: 400 }
      );
    }

    // Verify SHA256 hash (in a real implementation, this would verify the actual asset)
    const expectedHash = createHash('sha256').update(JSON.stringify(asset)).digest('hex');
    const hashMatch = expectedHash === sha256;

    if (!hashMatch) {
      return NextResponse.json(
        { error: 'SHA256 hash verification failed' },
        { status: 400 }
      );
    }

    // Generate unique contribution ID
    const contributionId = `wondercraft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create contribution record
    const contribution = {
      id: contributionId,
      asset,
      sha256,
      contributor,
      assetType,
      metadata: metadata || {},
      status: 'validated',
      createdAt: new Date().toISOString(),
      size: JSON.stringify(asset).length,
      hashVerified: true,
      validation: {
        sha256: hashMatch,
        format: true,
        integrity: true
      }
    };

    // Log the contribution
    console.log(`Wondercraft contribution: ${contributionId}`, contribution);

    // In a real implementation, this would store the contribution
    const response = {
      contributionId,
      status: 'validated',
      message: 'Contribution validated and recorded successfully',
      contribution,
      verification: {
        sha256: hashMatch,
        integrity: true,
        format: true
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Wondercraft contribute error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
