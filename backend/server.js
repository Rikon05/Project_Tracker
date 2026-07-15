import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

import pool from './db.js';

// Database Migrations
(async () => {
  try {
    const columnsToAdd = [
      'updated_by VARCHAR(255)',
      'commented_by VARCHAR(255)',
      'attached_by VARCHAR(255)'
    ];
    for (const col of columnsToAdd) {
      try {
        await pool.query(`ALTER TABLE subtasks ADD COLUMN ${col}`);
        console.log(`Added column ${col} to subtasks table`);
      } catch (err) {
        // Ignore duplicate column errors (ER_DUP_FIELDNAME)
        if (err.code !== 'ER_DUP_FIELDNAME') {
          console.error(`Migration error for ${col}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Migration failed:', err);
  }
})();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'Backend server is running and connected to DB!' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'DB connection failed' });
  }
});

// GET all projects with their subtasks
app.get('/api/projects', async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT * FROM projects ORDER BY created_at ASC');
    const [subtasks] = await pool.query('SELECT * FROM subtasks ORDER BY order_index ASC');
    
    const projectList = projects.map(p => {
      return {
        id: p.id,
        title: p.title,
        owner: p.owner,
        medium: p.medium,
        startDate: p.start_date,
        completed: Boolean(p.completed),
        activeStatus: p.active_status || 'Active',
        subTasks: subtasks.filter(s => s.project_id === p.id)
      };
    });
    res.json(projectList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST new project
app.post('/api/projects', async (req, res) => {
  const { title, owner, medium, startDate } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO projects (title, owner, medium, start_date) VALUES (?, ?, ?, ?)',
      [title, owner, medium, startDate]
    );
    const [newProject] = await pool.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json({
      id: newProject[0].id,
      title: newProject[0].title,
      owner: newProject[0].owner,
      medium: newProject[0].medium,
      startDate: newProject[0].start_date,
      completed: Boolean(newProject[0].completed),
      activeStatus: newProject[0].active_status || 'Active',
      subTasks: []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT project details
app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { title, owner, medium, startDate } = req.body;
  try {
    await pool.query(
      'UPDATE projects SET title = ?, owner = ?, medium = ?, start_date = ? WHERE id = ?',
      [title, owner, medium, startDate, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// PUT project active status
app.put('/api/projects/:id/active', async (req, res) => {
  const { id } = req.params;
  const { activeStatus } = req.body;
  try {
    await pool.query('UPDATE projects SET active_status = ? WHERE id = ?', [activeStatus, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update active status' });
  }
});

// PUT toggle project complete
app.put('/api/projects/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    await pool.query('UPDATE projects SET completed = ? WHERE id = ?', [completed, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE project
app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST bulk subtasks
app.post('/api/projects/:id/subtasks/bulk', async (req, res) => {
  const { id } = req.params;
  const { subTasks } = req.body;
  try {
    const [existing] = await pool.query('SELECT MAX(order_index) as max_idx FROM subtasks WHERE project_id = ?', [id]);
    let startIdx = (existing[0].max_idx !== null ? existing[0].max_idx : -1) + 1;
    
    for (const title of subTasks) {
      await pool.query(
        'INSERT INTO subtasks (project_id, title, status, order_index) VALUES (?, ?, ?, ?)',
        [id, title, 'Not Started', startIdx++]
      );
    }
    
    const [updatedSubtasks] = await pool.query('SELECT * FROM subtasks WHERE project_id = ? ORDER BY order_index ASC', [id]);
    res.status(201).json(updatedSubtasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add subtasks' });
  }
});

// PUT subtask status
app.put('/api/subtasks/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, updated_by } = req.body;
  try {
    await pool.query('UPDATE subtasks SET status = ?, updated_by = ? WHERE id = ?', [status, updated_by, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PUT subtask remark
app.put('/api/subtasks/:id/remark', async (req, res) => {
  const { id } = req.params;
  const { remark, commented_by } = req.body;
  try {
    await pool.query('UPDATE subtasks SET remark = ?, commented_by = ? WHERE id = ?', [remark, commented_by, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update remark' });
  }
});

// POST subtask attachment
app.post('/api/subtasks/:id/attachment', upload.single('attachment'), async (req, res) => {
  const { id } = req.params;
  const { attached_by } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filename = req.file.filename;
    const originalname = req.file.originalname;
    
    await pool.query('UPDATE subtasks SET attachment_filename = ?, attachment_original_name = ?, attached_by = ? WHERE id = ?', [filename, originalname, attached_by, id]);
    res.json({ success: true, filename, originalname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
});

// PUT subtask title
app.put('/api/subtasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    await pool.query('UPDATE subtasks SET title = ? WHERE id = ?', [title, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
});

// PUT subtasks reorder
app.put('/api/projects/:projectId/subtasks/reorder', async (req, res) => {
  const { subTasks } = req.body; // Array of objects with id and new order_index
  try {
    for (let i = 0; i < subTasks.length; i++) {
      await pool.query('UPDATE subtasks SET order_index = ? WHERE id = ?', [i, subTasks[i].id]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder subtasks' });
  }
});

// Users and Authentication Routes

// POST login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.name, u.username, u.role, u.status, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role = r.name
      WHERE u.username = ? AND u.password = ?
    `, [username, password]);
    if (users.length > 0) {
      if (users[0].status === 'In-Active') {
        return res.status(403).json({ error: 'User account is disabled' });
      }
      res.json({ success: true, user: users[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, username, role, status FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST add user
app.post('/api/users', async (req, res) => {
  const { name, username, password, role, status } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO users (name, username, password, role, status) VALUES (?, ?, ?, ?, ?)', [name, username, password, role, status || 'Active']);
    const [newUser] = await pool.query('SELECT id, name, username, role, status FROM users WHERE id = ?', [result.insertId]);
    res.json(newUser[0]);
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add user' });
    }
  }
});

// PUT update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, password, role, status } = req.body;
  try {
    if (password) {
      await pool.query('UPDATE users SET name = ?, username = ?, password = ?, role = ?, status = ? WHERE id = ?', [name, username, password, role, status, id]);
    } else {
      await pool.query('UPDATE users SET name = ?, username = ?, role = ?, status = ? WHERE id = ?', [name, username, role, status, id]);
    }
    const [updatedUser] = await pool.query('SELECT id, name, username, role, status FROM users WHERE id = ?', [id]);
    res.json(updatedUser[0]);
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Roles API

// GET all roles
app.get('/api/roles', async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY created_at DESC');
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// POST add role
app.post('/api/roles', async (req, res) => {
  const { name, description, permissions } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)', [name, description, JSON.stringify(permissions)]);
    const [newRole] = await pool.query('SELECT * FROM roles WHERE id = ?', [result.insertId]);
    res.json(newRole[0]);
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Role name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add role' });
    }
  }
});

// PUT update role
app.put('/api/roles/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, permissions } = req.body;
  try {
    await pool.query('UPDATE roles SET name = ?, description = ?, permissions = ? WHERE id = ?', [name, description, JSON.stringify(permissions), id]);
    const [updatedRole] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
    res.json(updatedRole[0]);
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Role name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update role' });
    }
  }
});

// DELETE role
app.delete('/api/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM roles WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
