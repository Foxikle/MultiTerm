CREATE TABLE IF NOT EXISTS FileSystem (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT UNIQUE,
  content TEXT,
  tags TEXT,
  created_at INTEGER,
  modified_at INTEGER
);
