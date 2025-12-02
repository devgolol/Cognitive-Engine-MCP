export interface VerifyInput {
  answer: string;
  criteria?: string[];  // 검증 기준
  context?: string;     // 원래 질문/맥락
}

export interface VerifyOutput {
  valid: boolean;
  issues: string[];
  suggestions: string[];
  score: number; // 0-100
}

// 답변 검증
export function verify(input: VerifyInput): VerifyOutput {
  const { answer, criteria = [], context = '' } = input;
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // 1. 기본 검증: 빈 응답 체크
  if (!answer || answer.trim().length === 0) {
    return {
      valid: false,
      issues: ['응답이 비어있음'],
      suggestions: ['구체적인 답변 필요'],
      score: 0
    };
  }

  // 2. 길이 검증
  if (answer.length < 10) {
    issues.push('응답이 너무 짧음');
    suggestions.push('더 자세한 설명 추가');
    score -= 20;
  }

  // 3. 논리적 일관성 체크
  const logicIssues = checkLogicalConsistency(answer);
  if (logicIssues.length > 0) {
    issues.push(...logicIssues);
    score -= logicIssues.length * 10;
  }

  // 4. 불확실성 표현 체크
  const uncertaintyLevel = checkUncertainty(answer);
  if (uncertaintyLevel === 'high') {
    issues.push('불확실한 표현이 많음');
    suggestions.push('더 확실한 근거 제시 필요');
    score -= 15;
  }

  // 5. 컨텍스트 관련성 체크
  if (context) {
    const relevance = checkRelevance(answer, context);
    if (!relevance.relevant) {
      issues.push('맥락과의 관련성 부족');
      suggestions.push(relevance.suggestion);
      score -= 25;
    }
  }

  // 6. 사용자 정의 기준 검증
  for (const criterion of criteria) {
    const criterionResult = checkCriterion(answer, criterion);
    if (!criterionResult.pass) {
      issues.push(`기준 미충족: ${criterion}`);
      suggestions.push(criterionResult.suggestion);
      score -= 15;
    }
  }

  // 점수 최소값 보정
  score = Math.max(0, score);

  return {
    valid: issues.length === 0,
    issues,
    suggestions: suggestions.length > 0 ? suggestions : ['검증 통과'],
    score
  };
}

// 논리적 일관성 체크
function checkLogicalConsistency(text: string): string[] {
  const issues: string[] = [];

  // 모순 패턴 감지
  const contradictionPatterns = [
    { pattern: /하지만.*그러나/g, issue: '중복된 역접 표현' },
    { pattern: /항상.*절대/g, issue: '과도한 절대 표현' },
    { pattern: /모든.*아무/g, issue: '모순 가능성 있는 표현' }
  ];

  for (const { pattern, issue } of contradictionPatterns) {
    if (pattern.test(text)) {
      issues.push(issue);
    }
  }

  return issues;
}

// 불확실성 수준 체크
function checkUncertainty(text: string): 'low' | 'medium' | 'high' {
  const uncertainWords = ['아마', '아마도', '어쩌면', '같아요', '것 같', 'maybe', 'perhaps', 'probably', 'might', 'could be'];
  const count = uncertainWords.filter(w => text.toLowerCase().includes(w)).length;

  if (count >= 3) return 'high';
  if (count >= 1) return 'medium';
  return 'low';
}

// 맥락 관련성 체크
function checkRelevance(answer: string, context: string): { relevant: boolean; suggestion: string } {
  const contextWords = context.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const answerWords = answer.toLowerCase().split(/\s+/);

  const overlap = contextWords.filter(w => answerWords.some(aw => aw.includes(w)));
  const relevanceRatio = contextWords.length > 0 ? overlap.length / contextWords.length : 0;

  if (relevanceRatio < 0.1) {
    return {
      relevant: false,
      suggestion: '원래 질문의 핵심 키워드를 포함하여 답변'
    };
  }

  return { relevant: true, suggestion: '' };
}

// 사용자 정의 기준 검증
function checkCriterion(answer: string, criterion: string): { pass: boolean; suggestion: string } {
  const lowerCriterion = criterion.toLowerCase();
  const lowerAnswer = answer.toLowerCase();

  // 간단한 키워드 포함 여부 체크
  if (lowerCriterion.includes('포함') || lowerCriterion.includes('include')) {
    const keyword = criterion.replace(/.*포함.*:/i, '').replace(/.*include.*:/i, '').trim();
    if (keyword && !lowerAnswer.includes(keyword.toLowerCase())) {
      return { pass: false, suggestion: `"${keyword}" 포함 필요` };
    }
  }

  // 길이 기준
  if (lowerCriterion.includes('자') || lowerCriterion.includes('char')) {
    const match = criterion.match(/(\d+)/);
    if (match) {
      const minLength = parseInt(match[1]);
      if (answer.length < minLength) {
        return { pass: false, suggestion: `최소 ${minLength}자 이상 필요` };
      }
    }
  }

  return { pass: true, suggestion: '' };
}
