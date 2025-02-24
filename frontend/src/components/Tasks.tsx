import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: number;
  title: string;
  description?: string;
  is_complete: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Function to fetch tasks
  const fetchTasks = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        throw new Error('Unauthorized: Please log in again.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      navigate('/login'); // Redirect to login if unauthorized
    }
  };

  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // Create a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]); // Update UI immediately
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  // Toggle task completion
  const handleUpdateTask = async (task: Task) => {
    const updatedTask = { ...task, is_complete: !task.is_complete };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedData = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedData : t))); // Update UI immediately
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  // Delete a task
  const handleDeleteTask = async (id: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks((prev) => prev.filter((task) => task.id !== id)); // Remove from UI immediately
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  // Logout user
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload(); // Force a full refresh
  };

  return (
    <div>
      <h2>Your Tasks</h2>
      <button onClick={handleLogout}>Logout</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span style={{ textDecoration: task.is_complete ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            <button onClick={() => handleUpdateTask(task)}>
              {task.is_complete ? 'Undo' : 'Complete'}
            </button>
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h3>Create Task</h3>
      <form onSubmit={handleCreateTask}>
        <div>
          <label>Title:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" />
        </div>
        <div>
          <label>Description:</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} type="text" />
        </div>
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
};

export default Tasks;
