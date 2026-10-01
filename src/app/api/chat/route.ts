import { NextRequest, NextResponse } from 'next/server';
import { processUserMessageWithGemini } from '@/lib/gemini/agent';
import { ChatMessage } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message field is required' }, { status: 400 });
    }

    const result = await processUserMessageWithGemini(history, message);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      sources: result.sources,
      toolAction: result.toolAction,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
