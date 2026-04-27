DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS content_slots;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT CHECK (role IN ('teacher', 'principal')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_slots (
  id SERIAL PRIMARY KEY,
  subject TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  subject TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size INT,
  uploaded_by INT,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by INT,
  approved_at TIMESTAMP,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedule (
  id SERIAL PRIMARY KEY,
  content_id INT,
  slot_id INT,
  rotation_order INT,
  duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);