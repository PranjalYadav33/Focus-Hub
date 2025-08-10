import React from 'react';
import { Task, Priority } from '../types/types';

const priorityStyles = {
    [Priority.High]: 'bg-destructive text-destructive-foreground',
    [Priority.Medium]: 'bg-secondary text-secondary-foreground',
    [Priority.Low]: 'bg-muted text-foreground',
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggle }) => (
    <div className={`p-6 rounded-2xl border bg-card shadow-sm transform hover:scale-[1.01] transition-transform duration-200 ${task.completed ? 'opacity-70' : ''}`}>
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
                <h3 className={`text-base font-semibold text-foreground mb-2 ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                </h3>
                <p className={`text-muted-foreground mb-3 ${task.completed ? 'line-through' : ''}`}>
                    {task.description}
                </p>
                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityStyles[task.priority]}`}>
                        {task.priority.toUpperCase()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {new Date(task.createdAt).toLocaleDateString()}
                    </span>
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
        <div className="flex items-center">
            <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggle(task.id)}
                className="w-5 h-5 mr-3 accent-electric-blue"
            />
            <label className="font-semibold text-deep-space cursor-pointer" onClick={() => onToggle(task.id)}>
                {task.completed ? 'Completed' : 'Mark as Complete'}
            </label>
        </div>
    </div>
);

export default TaskCard;
