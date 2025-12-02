import { memoryQueries, Memory } from '../db/sqlite.js';

// 텍스트 압축: 핵심만 추출 (간단한 요약)
function compress(text: string): string {
  // 불필요한 공백 제거
  let compressed = text.replace(/\s+/g, ' ').trim();

  // 너무 길면 앞부분만 유지 (500자 제한)
  if (compressed.length > 500) {
    compressed = compressed.slice(0, 500) + '...';
  }

  return compressed;
}

export interface RememberInput {
  content: string;
  tags?: string[];
}

export interface RecallInput {
  query: string;
  limit?: number;
}

// 기억 저장
export function remember(input: RememberInput): { id: number; message: string } {
  const compressed = compress(input.content);
  const tags = JSON.stringify(input.tags || []);

  const result = memoryQueries.insert.run(compressed, tags);

  return {
    id: result.lastInsertRowid as number,
    message: `Stored memory #${result.lastInsertRowid} with ${compressed.length} chars`
  };
}

// 기억 검색
export function recall(input: RecallInput): { memories: Array<{ id: number; content: string; tags: string[]; date: string }> } {
  const limit = input.limit || 5;
  const query = input.query.toLowerCase();

  // 태그로 검색
  let results = memoryQueries.searchByTag.all(`%${query}%`, limit) as Memory[];

  // 결과가 부족하면 키워드로도 검색
  if (results.length < limit) {
    const keywordResults = memoryQueries.searchByKeyword.all(`%${query}%`, limit - results.length) as Memory[];
    results = [...results, ...keywordResults];
  }

  // 중복 제거
  const unique = Array.from(new Map(results.map(r => [r.id, r])).values());

  return {
    memories: unique.map(m => ({
      id: m.id,
      content: m.content,
      tags: JSON.parse(m.tags),
      date: m.created_at
    }))
  };
}

// 최근 기억 가져오기
export function getRecentMemories(limit: number = 10): { memories: Array<{ id: number; content: string; tags: string[]; date: string }> } {
  const results = memoryQueries.getRecent.all(limit) as Memory[];

  return {
    memories: results.map(m => ({
      id: m.id,
      content: m.content,
      tags: JSON.parse(m.tags),
      date: m.created_at
    }))
  };
}

export interface ForgetInput {
  id?: number;
  tag?: string;
}

// 특정 기억 삭제
export function forget(input: ForgetInput): { deleted: number; message: string } {
  let deleted = 0;

  if (input.id) {
    const result = memoryQueries.delete.run(input.id);
    deleted = result.changes;
  } else if (input.tag) {
    const result = memoryQueries.deleteByTag.run(`%${input.tag}%`);
    deleted = result.changes;
  }

  return {
    deleted,
    message: deleted > 0 ? `Deleted ${deleted} memory(s)` : 'No matching memories found'
  };
}

// 전체 기억 삭제
export function clearMemories(): { deleted: number; message: string } {
  const result = memoryQueries.deleteAll.run();
  return {
    deleted: result.changes,
    message: `Cleared all memories (${result.changes} deleted)`
  };
}
