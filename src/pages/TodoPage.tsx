import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Task, Priority } from '../types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Clock,
  Zap,
  ListTodo,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { animateStagger } from '@/utils/motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AnimatedContainer from '@/components/AnimatedContainer';
import { Separator } from '@/components/ui/separator';

const priorityConfig = {
  [Priority.High]: {
    color: 'bg-red-500',
    icon: AlertTriangle,
    label: 'High',
  },
  [Priority.Medium]: {
    color: 'bg-yellow-500',
    icon: Clock,
    label: 'Medium',
  },
  [Priority.Low]: {
    color: 'bg-blue-500',
    icon: Zap,
    label: 'Low',
  },
};

const TaskItem: React.FC<{
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}> = ({ task, onToggle, onDelete, onEdit }) => {
  const priorityInfo = priorityConfig[task.priority];

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg p-3 transition-all',
        'hover:bg-muted/50',
        task.completed && 'opacity-50'
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className="mt-1 flex-shrink-0"
      >
        {task.completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
        )}
      </button>

      <div className="flex-grow">
        <p
          className={cn(
            'font-medium',
            task.completed && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div
              className={cn('h-2 w-2 rounded-full', priorityInfo.color)}
            ></div>
            <span>{priorityInfo.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4" />
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
  );
};

const TaskForm: React.FC<{
  onSave: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  existingTask?: Task | null;
  onCancel: () => void;
}> = ({ onSave, existingTask, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setPriority(existingTask.priority);
    } else {
      setTitle('');
      setDescription('');
      setPriority(Priority.Medium);
    }
  }, [existingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), priority });
    if (!existingTask) {
      setTitle('');
      setDescription('');
      setPriority(Priority.Medium);
    }
  };

  return (
    <AnimatedContainer>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>
              {existingTask ? 'Edit Task' : 'Create New Task'}
            </CardTitle>
            <CardDescription>
              {existingTask
                ? 'Update task details.'
                : 'Add a new task to your list.'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title *</label>
              <Input
                id="title"
                placeholder="e.g., Finalize project report"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                placeholder="Add a brief description..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={priority}
                onValueChange={(v: Priority) => setPriority(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Priority).map(p => (
                    <SelectItem key={p} value={p}>
                      <div className="flex items-center gap-2">
                        <priorityConfig[p].icon className="h-4 w-4" />
                        {priorityConfig[p].label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit">
                {existingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};

const TodoPage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } =
    useData();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (filter === 'pending') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [tasks, filter]);

  useEffect(() => {
    animateStagger('#task-list > *');
  }, [filteredTasks]);

  const handleSave = (
    taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>
  ) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setEditingTask(null);
    setIsFormVisible(false);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormVisible(true);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingTask(null);
  };

  return (
    <AnimatedContainer className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
          <p className="text-muted-foreground">
            Organize your life, one task at a time.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Your Tasks</CardTitle>
                  <CardDescription>
                    {filteredTasks.length} task(s) found.
                  </CardDescription>
                </div>
                <div className="flex gap-1 rounded-full border p-1">
                  {(['all', 'pending', 'completed'] as const).map(f => (
                    <Button
                      key={f}
                      variant={filter === f ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter(f)}
                      className="capitalize rounded-full"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                id="task-list"
                className="space-y-2 max-h-[60vh] overflow-y-auto pr-2"
              >
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task, idx) => (
                    <React.Fragment key={task.id}>
                      <TaskItem
                        task={task}
                        onToggle={toggleTaskCompletion}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                      {idx < filteredTasks.length - 1 && <Separator />}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                    <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-1">
                      All clear!
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      You have no {filter !== 'all' && filter} tasks.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {isFormVisible && (
            <TaskForm
              onSave={handleSave}
              existingTask={editingTask}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default TodoPage;