#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { remember, recall, getRecentMemories } from './tools/memory.js';
import { think } from './tools/think.js';
import { verify } from './tools/verify.js';
import { learn, getInsights } from './tools/learn.js';

const server = new Server(
  {
    name: 'cognitive-engine',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool 목록 정의
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'remember',
        description: '정보를 압축하여 장기 기억에 저장합니다. 나중에 recall로 검색할 수 있습니다.',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: '저장할 내용'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: '검색용 태그 (선택)'
            }
          },
          required: ['content']
        }
      },
      {
        name: 'recall',
        description: '저장된 기억을 검색합니다. 태그나 키워드로 관련 기억을 찾습니다.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '검색어 (태그 또는 키워드)'
            },
            limit: {
              type: 'number',
              description: '최대 결과 수 (기본: 5)'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'think',
        description: '복잡한 문제를 단계별로 분석합니다. 깊이(1-5)에 따라 분석 수준이 달라집니다.',
        inputSchema: {
          type: 'object',
          properties: {
            problem: {
              type: 'string',
              description: '분석할 문제 또는 질문'
            },
            depth: {
              type: 'number',
              description: '분석 깊이 1-5 (기본: 3)',
              minimum: 1,
              maximum: 5
            }
          },
          required: ['problem']
        }
      },
      {
        name: 'verify',
        description: '답변의 논리적 일관성, 관련성, 품질을 검증합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            answer: {
              type: 'string',
              description: '검증할 답변'
            },
            criteria: {
              type: 'array',
              items: { type: 'string' },
              description: '추가 검증 기준 (선택)'
            },
            context: {
              type: 'string',
              description: '원래 질문/맥락 (선택)'
            }
          },
          required: ['answer']
        }
      },
      {
        name: 'learn',
        description: '성공/실패 패턴을 학습하여 저장합니다. 나중에 get_insights로 조회할 수 있습니다.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: '카테고리 (예: coding, math, logic)'
            },
            pattern: {
              type: 'string',
              description: '학습할 패턴 설명'
            },
            outcome: {
              type: 'string',
              enum: ['success', 'failure'],
              description: '결과 (success 또는 failure)'
            }
          },
          required: ['category', 'pattern', 'outcome']
        }
      },
      {
        name: 'get_insights',
        description: '특정 카테고리에서 학습된 패턴과 인사이트를 조회합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: '조회할 카테고리'
            },
            limit: {
              type: 'number',
              description: '최대 패턴 수 (기본: 5)'
            }
          },
          required: ['category']
        }
      }
    ]
  };
});

// Tool 실행 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'remember':
        result = remember(args as { content: string; tags?: string[] });
        break;

      case 'recall':
        result = recall(args as { query: string; limit?: number });
        break;

      case 'think':
        result = think(args as { problem: string; depth?: number });
        break;

      case 'verify':
        result = verify(args as { answer: string; criteria?: string[]; context?: string });
        break;

      case 'learn':
        result = learn(args as { category: string; pattern: string; outcome: 'success' | 'failure' });
        break;

      case 'get_insights':
        result = getInsights(args as { category: string; limit?: number });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cognitive Engine MCP server running');
}

main().catch(console.error);
