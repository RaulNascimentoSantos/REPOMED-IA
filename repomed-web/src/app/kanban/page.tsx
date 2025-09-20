'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Play,
  Pause,
  Upload,
  Download,
  Plus,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Trash2,
  Eye,
  RotateCcw,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Papa from 'papaparse';

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  tags: string[];
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  createdAt: string;
  updatedAt: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
}

interface Column {
  id: string;
  title: string;
  color: string;
  limit?: number;
  tasks: Task[];
}

interface PipelineJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  taskId: string;
  startedAt?: string;
  completedAt?: string;
  logs: string[];
  result?: any;
}

const initialColumns: Column[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-500', tasks: [] },
  { id: 'todo', title: 'A Fazer', color: 'bg-blue-500', tasks: [] },
  { id: 'in_progress', title: 'Em Progresso', color: 'bg-yellow-500', limit: 3, tasks: [] },
  { id: 'review', title: 'Revisão', color: 'bg-purple-500', limit: 2, tasks: [] },
  { id: 'done', title: 'Concluído', color: 'bg-green-500', tasks: [] }
];

const STORAGE_KEY = 'kanban_board_data';
const JOBS_STORAGE_KEY = 'pipeline_jobs';

export default function KanbanBoard() {
  const router = useRouter();

  // State
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [pipelineJobs, setPipelineJobs] = useState<PipelineJob[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showJobsPanel, setShowJobsPanel] = useState(false);
  const [isAutoTrigger, setIsAutoTrigger] = useState(true);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assignee: '',
    dueDate: '',
    tags: '',
    estimatedHours: 0
  });

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedJobs = localStorage.getItem(JOBS_STORAGE_KEY);

    if (savedData) {
      try {
        const parsedColumns = JSON.parse(savedData);
        setColumns(parsedColumns);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }

    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs);
        setPipelineJobs(parsedJobs);
      } catch (error) {
        console.error('Error loading saved jobs:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(pipelineJobs));
  }, [pipelineJobs]);

  // Auto-trigger pipeline for tasks moved to "done"
  const triggerPipeline = useCallback(async (task: Task) => {
    if (!isAutoTrigger) return;

    const jobId = `job_${Date.now()}_${task.id}`;
    const newJob: PipelineJob = {
      id: jobId,
      status: 'pending',
      taskId: task.id,
      logs: [`Pipeline iniciado para tarefa: ${task.title}`]
    };

    setPipelineJobs(prev => [...prev, newJob]);

    try {
      // Trigger pipeline via API
      const response = await fetch('/api/trigger-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          jobId,
          action: 'task_completed'
        })
      });

      if (response.ok) {
        setPipelineJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, status: 'running', startedAt: new Date().toISOString() }
            : job
        ));

        // Poll for job status
        pollJobStatus(jobId);
      } else {
        throw new Error('Failed to trigger pipeline');
      }
    } catch (error) {
      console.error('Pipeline trigger error:', error);
      setPipelineJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'failed', logs: [...job.logs, `Error: ${error}`] }
          : job
      ));
    }
  }, [isAutoTrigger]);

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/job-status/${jobId}`);
        if (response.ok) {
          const jobData = await response.json();

          setPipelineJobs(prev => prev.map(job =>
            job.id === jobId ? { ...job, ...jobData } : job
          ));

          if (jobData.status === 'completed' || jobData.status === 'failed') {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        clearInterval(pollInterval);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // Check WIP limits
    if (destColumn.limit && destColumn.tasks.length >= destColumn.limit && source.droppableId !== destination.droppableId) {
      alert(`Limite de ${destColumn.limit} tarefas atingido para a coluna "${destColumn.title}"`);
      return;
    }

    const task = sourceColumn.tasks.find(task => task.id === draggableId);
    if (!task) return;

    // Update task status and timestamp
    const updatedTask = {
      ...task,
      status: destination.droppableId as Task['status'],
      updatedAt: new Date().toISOString()
    };

    const newColumns = columns.map(column => {
      if (column.id === source.droppableId) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== draggableId)
        };
      } else if (column.id === destination.droppableId) {
        const newTasks = [...column.tasks];
        newTasks.splice(destination.index, 0, updatedTask);
        return {
          ...column,
          tasks: newTasks
        };
      }
      return column;
    });

    setColumns(newColumns);

    // Trigger pipeline if moved to "done"
    if (destination.droppableId === 'done' && source.droppableId !== 'done') {
      triggerPipeline(updatedTask);
    }
  };

  // Add new task
  const addTask = () => {
    if (!newTaskForm.title.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskForm.title,
      description: newTaskForm.description,
      priority: newTaskForm.priority,
      assignee: newTaskForm.assignee,
      dueDate: newTaskForm.dueDate,
      tags: newTaskForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      status: 'backlog',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedHours: newTaskForm.estimatedHours,
      actualHours: 0,
      dependencies: []
    };

    setColumns(prev => prev.map(col =>
      col.id === 'backlog'
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    ));

    // Reset form
    setNewTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      tags: '',
      estimatedHours: 0
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const allTasks = columns.flatMap(col => col.tasks);
    const csvData = allTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
      tags: task.tags.join(';'),
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dependencies: task.dependencies.join(';')
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `kanban_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Import from CSV
  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const importedTasks = results.data.map((row: any) => ({
          id: row.id || `task_${Date.now()}_${Math.random()}`,
          title: row.title || 'Untitled',
          description: row.description || '',
          status: row.status || 'backlog',
          priority: row.priority || 'medium',
          assignee: row.assignee || '',
          dueDate: row.dueDate || '',
          tags: row.tags ? row.tags.split(';') : [],
          estimatedHours: Number(row.estimatedHours) || 0,
          actualHours: Number(row.actualHours) || 0,
          createdAt: row.createdAt || new Date().toISOString(),
          updatedAt: row.updatedAt || new Date().toISOString(),
          dependencies: row.dependencies ? row.dependencies.split(';') : []
        }));

        // Group tasks by status and update columns
        const updatedColumns = columns.map(column => ({
          ...column,
          tasks: importedTasks.filter(task => task.status === column.id)
        }));

        setColumns(updatedColumns);
        alert(`${importedTasks.length} tarefas importadas com sucesso!`);
      },
      error: (error) => {
        console.error('CSV import error:', error);
        alert('Erro ao importar CSV. Verifique o formato do arquivo.');
      }
    });

    // Reset input
    event.target.value = '';
  };

  // Get priority color
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get job status icon
  const getJobStatusIcon = (status: PipelineJob['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <>
      <BackButton href="/" />
      <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 mb-6 hover:border-blue-500 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🎯 Kanban Pipeline Board</h1>
            <p className="text-slate-400">Sistema de gerenciamento visual com automação AI</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Auto-trigger toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Auto Pipeline</span>
              <button
                onClick={() => setIsAutoTrigger(!isAutoTrigger)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors transform hover:scale-105 duration-200 ${
                  isAutoTrigger ? 'bg-green-600' : 'bg-slate-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAutoTrigger ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Import/Export */}
            <input
              type="file"
              accept=".csv"
              onChange={importFromCSV}
              className="hidden"
              id="csv-import"
            />
            <label
              htmlFor="csv-import"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-all transform hover:scale-105 duration-200 group"
            >
              <Upload className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Importar CSV
            </label>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 duration-200 group"
            >
              <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Exportar CSV
            </button>

            {/* Analytics Link */}
            <button
              onClick={() => router.push('/relatorios')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 duration-200 group"
            >
              <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Analytics
            </button>

            {/* Jobs panel toggle */}
            <button
              onClick={() => setShowJobsPanel(!showJobsPanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 duration-200 group ${
                showJobsPanel
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <Activity className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Pipeline Jobs ({pipelineJobs.length})
            </button>
          </div>
        </div>

        {/* Quick add task */}
        <div className="mt-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1">Título da Tarefa</label>
              <input
                type="text"
                value={newTaskForm.title}
                onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o título da tarefa..."
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-slate-300 mb-1">Prioridade</label>
              <select
                value={newTaskForm.priority}
                onChange={(e) => setNewTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <button
              onClick={addTask}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 duration-200 group"
            >
              <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Kanban Board */}
        <div className={`${showJobsPanel ? 'flex-1' : 'w-full'} transition-all duration-300`}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {columns.map((column) => (
                <div key={column.id} className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all duration-300">
                  <div className={`${column.color} text-white p-4`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{column.title}</h3>
                      <div className="flex items-center gap-2">
                        {column.limit && (
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            {column.tasks.length}/{column.limit}
                          </span>
                        )}
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {column.tasks.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-4 min-h-[400px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-slate-700' : 'bg-slate-800'
                        }`}
                      >
                        {column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-slate-700 rounded-lg shadow-md p-4 mb-3 border-l-4 border-blue-500 transition-all hover:border-blue-400 cursor-pointer group ${
                                  snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105' : 'hover:shadow-lg hover:scale-105 hover:shadow-blue-500/20'
                                }`}
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowTaskModal(true);
                                }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-white flex-1 group-hover:text-blue-200 transition-colors">{task.title}</h4>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                </div>

                                {task.description && (
                                  <p className="text-sm text-slate-300 mb-3 line-clamp-2 group-hover:text-slate-200 transition-colors">{task.description}</p>
                                )}

                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span>{task.assignee || 'Não atribuído'}</span>
                                  {task.dueDate && (
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                                      {format(new Date(task.dueDate), 'dd/MM', { locale: ptBR })}
                                    </span>
                                  )}
                                </div>

                                {task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {task.tags.slice(0, 3).map((tag, i) => (
                                      <span key={i} className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded group-hover:bg-slate-500 transition-colors">
                                        {tag}
                                      </span>
                                    ))}
                                    {task.tags.length > 3 && (
                                      <span className="text-xs text-slate-400">+{task.tags.length - 3}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>

        {/* Pipeline Jobs Panel */}
        {showJobsPanel && (
          <div className="w-80 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Pipeline Jobs
              </h3>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {pipelineJobs.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Nenhum job em execução</p>
              ) : (
                pipelineJobs.slice().reverse().map(job => (
                  <div key={job.id} className="bg-slate-700 rounded-lg p-4 mb-3 border border-slate-600 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-white">Job #{job.id.slice(-6)}</span>
                      {getJobStatusIcon(job.status)}
                    </div>
                    <p className="text-xs text-slate-300 mb-2">Task: {job.taskId}</p>
                    {job.startedAt && (
                      <p className="text-xs text-slate-400">
                        Iniciado: {format(new Date(job.startedAt), 'HH:mm:ss', { locale: ptBR })}
                      </p>
                    )}
                    {job.completedAt && (
                      <p className="text-xs text-slate-400">
                        Concluído: {format(new Date(job.completedAt), 'HH:mm:ss', { locale: ptBR })}
                      </p>
                    )}
                    {job.logs.length > 0 && (
                      <div className="mt-2">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-slate-300 hover:text-white">Logs ({job.logs.length})</summary>
                          <div className="mt-1 bg-slate-900 text-green-400 p-2 rounded font-mono text-xs max-h-32 overflow-y-auto">
                            {job.logs.map((log, i) => (
                              <div key={i}>{log}</div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className="inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {selectedTask.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                  <p className="text-gray-900">{selectedTask.assignee || 'Não atribuído'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega</label>
                  <p className="text-gray-900">
                    {selectedTask.dueDate
                      ? format(new Date(selectedTask.dueDate), 'dd/MM/yyyy', { locale: ptBR })
                      : 'Não definida'
                    }
                  </p>
                </div>
              </div>

              {selectedTask.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedTask.description}</p>
                </div>
              )}

              {selectedTask.tags.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Criado em:</span>
                    <br />
                    {format(new Date(selectedTask.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                  <div>
                    <span className="font-medium">Atualizado em:</span>
                    <br />
                    {format(new Date(selectedTask.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}