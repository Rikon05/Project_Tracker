CREATE DATABASE IF NOT EXISTS project_tracker;
USE project_tracker;

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  owner VARCHAR(255),
  medium VARCHAR(255),
  start_date DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subtasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Not Started',
  remark TEXT,
  order_index INT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
