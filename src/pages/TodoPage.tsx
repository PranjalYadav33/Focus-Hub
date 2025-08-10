
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Task, Priority } from '../types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Trash2, Edit3, CheckCircle2, Circle, Calendar, Filter, AlertCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { animateStagger } from '@/utils/motion';

const priorityConfig = {
    [Priority.High]: {
        color: 'destructive',
        icon: AlertCircle,
        label: 'High Priority'
    },
    [Priority.Medium]: {
        color: 'warning',
        icon: Clock,
        label: 'Medium Priority'
    },
    [Priority.Low]: {
        color: 'secondary',
        icon: Zap,
        label: 'Low Priority'
    },
};

const TaskItem: React.FC<{
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}> = ({ task, onToggle, onDelete, onEdit }) => {
  const priorityInfo = priorityConfig[task.priority];
  const PriorityIcon = priorityInfo.icon;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      task.completed && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => onToggle(task.id)}
            className="mt-1 flex-shrink-0"
            data-testid="task-toggle"
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>

          <div className="flex-grow min-w-0">
            <h3 className={cn(
              "font-semibold text-base mb-1",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs">
              <Badge
                variant={priorityInfo.color as any}
                className="flex items-center gap-1"
              >
                <PriorityIcon className="h-3 w-3" />
                {task.priority}
              </Badge>
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              className="h-8 w-8"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const TaskForm: React.FC<{
  onSave: (task: Omit<Task, 'id'|'completed'|'createdAt'>) => void;
  existingTask?: Task | null;
  onCancel: () => void;
}> = ({ onSave, existingTask, onCancel }) => {
    const [title, setTitle] = useState(existingTask?.title || '');
    const [description, setDescription] = useState(existingTask?.description || '');
    const [priority, setPriority] = useState<Priority>(existingTask?.priority || Priority.Medium);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim()) return;
        onSave({ title: title.trim(), description: description.trim(), priority });
        if (!existingTask) {
          setTitle('');
          setDescription('');
          setPriority(Priority.Medium);
        }
    };

    return (
        <Card>
          <CardHeader>
            <CardTitle>{existingTask ? "Edit Task" : "Create New Task"}</CardTitle>
            <CardDescription>
              {existingTask ? "Update your task details" : "Add a new task to your list"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter task title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Enter task description..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-2">
                  {Object.values(Priority).map(p => {
                    const config = priorityConfig[p];
                    const Icon = config.icon;
                    return (
                      <Button
                        key={p}
                        type="button"
                        variant={priority === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriority(p)}
                        className="flex items-center gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {p}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {existingTask ? "Update Task" : "Create Task"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">Organize your work and track progress.</p>
                </div>
                {!isFormVisible && (
                  <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Task
                  </Button>
                )}
            </div>

            { isFormVisible ? (
                <TaskForm onSave={handleSave} existingTask={editingTask} onCancel={handleCancel} />
            ) : null }

            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Tasks</CardTitle>
                  <CardDescription>Manage your tasks efficiently</CardDescription>
                </div>
                <div className="flex gap-2">
                  {(['all', 'pending', 'completed'] as const).map(f => (
                    <Button
                      key={f}
                      variant={filter === f ? 'default' : 'outline'}
                      onClick={() => setFilter(f)}
                      className="capitalize"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task, idx) => (
                      <div key={task.id} style={{opacity: 0, transform: 'translateY(8px)'}} id={`task-row-${idx}`}>
                        <TaskItem
                          task={task}
                          onToggle={toggleTaskCompletion}
                          onDelete={handleDelete}
                          onEdit={handleEdit}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No tasks here. Way to go!</div>
                  )}
                </div>

            <script>
            {setTimeout(() => {
              try {
                const rows = document.querySelectorAll('[id^=task-row-]');
                animateStagger('[id^=task-row-]');
                rows.forEach((el:any)=>{ el.style.opacity=''; el.style.transform=''; });
              } catch {}
            }, 0)}
            </script>

              </CardContent>
            </Card>
        </div>
    );
};

export default TodoPage;
