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

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(100) DEFAULT 'User',
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed an admin user if table is empty
INSERT IGNORE INTO roles (name, description, permissions) VALUES ('Super Admin', 'Full access to all modules.', '{"projects":["View","Create","Edit","Delete"],"tasks":["View","Create","Edit","Delete","Comment","Attachment","Status Update"],"admin":["View","Manage Roles","Manage Users"]}');
INSERT IGNORE INTO users (username, password, name, role, status) VALUES ('admin', 'admin123', 'Super Admin', 'Super Admin', 'Active');
