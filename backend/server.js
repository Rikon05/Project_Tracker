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
  const { status } = req.body;
  try {
    await pool.query('UPDATE subtasks SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PUT subtask remark
app.put('/api/subtasks/:id/remark', async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;
  try {
    await pool.query('UPDATE subtasks SET remark = ? WHERE id = ?', [remark, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update remark' });
  }
});

// POST subtask attachment
app.post('/api/subtasks/:id/attachment', upload.single('attachment'), async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filename = req.file.filename;
    const originalname = req.file.originalname;
    
    await pool.query('UPDATE subtasks SET attachment_filename = ?, attachment_original_name = ? WHERE id = ?', [filename, originalname, id]);
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
