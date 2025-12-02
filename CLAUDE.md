# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Cognitive Engine MCP

지능 향상 MCP 서버 - 낮은 컨텍스트로 높은 성능

### 빌드/실행
```bash
npm run build    # TypeScript 빌드
npm start        # 서버 실행
```

### 구조
```
src/
├── index.ts           # MCP 서버 진입점
├── db/sqlite.ts       # SQLite DB + 쿼리
└── tools/
    ├── memory.ts      # remember(저장), recall(검색)
    ├── think.ts       # 단계별 추론
    ├── verify.ts      # 답변 검증
    └── learn.ts       # 패턴 학습
```

### Tools
| Tool | 역할 |
|------|------|
| `remember` | 정보 압축 저장 (태그 포함) |
| `recall` | 태그/키워드 기반 검색 |
| `think` | 문제 분해 → 추론 → 결론 (depth 1-5) |
| `verify` | 논리 일관성/관련성/품질 검증 |
| `learn` | 성공/실패 패턴 기록 |
| `get_insights` | 학습된 패턴 조회 |

### DB 테이블
- `memories`: id, content, tags(JSON), created_at
- `lessons`: id, category, pattern, outcome, created_at

### 설치

```bash
# 전역 설치
npm install -g .

# 또는 npm link
npm link
```

### Claude Code 연동

```json
{
  "mcpServers": {
    "cognitive-engine": {
      "command": "cognitive-engine"
    }
  }
}
```
