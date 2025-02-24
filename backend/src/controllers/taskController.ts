import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);
    res.json(tasks.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;
  const userId = req.user?.userId;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  try {
    const newTask = await pool.query(
      'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description || null, userId]
    );
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, is_complete } = req.body;
  const userId = req.user?.userId;

  try {
    // Check if task exists and belongs to the user
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (taskResult.rows.length === 0)
      return res.status(404).json({ message: 'Task not found' });

    const updatedTask = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, is_complete = $3 WHERE id = $4 RETURNING *',
      [title, description, is_complete, id]
    );
    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    // Check if task exists and belongs to the user
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (taskResult.rows.length === 0)
      return res.status(404).json({ message: 'Task not found' });

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

