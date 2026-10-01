import fs from 'fs';
import path from 'path';
import { PolicyChunk } from '../types';

let cachedChunks: PolicyChunk[] | null = null;

// Fallback embedded text if policy.txt path is modified or in serverless edge environment
const DEFAULT_POLICY_TEXT = `
COMPANY POLICY DOCUMENT
Mind_Dreams Online Store — Customer Policies

RETURN POLICY
Customers may return items within 30 days of the purchase date.
All returned items must be unused and in their original packaging with all accessories included.
Electronics such as laptops, phones, and tablets must be returned within 15 days.
Items marked as "Final Sale" cannot be returned or exchanged.
To initiate a return, contact support@Mind_Dreams.com with your order number.

REFUND POLICY
Refunds are processed within 5 business days after the returned item is received.
Refunds are issued to the original payment method only.
Shipping costs are non-refundable unless the return is due to a defective or wrong item.
If you paid by credit card, it may take an additional 3–5 business days for the refund to appear.

SHIPPING POLICY
Standard shipping takes 3–5 business days and costs $4.99.
Express shipping takes 1–2 business days and costs $12.99.
Free standard shipping is available on all orders above $50.
We currently ship to all 50 US states. International shipping is not available.
Orders placed before 2:00 PM EST are dispatched the same day.

WARRANTY POLICY
All electronics come with a 1-year manufacturer warranty covering hardware defects.
The warranty does not cover physical damage, water damage, or unauthorized modifications.
To claim warranty service, contact support@Mind_Dreams.com with proof of purchase.
Laptops and desktops come with an optional 2-year extended warranty available for purchase.

EXCHANGE POLICY
Exchanges are allowed within 30 days of purchase (15 days for electronics).
The item being exchanged must be in original condition.
If the replacement item costs more, the customer pays the difference.
If the replacement item costs less, the difference is refunded within 5 business days.

CUSTOMER SUPPORT
Call Support is available Monday to Friday, 9:00 AM to 6:00 PM EST.
Email: support@Mind_Dreams.com
Phone: 1-800-000000
Live chat is available on the website during 24/7 hours.
`;

export function getPolicyContent(): string {
  try {
    const policyPath = path.join(process.cwd(), 'policy.txt');
    if (fs.existsSync(policyPath)) {
      return fs.readFileSync(policyPath, 'utf-8');
    }
  } catch (err) {
    console.warn('Could not read policy.txt from disk, using embedded policy text fallback.');
  }
  return DEFAULT_POLICY_TEXT;
}

export function chunkPolicyDocument(): PolicyChunk[] {
  if (cachedChunks) return cachedChunks;

  const rawText = getPolicyContent();
  const sections = rawText.split(/\n(?=[A-Z\s]{4,}POLICY|CUSTOMER SUPPORT)/);

  const chunks: PolicyChunk[] = [];
  let chunkId = 1;

  for (const rawSec of sections) {
    const trimmed = rawSec.trim();
    if (!trimmed || trimmed.startsWith('COMPANY POLICY DOCUMENT')) continue;

    const lines = trimmed.split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    const wordCount = content.split(/\s+/).length;
    
    // Extract key terms for fast TF-IDF / keyword similarity ranking
    const keywords = Array.from(
      new Set(
        content
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3)
      )
    );

    chunks.push({
      id: `chunk-${chunkId++}`,
      title: title,
      section: title.replace(' POLICY', ''),
      content: `${title}\n${content}`,
      wordCount,
      keywords,
    });
  }

  cachedChunks = chunks;
  return chunks;
}

export function searchPolicyRAG(query: string, topK: number = 3): { chunk: PolicyChunk; score: number }[] {
  const chunks = chunkPolicyDocument();
  const queryWords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const scored = chunks.map(chunk => {
    let score = 0;
    const lowerContent = chunk.content.toLowerCase();
    const lowerTitle = chunk.title.toLowerCase();

    for (const word of queryWords) {
      if (lowerTitle.includes(word)) score += 3.5;
      if (lowerContent.includes(word)) score += 1.0;
      if (chunk.keywords.includes(word)) score += 1.5;
    }

    // Boost exact key policy phrases
    if (query.toLowerCase().includes('return') && lowerTitle.includes('return')) score += 5;
    if (query.toLowerCase().includes('refund') && lowerTitle.includes('refund')) score += 5;
    if (query.toLowerCase().includes('ship') && lowerTitle.includes('shipping')) score += 5;
    if (query.toLowerCase().includes('warrant') && lowerTitle.includes('warranty')) score += 5;
    if (query.toLowerCase().includes('exchange') && lowerTitle.includes('exchange')) score += 5;
    if ((query.toLowerCase().includes('contact') || query.toLowerCase().includes('support') || query.toLowerCase().includes('phone') || query.toLowerCase().includes('email')) && lowerTitle.includes('customer support')) score += 5;

    return { chunk, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
