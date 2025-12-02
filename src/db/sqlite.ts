import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../data/cognitive.db');

const db: DatabaseType = new Database(DB_PATH);

// 스키마 초기화
db.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    pattern TEXT NOT NULL,
    outcome TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories(tags);
  CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);
`);

// Memory 관련 쿼리
export const memoryQueries = {
  insert: db.prepare('INSERT INTO memories (content, tags) VALUES (?, ?)'),

  searchByTag: db.prepare(`
    SELECT id, content, tags, created_at
    FROM memories
    WHERE tags LIKE ?
    ORDER BY created_at DESC
    LIMIT ?
  `),

  searchByKeyword: db.prepare(`
    SELECT id, content, tags, created_at
    FROM memories
    WHERE content LIKE ?
    ORDER BY created_at DESC
    LIMIT ?
  `),

  getRecent: db.prepare(`
    SELECT id, content, tags, created_at
    FROM memories
    ORDER BY created_at DESC
    LIMIT ?
  `),

  getById: db.prepare('SELECT * FROM memories WHERE id = ?'),

  delete: db.prepare('DELETE FROM memories WHERE id = ?'),

  deleteByTag: db.prepare('DELETE FROM memories WHERE tags LIKE ?'),

  deleteAll: db.prepare('DELETE FROM memories')
};

// Lesson 관련 쿼리
export const lessonQueries = {
  insert: db.prepare('INSERT INTO lessons (category, pattern, outcome) VALUES (?, ?, ?)'),

  getByCategory: db.prepare(`
    SELECT id, category, pattern, outcome, created_at
    FROM lessons
    WHERE category LIKE ?
    ORDER BY created_at DESC
    LIMIT ?
  `),

  getSuccessPatterns: db.prepare(`
    SELECT pattern, COUNT(*) as count
    FROM lessons
    WHERE category LIKE ? AND outcome = 'success'
    GROUP BY pattern
    ORDER BY count DESC
    LIMIT ?
  `),

  getFailurePatterns: db.prepare(`
    SELECT pattern, COUNT(*) as count
    FROM lessons
    WHERE category LIKE ? AND outcome = 'failure'
    GROUP BY pattern
    ORDER BY count DESC
    LIMIT ?
  `),

  delete: db.prepare('DELETE FROM lessons WHERE id = ?'),

  deleteByCategory: db.prepare('DELETE FROM lessons WHERE category LIKE ?'),

  deleteAll: db.prepare('DELETE FROM lessons')
};

// DB 유틸리티
export const dbUtils = {
  vacuum: () => db.exec('VACUUM'),
  getSize: () => {
    const stats = db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()').get() as { size: number };
    return stats.size;
  }
};

export type Memory = {
  id: number;
  content: string;
  tags: string;
  created_at: string;
};

export type Lesson = {
  id: number;
  category: string;
  pattern: string;
  outcome: string;
  created_at: string;
};
