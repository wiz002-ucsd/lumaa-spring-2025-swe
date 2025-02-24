import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All task routes are protected
router.use(authenticateToken);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;

