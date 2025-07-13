
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Task, Priority } from '../types/types';

const priorityStyles = {
    [Priority.High]: 'bg-hot-pink text-white',
    [Priority.Medium]: 'bg-sunny-yellow text-deep-space',
    [Priority.Low]: 'bg-lime-green text-deep-space',
};

const TaskItem: React.FC<{ task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void; onEdit: (task: Task) => void; }> = ({ task, onToggle, onDelete, onEdit }) => (
    <div className={`p-4 rounded-lg border-2 border-deep-space flex items-start gap-4 transition-all ${task.completed ? 'bg-gray-200 opacity-60' : 'bg-white'}`}>
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} className="mt-1 form-checkbox h-6 w-6 rounded-md border-deep-space text-electric-blue focus:ring-hot-pink" />
        <div className="flex-grow">
            <h3 className={`font-bold text-lg ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
            <p className="text-sm text-gray-600">{task.description}</p>
            <div className="flex items-center gap-4 mt-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${priorityStyles[task.priority]}`}>{task.priority}</span>
                <span className="text-xs text-gray-400">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <button onClick={() => onEdit(task)} className="p-2 rounded-full bg-electric-blue text-white hover:bg-opacity-80 transition">
                <ion-icon name="pencil-outline" />
            </button>
            <button onClick={() => onDelete(task.id)} className="p-2 rounded-full bg-hot-pink text-white hover:bg-opacity-80 transition">
                <ion-icon name="trash-outline" />
            </button>
        </div>
    </div>
);


const TaskForm: React.FC<{ onSave: (task: Omit<Task, 'id'|'completed'|'createdAt'>) => void; existingTask?: Task | null, onCancel: () => void }> = ({ onSave, existingTask, onCancel }) => {
    const [title, setTitle] = useState(existingTask?.title || '');
    const [description, setDescription] = useState(existingTask?.description || '');
    const [priority, setPriority] = useState<Priority>(existingTask?.priority || Priority.Medium);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title) return;
        onSave({ title, description, priority });
        setTitle('');
        setDescription('');
        setPriority(Priority.Medium);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl border-4 border-deep-space shadow-[8px_8px_0_#2E294E] space-y-4">
             <h2 className="font-fredoka text-2xl text-deep-space">{existingTask ? "Edit Task" : "Add a New Task"}</h2>
            <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 rounded-lg border-2 border-deep-space focus:ring-2 focus:ring-hot-pink focus:border-hot-pink outline-none transition" required />
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 rounded-lg border-2 border-deep-space focus:ring-2 focus:ring-hot-pink focus:border-hot-pink outline-none transition" rows={3}></textarea>
            <div className="flex items-center justify-between">
                <label className="font-semibold">Priority:</label>
                <div className="flex gap-2">
                    {Object.values(Priority).map(p => (
                        <button type="button" key={p} onClick={() => setPriority(p)} className={`px-4 py-2 rounded-lg border-2 border-deep-space font-bold text-sm transition ${priority === p ? priorityStyles[p] : 'bg-gray-100'}`}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg bg-gray-300 text-deep-space font-bold border-2 border-deep-space hover:bg-gray-400 transition">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-sunny-yellow text-deep-space font-bold border-2 border-deep-space hover:bg-opacity-80 transition hover:shadow-[4px_4px_0_#2E294E] hover:-translate-y-0.5">Save Task</button>
            </div>
        </form>
    );
};


const TodoPage: React.FC = () => {
    const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useData();
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (filter === 'pending') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [tasks, filter]);

    const handleSave = (taskData: Omit<Task, 'id'|'completed'|'createdAt'>) => {
        if (editingTask) {
            updateTask(editingTask.id, taskData);
        } else {
            addTask(taskData);
        }
        setEditingTask(null);
        setIsFormVisible(false);
    };
    
    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this task?')) {
            deleteTask(id);
        }
    }
    
    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsFormVisible(true);
    }
    
    const handleAddNew = () => {
        setEditingTask(null);
        setIsFormVisible(true);
    }

    const handleCancel = () => {
        setIsFormVisible(false);
        setEditingTask(null);
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-5xl font-righteous text-deep-space">To-Do List</h1>
                <p className="font-semibold text-deep-space mt-2">Organize your life, one task at a time.</p>
            </div>

            { isFormVisible ? (
                <TaskForm onSave={handleSave} existingTask={editingTask} onCancel={handleCancel} />
            ) : (
                <div className="text-center">
                    <button onClick={handleAddNew} className="px-8 py-3 rounded-lg bg-hot-pink text-white font-bold border-2 border-deep-space hover:bg-opacity-80 transition hover:shadow-[4px_4px_0_#2E294E] hover:-translate-y-1 animate-pulse-soft">
<ion-icon name="add-circle-outline" class="mr-2" />
                        Add New Task
                    </button>
                </div>
            )}


            <div className="bg-white p-6 rounded-xl border-4 border-deep-space shadow-[8px_8px_0_#2E294E]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-fredoka text-2xl">Your Tasks</h2>
                    <div className="flex gap-2 p-1 bg-lime-green rounded-lg border-2 border-deep-space">
                        {(['all', 'pending', 'completed'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1 rounded-md text-sm font-bold transition ${filter === f ? 'bg-white text-deep-space shadow-inner' : 'bg-transparent text-deep-space'}`}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <TaskItem key={task.id} task={task} onToggle={toggleTaskCompletion} onDelete={handleDelete} onEdit={handleEdit}/>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No tasks here. Way to go!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodoPage;
