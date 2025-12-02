# Cognitive Engine MCP

지능 향상 MCP 서버

## 빌드
```bash
npm run build && npm start
```

## 구조
```
src/
├── index.ts        # MCP 진입점
├── db/sqlite.ts    # SQLite 쿼리
└── tools/          # memory, think, verify, learn
```

## Tools
| Tool | 역할 |
|------|------|
| `remember` | 기억 저장 (태그) |
| `recall` | 기억 검색 |
| `forget` | 기억 삭제 (id/tag) |
| `clear_memories` | 전체 기억 삭제 |
| `think` | 단계별 추론 (depth 1-5) |
| `verify` | 답변 검증 |
| `learn` | 패턴 학습 |
| `get_insights` | 패턴 조회 |
| `forget_lesson` | 학습 삭제 (id/category) |
| `clear_lessons` | 전체 학습 삭제 |

## DB
- `memories`: id, content, tags, created_at
- `lessons`: id, category, pattern, outcome, created_at

## 설치
```bash
npm install -g .
```

## 연동
```json
{"mcpServers":{"cognitive-engine":{"command":"cognitive-engine"}}}
```
