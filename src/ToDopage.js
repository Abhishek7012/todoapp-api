import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useSpring, animated, useTransition, config } from 'react-spring';
import './todopage.css'; 


const API_URL = 'https://jsonplaceholder.typicode.com/todos';

const ToDopage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [addTaskMessage, setAddTaskMessage] = useState('');

  useEffect(() => {
    axios.get(API_URL).then((response) => {
      setTasks(response.data);
      setLoading(false);
    });
  }, []);

  const fadeIn = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 500 },
  });

  const transitions = useTransition(tasks, {
    keys: task => task.id,
    from: { transform: 'translate3d(0,-40px,0)', opacity: 0 },
    enter: { transform: 'translate3d(0,0px,0)', opacity: 1 },
    leave: { transform: 'translate3d(0,-40px,0)', opacity: 0 },
    config: config.gentle,
  });
  const handleCheckboxChange = async (taskId) => {
        const updatedTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
    
        setTasks(updatedTasks);
    
        try {
          await axios.put(`${API_URL}/${taskId}`, {
            completed: !updatedTasks.find((task) => task.id === taskId).completed,
          });
        } catch (error) {
          console.error('Error updating task:', error);
        }
      };
    
      const handleDeleteTask = async (taskId, taskToDelete) => {
        const taskTitle = taskToDelete?.title;
    
        try {
          await axios.delete(`${API_URL}/${taskId}`);
          setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
          setAddTaskMessage(`Task "${taskTitle}" has been deleted.`);
        } catch (error) {
          console.error('Error deleting task:', error.message);
        }
      };
    
      const handleAddTask = async () => {
        if (newTask.trim() !== '') {
          try {
            const response = await axios.post(API_URL, {
              title: newTask,
              completed: false,
            });
    
            const newTaskData = {
              id: response.data.id,
              title: newTask,
              completed: false,
            };
    
            setTasks((prevTasks) => [...prevTasks, newTaskData]);
    
            setNewTask('');
    
            setAddTaskMessage(`Task "${newTaskData.title}" has been added.`);
          } catch (error) {
            console.error('Error adding task:', error);
    
            setAddTaskMessage('Error adding task. Please try again.');
          }
        }
      };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <animated.div style={fadeIn} className="container mt-5">
      <h1 className="text-center mb-4">To-Do List</h1>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={handleAddTask}>
          Add Task
        </button>
        {addTaskMessage && (
          <p className="text-success mt-2">{addTaskMessage}</p>
        )}
      </div>
      <ul className="list-group">
        {transitions((style, task) => (
          <animated.li
            key={task.id}
            style={style}
            className="list-group-item d-flex justify-content-between align-items-center task-item"
          >
            <div className="task-info">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleCheckboxChange(task.id)}
              />
              <span
                className={
                  task.completed
                    ? 'ml-2 text-muted text-decoration-line-through'
                    : 'ml-2'
                }
              >
                {task.title}
              </span>
            </div>
            {task.completed && (
              <span className="text-success mr-2">Task Completed</span>
            )}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteTask(task.id, task)}
            >
              Delete
            </button>
          </animated.li>
        ))}
      </ul>
    </animated.div>
  );
};

export default ToDopage;