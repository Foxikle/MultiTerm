CREATE TABLE IF NOT EXISTS FileSystem (
  path TEXT PRIMARY KEY,
  content TEXT,
  tags TEXT,
  created_at INTEGER,
  modified_at INTEGER
);
