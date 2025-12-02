import { lessonQueries, Lesson } from '../db/sqlite.js';

export interface LearnInput {
  category: string;     // 주제/카테고리 (예: "coding", "math", "logic")
  pattern: string;      // 성공/실패 패턴 설명
  outcome: 'success' | 'failure';
}

export interface GetInsightsInput {
  category: string;
  limit?: number;
}

export interface Insight {
  doThis: string[];     // 이렇게 하면 좋음
  avoidThis: string[];  // 이건 피하기
  summary: string;
}

// 학습 결과 저장
export function learn(input: LearnInput): { message: string } {
  const { category, pattern, outcome } = input;

  lessonQueries.insert.run(category, pattern, outcome);

  return {
    message: `Learned: [${outcome}] ${category} - "${pattern.slice(0, 50)}..."`
  };
}

// 학습된 인사이트 가져오기
export function getInsights(input: GetInsightsInput): Insight {
  const { category, limit = 5 } = input;

  const successPatterns = lessonQueries.getSuccessPatterns.all(`%${category}%`, limit) as Array<{ pattern: string; count: number }>;
  const failurePatterns = lessonQueries.getFailurePatterns.all(`%${category}%`, limit) as Array<{ pattern: string; count: number }>;

  const doThis = successPatterns.map(p => p.pattern);
  const avoidThis = failurePatterns.map(p => p.pattern);

  let summary = '';
  if (doThis.length === 0 && avoidThis.length === 0) {
    summary = `"${category}" 관련 학습 데이터 없음`;
  } else {
    const totalSuccess = successPatterns.reduce((sum, p) => sum + p.count, 0);
    const totalFailure = failurePatterns.reduce((sum, p) => sum + p.count, 0);
    const successRate = totalSuccess + totalFailure > 0
      ? Math.round((totalSuccess / (totalSuccess + totalFailure)) * 100)
      : 0;

    summary = `"${category}" 성공률: ${successRate}% (성공 ${totalSuccess}건, 실패 ${totalFailure}건)`;
  }

  return { doThis, avoidThis, summary };
}

// 특정 카테고리의 모든 학습 내역 조회
export function getLessons(category: string, limit: number = 10): { lessons: Array<{ pattern: string; outcome: string; date: string }> } {
  const results = lessonQueries.getByCategory.all(`%${category}%`, limit) as Lesson[];

  return {
    lessons: results.map(l => ({
      pattern: l.pattern,
      outcome: l.outcome,
      date: l.created_at
    }))
  };
}
