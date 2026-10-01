import { NextRequest, NextResponse } from 'next/server';
import { chunkPolicyDocument, searchPolicyRAG, getPolicyContent } from '@/lib/rag/indexer';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    const chunks = chunkPolicyDocument();
    const fullText = getPolicyContent();

    if (query) {
      const searchResults = searchPolicyRAG(query, 5);
      return NextResponse.json({
        success: true,
        query,
        results: searchResults,
      });
    }

    return NextResponse.json({
      success: true,
      totalChunks: chunks.length,
      chunks,
      rawPolicyText: fullText,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
