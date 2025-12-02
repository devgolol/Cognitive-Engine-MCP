export interface ThinkInput {
  problem: string;
  depth?: number; // 1-5, 깊이가 클수록 더 상세한 분석
}

export interface ThinkOutput {
  steps: string[];
  conclusion: string;
  confidence: 'low' | 'medium' | 'high';
}

// 단계별 추론 엔진
// 복잡한 문제를 분해하고 단계별로 사고한 후 결론만 반환
export function think(input: ThinkInput): ThinkOutput {
  const { problem, depth = 3 } = input;
  const steps: string[] = [];

  // 1단계: 문제 분해
  steps.push(`[분석] 문제: "${problem.slice(0, 100)}${problem.length > 100 ? '...' : ''}"`);

  // 2단계: 핵심 요소 추출
  const keywords = extractKeywords(problem);
  steps.push(`[핵심요소] ${keywords.join(', ')}`);

  // 3단계: 관계 분석 (depth >= 2)
  if (depth >= 2) {
    const relations = analyzeRelations(keywords);
    steps.push(`[관계] ${relations}`);
  }

  // 4단계: 가설 생성 (depth >= 3)
  if (depth >= 3) {
    const hypothesis = generateHypothesis(problem, keywords);
    steps.push(`[가설] ${hypothesis}`);
  }

  // 5단계: 검증 (depth >= 4)
  if (depth >= 4) {
    const validation = validateHypothesis(problem, keywords);
    steps.push(`[검증] ${validation}`);
  }

  // 6단계: 대안 고려 (depth >= 5)
  if (depth >= 5) {
    const alternatives = considerAlternatives(problem);
    steps.push(`[대안] ${alternatives}`);
  }

  // 결론 도출
  const conclusion = deriveConclusion(problem, keywords, depth);
  const confidence = determineConfidence(depth, keywords.length);

  return { steps, conclusion, confidence };
}

// 키워드 추출
function extractKeywords(text: string): string[] {
  // 불용어 제거 후 주요 단어 추출
  const stopwords = ['이', '가', '을', '를', '의', '에', '와', '과', 'the', 'a', 'an', 'is', 'are', 'be', 'to', 'of', 'and', 'in', 'that', 'it', 'for'];
  const words = text.toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopwords.includes(w));

  // 빈도수 계산
  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  // 상위 5개 반환
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

// 관계 분석
function analyzeRelations(keywords: string[]): string {
  if (keywords.length < 2) return '단일 개념';
  return `${keywords[0]} ↔ ${keywords.slice(1).join(', ')} 간의 상호작용`;
}

// 가설 생성
function generateHypothesis(problem: string, keywords: string[]): string {
  if (keywords.length === 0) return '추가 정보 필요';
  return `"${keywords[0]}"이(가) 핵심 요인일 가능성 높음`;
}

// 가설 검증
function validateHypothesis(problem: string, keywords: string[]): string {
  return keywords.length >= 3 ? '다수 요인 확인됨 → 복합적 접근 필요' : '단순 구조 → 직접적 해결 가능';
}

// 대안 고려
function considerAlternatives(problem: string): string {
  return '다른 관점에서 재검토 권장';
}

// 결론 도출
function deriveConclusion(problem: string, keywords: string[], depth: number): string {
  if (keywords.length === 0) return '문제를 더 구체적으로 정의해주세요.';

  const main = keywords[0];
  const sub = keywords.slice(1, 3).join(', ');

  if (depth <= 2) {
    return `핵심: "${main}" 중심으로 접근`;
  } else if (depth <= 4) {
    return `"${main}"을(를) 주축으로, ${sub || '관련 요소'}를 고려하여 해결`;
  } else {
    return `종합 분석: "${main}" 중심, ${sub || '부가 요인'} 연계, 다각적 접근 권장`;
  }
}

// 신뢰도 결정
function determineConfidence(depth: number, keywordCount: number): 'low' | 'medium' | 'high' {
  const score = depth * 2 + keywordCount;
  if (score >= 12) return 'high';
  if (score >= 7) return 'medium';
  return 'low';
}
