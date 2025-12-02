# Cognitive Engine MCP

낮은 컨텍스트로 높은 성능을 내는 AI 지능 향상 MCP 서버

## 설치

```bash
git clone https://github.com/devgolol/Cognitive-Engine-MCP.git
cd Cognitive-Engine-MCP
npm install
npm run build
```

## Claude Code 전역 설치

```bash
# 현재 디렉토리에서 실행
claude mcp add cognitive-engine -s user -- node $(pwd)/dist/index.js

# 또는 직접 경로 지정
claude mcp add cognitive-engine -s user -- node /your/path/to/Cognitive-Engine-MCP/dist/index.js
```

## Tools

| Tool | 설명 |
|------|------|
| `remember` | 정보 압축 저장 |
| `recall` | 기억 검색 |
| `think` | 단계별 추론 |
| `verify` | 답변 검증 |
| `learn` | 패턴 학습 |
| `get_insights` | 학습 조회 |
