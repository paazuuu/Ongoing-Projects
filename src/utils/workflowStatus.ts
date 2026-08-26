import { ProjectPriority, ProjectWorkflowStatus } from '../types';

export const WORKFLOW_STATUSES: ProjectWorkflowStatus[] = ['todo', 'in_progress', 'done'];

export const workflowStatusLabel = (status: ProjectWorkflowStatus): string => {
  switch (status) {
    case 'todo':
      return '未着手';
    case 'in_progress':
      return '進行中';
    case 'done':
      return '完了';
  }
};

export const workflowStatusColor = (status: ProjectWorkflowStatus): string => {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'done':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
  }
};

export const priorityLabel = (priority: ProjectPriority): string => {
  switch (priority) {
    case 'low':
      return '低';
    case 'medium':
      return '中';
    case 'high':
      return '高';
  }
};

export const priorityColor = (priority: ProjectPriority): string => {
  switch (priority) {
    case 'low':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
  }
};
